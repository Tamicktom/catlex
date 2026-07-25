//* Libraries imports
import { Command } from "commander";

//* Local imports
import { runScanCommand } from "./commands/scan.tsx";
import { runValidateCommand } from "./commands/validate.tsx";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("catlex")
    .description(
      "CLI to validate next-intl translation JSON files and scan JSX/TSX for hardcoded strings",
    )
    .version("0.0.3");

  program
    .command("validate")
    .description("Validate translation JSON files against the base locale (default: en.json)")
    .option("--dir <path>", "Messages directory relative to cwd")
    .option("--base <locale>", "Base locale file stem (e.g. en)")
    .option("--cwd <path>", "Project root directory", process.cwd())
    .option("--strict-extra", "Treat keys missing from the base locale as errors", false)
    .option("--json", "Print machine-readable JSON instead of Ink UI", false)
    .action(async (options) => {
      try {
        const exitCode = await runValidateCommand({
          dir: options.dir,
          base: options.base,
          cwd: options.cwd,
          strictExtra: options.strictExtra === true,
          json: options.json === true,
        });
        process.exitCode = exitCode;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${message}`);
        process.exitCode = 1;
      }
    });

  program
    .command("scan")
    .description("Scan JSX/TSX for hardcoded user-visible strings (alpha)")
    .option("--dir <path>", "Source root directory relative to cwd", ".")
    .option("--cwd <path>", "Project root directory", process.cwd())
    .option("--json", "Print machine-readable JSON instead of Ink UI", false)
    .action(async (options) => {
      try {
        const exitCode = await runScanCommand({
          dir: options.dir,
          cwd: options.cwd,
          json: options.json === true,
        });
        process.exitCode = exitCode;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${message}`);
        process.exitCode = 1;
      }
    });

  return program;
}
