# AGENTS.md

Guidance for AI agents and humans working on **catlex**.

## Project overview

catlex is a Bun/TypeScript CLI that validates next-intl-style translation JSON files against a base locale.

- Runtime: **Bun** only (tests, scripts, compile)
- CLI: **commander**
- Terminal UI: **Ink** + React
- Config: **zod**
- Package is `"private": true` — no npm publish flow

User-facing docs live in [README.md](README.md).

## Layout

```text
src/
  bin/catlex.ts          # CLI entry
  index.ts               # Public library exports
  cli/                   # Commander program, commands, Ink UI
  core/                  # Config, messages, validators, orchestration
tests/                   # Mirrors src/core areas
  fixtures/              # Sample message JSON
scripts/install.sh       # Release installer
.github/workflows/       # test, build, release
```

Flow: `bin` → `cli` → `core`. Keep business logic in `src/core`; keep CLI/UI in `src/cli`.

## Commands

```bash
bun install
bun test
bun run build
bun run validate
bun run dev
```

After changing tests, run the affected file in isolation and the full suite:

```bash
bun test tests/path/to/file.test.ts
bun test
```

## Architecture rules

- Put validation and I/O logic under `src/core`, not in React/Ink components.
- To add a validator: implement `Validator` in `src/core/validators/`, register it in `src/core/validators/registry.ts`, and add tests under `tests/`.
- Public API changes must update `src/index.ts` exports.
- Config merge order: defaults < config file < CLI flags (`src/core/config/load.ts`).

## Coding conventions

- Organize imports with section comments:

  ```ts
  //* Libraries imports
  //* Local imports
  //* Types imports
  ```

- Use explicit `.ts` / `.tsx` extensions in imports.
- Use `import type` for type-only imports.
- Do not destructure props in React component signatures (e.g. `function Report(props) { ... }`).
- Every button should have `id` and `type`.
- Prefer padding over margin in styles.
- Tests use BDD-style `describe` / `it` with behavior-focused names.
- All identifiers, comments, and documentation must be in English.
- TypeScript is strict (`noUncheckedIndexedAccess`, `noImplicitOverride`).

## Do not

- Invent an npm publish workflow while the package remains `"private": true`.
- Let the CLI version in `src/cli/program.ts` drift from `package.json` (the release workflow updates both).
- Add eslint, prettier, or biome unless explicitly asked.
- Claim multi-OS release binaries; only Linux x64 (`catlex-linux-x64`) is published today.

## Releases

Releases are created manually with `workflow_dispatch` on `main`. Do not cut a release unless the user asks.
