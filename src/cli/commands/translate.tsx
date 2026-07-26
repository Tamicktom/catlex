//* Libraries imports
import { render } from "ink";

//* Local imports
import { Confirm } from "../ui/Confirm.tsx";
import { TranslateReport } from "../ui/TranslateReport.tsx";
import { TRANSLATE_ALPHA_MESSAGE, countTranslatedKeys } from "../ui/translate-report-view.ts";
import {
  MissingOpenAiApiKeyError,
  assertOpenAiApiKey,
  createOpenAiTranslator,
} from "../../core/translate/openai.ts";
import { translateMissingKeys } from "../../core/translate/translate.ts";
import { writeTranslatedReports } from "../../core/translate/write-reports.ts";

//* Types imports
import type { TranslateLocaleFn } from "../../core/translate/translate.ts";
import type { TranslateResult } from "../../core/translate/translate.ts";

export type ConfirmFn = (message: string) => Promise<boolean>;

export type TranslateCommandOptions = {
  dir?: string;
  base?: string;
  cwd?: string;
  locale?: string[];
  model?: string;
  dryRun?: boolean;
  yes?: boolean;
  json?: boolean;
  confirm?: ConfirmFn;
  translateLocale?: TranslateLocaleFn;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
};

async function promptConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const instance = render(
      <Confirm
        message={message}
        onResolve={(accepted) => {
          if (settled) {
            return;
          }
          settled = true;
          instance.unmount();
          resolve(accepted);
        }}
      />,
    );
  });
}

function printJson(result: TranslateResult): void {
  const translatedCount = countTranslatedKeys(result);
  const payload = {
    ok: !result.cancelled,
    alpha: true,
    alphaMessage: TRANSLATE_ALPHA_MESSAGE,
    baseLocale: result.baseLocale,
    messagesDir: result.messagesDir,
    dryRun: result.dryRun,
    cancelled: result.cancelled,
    translatedCount,
    writtenFiles: result.writtenFiles,
    reports: result.reports,
  };

  console.log(JSON.stringify(payload, null, 2));
}

function renderReport(result: TranslateResult): void {
  const instance = render(<TranslateReport result={result} />);
  instance.unmount();
}

function emitOutput(result: TranslateResult, json: boolean): void {
  if (json) {
    printJson(result);
    return;
  }
  renderReport(result);
}

/**
 * Runs the alpha AI translate command.
 */
export async function runTranslateCommand(options: TranslateCommandOptions): Promise<number> {
  const cwd = options.cwd ?? process.cwd();
  const dryRun = options.dryRun === true;
  const yes = options.yes === true;
  const json = options.json === true;
  const confirm = options.confirm ?? promptConfirm;
  const env = options.env ?? process.env;

  try {
    assertOpenAiApiKey(env);
  } catch (error) {
    if (error instanceof MissingOpenAiApiKeyError) {
      console.error(`Error: ${error.message}`);
      return 1;
    }
    throw error;
  }

  const translateLocale =
    options.translateLocale ??
    createOpenAiTranslator({
      model: options.model,
      env,
    });

  let result = await translateMissingKeys({
    cwd,
    messagesDir: options.dir,
    baseLocale: options.base,
    locales: options.locale,
    dryRun: true,
    translateLocale,
  });

  const translatedCount = countTranslatedKeys(result);

  if (translatedCount === 0) {
    emitOutput({ ...result, dryRun }, json);
    return 0;
  }

  if (dryRun) {
    emitOutput(result, json);
    return 0;
  }

  if (!yes) {
    const accepted = await confirm(
      `Write ${translatedCount} translation(s) to ${result.reports.filter((report) => report.translated.length > 0).length} locale file(s)?`,
    );
    if (!accepted) {
      result = {
        ...result,
        cancelled: true,
        dryRun: false,
        writtenFiles: [],
      };
      emitOutput(result, json);
      return 0;
    }
  }

  const writtenFiles = await writeTranslatedReports(result.reports);
  result = {
    ...result,
    dryRun: false,
    cancelled: false,
    writtenFiles,
  };
  emitOutput(result, json);
  return 0;
}
