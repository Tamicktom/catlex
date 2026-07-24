# catlex

CLI to validate [next-intl](https://next-intl.dev/)-style translation JSON files against a base locale.

Catch missing keys before they hit production, and optionally fail on keys that exist only in a locale file.

## Install

Linux x64:

```bash
curl -fsSL https://github.com/Tamicktom/catlex/releases/latest/download/install.sh | bash
```

Pin a version:

```bash
curl -fsSL https://github.com/Tamicktom/catlex/releases/download/v0.0.1/install.sh | CATLEX_VERSION=0.0.1 bash
```

The binary is installed to `~/.local/bin/catlex`. Make sure `~/.local/bin` is on your `PATH`.

## Quick start

With a messages directory like this:

```text
messages/
  en.json
  pt.json
  es.json
```

Run:

```bash
catlex validate
```

By default catlex looks for `messages/` and treats `en.json` as the base locale.

## What it checks

| Issue | Meaning | Default |
|-------|---------|---------|
| **Missing** | Key exists in the base locale but not in another locale | Error |
| **Extra** | Key exists in a locale but not in the base | Warning |

Use `--strict-extra` to treat extra keys as errors.

## Usage

```bash
catlex validate [options]
```

| Option | Description |
|--------|-------------|
| `--dir <path>` | Messages directory relative to the project root |
| `--base <locale>` | Base locale file stem (e.g. `en` → `en.json`) |
| `--cwd <path>` | Project root (default: current directory) |
| `--strict-extra` | Treat extra keys as errors |
| `--json` | Print JSON instead of the interactive terminal UI |

Examples:

```bash
catlex validate
catlex validate --dir locales --base en
catlex validate --strict-extra
catlex validate --json
```

## Configuration

Optional. Place a config file in the project root. First match wins:

1. `catlex.config.json`
2. `catlex.config.js`
3. `catlex.config.mjs`
4. `catlex.config.ts`

CLI flags override the config file. Defaults:

| Field | Default |
|-------|---------|
| `messagesDir` | `"messages"` |
| `baseLocale` | `"en"` |
| `strictExtra` | `false` |

Example `catlex.config.json`:

```json
{
  "messagesDir": "messages",
  "baseLocale": "en",
  "strictExtra": false
}
```

## Exit codes and CI

| Code | Meaning |
|------|---------|
| `0` | Validation passed |
| `1` | Validation failed or an error occurred |

For pipelines, prefer `--json`:

```bash
catlex validate --json
```

## Building from source

Requires [Bun](https://bun.sh/):

```bash
bun install
bun run build   # → dist/catlex
```

Contributor and agent notes: [AGENTS.md](AGENTS.md).
