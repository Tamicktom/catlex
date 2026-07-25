//* Libraries imports
import path from "node:path";
import { render } from "ink";

//* Local imports
import { ScanReport } from "../ui/ScanReport.tsx";
import { SCAN_ALPHA_MESSAGE } from "../ui/scan-report-view.ts";
import { scanHardcoded } from "../../core/scan/scan.ts";

//* Types imports
import type { ScanResult } from "../../core/scan/types.ts";

export type ScanCommandOptions = {
  dir?: string;
  cwd?: string;
  json?: boolean;
};

function printJson(result: ScanResult, failed: boolean): void {
  const payload = {
    ok: !failed,
    alpha: true,
    alphaMessage: SCAN_ALPHA_MESSAGE,
    rootDir: result.rootDir,
    issues: result.issues,
  };

  console.log(JSON.stringify(payload, null, 2));
}

export async function runScanCommand(options: ScanCommandOptions): Promise<number> {
  const cwd = options.cwd ?? process.cwd();
  const dir = options.dir ?? ".";
  const rootDir = path.resolve(cwd, dir);

  const result = await scanHardcoded(rootDir);
  const failed = result.issues.length > 0;

  if (options.json) {
    printJson(result, failed);
  } else {
    const instance = render(<ScanReport result={result} />);
    instance.unmount();
  }

  return failed ? 1 : 0;
}
