//* Libraries imports
import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

//* Local imports
import { runTranslateCommand } from "../../../src/cli/commands/translate.tsx";
import { TRANSLATE_ALPHA_MESSAGE } from "../../../src/cli/ui/translate-report-view.ts";

async function writeMessages(root: string, files: Record<string, unknown>): Promise<void> {
  const messagesDir = path.join(root, "messages");
  await mkdir(messagesDir, { recursive: true });
  for (const [name, tree] of Object.entries(files)) {
    await writeFile(
      path.join(messagesDir, `${name}.json`),
      `${JSON.stringify(tree, null, 2)}\n`,
      "utf8",
    );
  }
}

describe("runTranslateCommand", () => {
  const logSpies: Array<ReturnType<typeof spyOn>> = [];
  const errorSpies: Array<ReturnType<typeof spyOn>> = [];

  afterEach(() => {
    for (const spy of logSpies) {
      spy.mockRestore();
    }
    for (const spy of errorSpies) {
      spy.mockRestore();
    }
    logSpies.length = 0;
    errorSpies.length = 0;
  });

  function captureLog(): ReturnType<typeof spyOn> {
    const spy = spyOn(console, "log").mockImplementation(() => {});
    logSpies.push(spy);
    return spy;
  }

  function captureError(): ReturnType<typeof spyOn> {
    const spy = spyOn(console, "error").mockImplementation(() => {});
    errorSpies.push(spy);
    return spy;
  }

  it("returns 1 when OPENAI_API_KEY is missing", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "catlex-translate-cli-key-"));
    await writeMessages(cwd, {
      en: { welcome: "Welcome" },
      pt: {},
    });
    const error = captureError();

    const exitCode = await runTranslateCommand({
      cwd,
      json: true,
      env: {},
      translateLocale: async () => ({ locale: "pt", translations: [] }),
    });

    expect(exitCode).toBe(1);
    expect(String(error.mock.calls[0]?.[0])).toContain("OPENAI_API_KEY");
  });

  it("includes alpha fields in JSON output", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "catlex-translate-cli-alpha-"));
    await writeMessages(cwd, {
      en: { welcome: "Welcome" },
      pt: { welcome: "Bem-vindo" },
    });
    const log = captureLog();

    const exitCode = await runTranslateCommand({
      cwd,
      json: true,
      dryRun: true,
      env: { OPENAI_API_KEY: "sk-test" },
      translateLocale: async () => ({ locale: "pt", translations: [] }),
    });

    expect(exitCode).toBe(0);
    const payload = JSON.parse(String(log.mock.calls[0]?.[0]));
    expect(payload.alpha).toBe(true);
    expect(payload.alphaMessage).toBe(TRANSLATE_ALPHA_MESSAGE);
    expect(payload.translatedCount).toBe(0);
  });

  it("does not write files in dry-run mode", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "catlex-translate-cli-dry-"));
    await writeMessages(cwd, {
      en: { about: "About", welcome: "Welcome" },
      pt: { welcome: "Bem-vindo" },
    });
    const before = await readFile(path.join(cwd, "messages", "pt.json"), "utf8");
    const log = captureLog();

    const exitCode = await runTranslateCommand({
      cwd,
      json: true,
      dryRun: true,
      env: { OPENAI_API_KEY: "sk-test" },
      translateLocale: async (input) => ({
        locale: input.targetLocale,
        translations: input.missing.map((item) => ({
          path: item.path,
          value: `PT:${item.baseValue}`,
        })),
      }),
    });

    expect(exitCode).toBe(0);
    expect(await readFile(path.join(cwd, "messages", "pt.json"), "utf8")).toBe(before);
    const payload = JSON.parse(String(log.mock.calls[0]?.[0]));
    expect(payload.dryRun).toBe(true);
    expect(payload.translatedCount).toBe(1);
    expect(payload.writtenFiles).toEqual([]);
  });

  it("writes files when --yes is set without prompting", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "catlex-translate-cli-yes-"));
    await writeMessages(cwd, {
      en: { about: "About", welcome: "Welcome" },
      pt: { welcome: "Bem-vindo" },
    });
    const confirmMessages: string[] = [];
    captureLog();

    const exitCode = await runTranslateCommand({
      cwd,
      json: true,
      yes: true,
      env: { OPENAI_API_KEY: "sk-test" },
      confirm: async (message) => {
        confirmMessages.push(message);
        return false;
      },
      translateLocale: async () => ({
        locale: "pt",
        translations: [{ path: "about", value: "Sobre" }],
      }),
    });

    expect(exitCode).toBe(0);
    expect(confirmMessages).toEqual([]);
    expect(JSON.parse(await readFile(path.join(cwd, "messages", "pt.json"), "utf8"))).toEqual({
      welcome: "Bem-vindo",
      about: "Sobre",
    });
  });

  it("leaves files unchanged when confirm is declined", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "catlex-translate-cli-no-"));
    await writeMessages(cwd, {
      en: { about: "About", welcome: "Welcome" },
      pt: { welcome: "Bem-vindo" },
    });
    const before = await readFile(path.join(cwd, "messages", "pt.json"), "utf8");
    const log = captureLog();

    const exitCode = await runTranslateCommand({
      cwd,
      json: true,
      env: { OPENAI_API_KEY: "sk-test" },
      confirm: async () => false,
      translateLocale: async () => ({
        locale: "pt",
        translations: [{ path: "about", value: "Sobre" }],
      }),
    });

    expect(exitCode).toBe(0);
    expect(await readFile(path.join(cwd, "messages", "pt.json"), "utf8")).toBe(before);
    const payload = JSON.parse(String(log.mock.calls[0]?.[0]));
    expect(payload.cancelled).toBe(true);
    expect(payload.writtenFiles).toEqual([]);
  });
});
