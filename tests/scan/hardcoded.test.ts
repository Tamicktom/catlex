//* Libraries imports
import { describe, expect, it } from "bun:test";
import path from "node:path";

//* Local imports
import { isLikelyUserVisible } from "../../src/core/scan/filters.ts";
import { scanHardcoded } from "../../src/core/scan/scan.ts";
import type { HardcodedIssue } from "../../src/core/scan/types.ts";

const fixturesRoot = path.join(
  import.meta.dir,
  "..",
  "fixtures",
  "source",
  "hardcoded",
);

function issuesForFile(
  issues: HardcodedIssue[],
  fileName: string,
): HardcodedIssue[] {
  return issues.filter((issue) => path.basename(issue.filePath) === fileName);
}

describe("isLikelyUserVisible", () => {
  it("returns true for ordinary user-facing copy", () => {
    expect(isLikelyUserVisible("Save")).toBe(true);
    expect(isLikelyUserVisible("  Hello world  ")).toBe(true);
  });

  it("returns false for whitespace-only text", () => {
    expect(isLikelyUserVisible(" ")).toBe(false);
    expect(isLikelyUserVisible("\n\t")).toBe(false);
    expect(isLikelyUserVisible("")).toBe(false);
  });

  it("returns false for punctuation-only text", () => {
    expect(isLikelyUserVisible("—")).toBe(false);
    expect(isLikelyUserVisible("...")).toBe(false);
  });

  it("returns false for emoji-only text", () => {
    expect(isLikelyUserVisible("🎉")).toBe(false);
  });

  it("returns false for numeric-only text", () => {
    expect(isLikelyUserVisible("42")).toBe(false);
  });
});

describe("scanHardcoded", () => {
  it("flags hardcoded JSX text in a button", async () => {
    const result = await scanHardcoded(fixturesRoot);
    const issues = issuesForFile(result.issues, "text-basic.tsx");

    expect(issues).toEqual([
      expect.objectContaining({
        kind: "jsx-text",
        text: "Save",
        line: 2,
      }),
    ]);
  });

  it("flags hardcoded JSX text in a .jsx file", async () => {
    const result = await scanHardcoded(fixturesRoot);
    const issues = issuesForFile(result.issues, "text-basic.jsx");

    expect(issues).toEqual([
      expect.objectContaining({
        kind: "jsx-text",
        text: "Cancel",
        line: 2,
      }),
    ]);
  });

  it("does not flag text already passed through t()", async () => {
    const result = await scanHardcoded(fixturesRoot);
    const issues = issuesForFile(result.issues, "text-with-t.tsx");

    expect(issues).toEqual([]);
  });

  it("flags user-facing attribute string literals", async () => {
    const result = await scanHardcoded(fixturesRoot);
    const issues = issuesForFile(result.issues, "attr-placeholder.tsx");

    expect(issues).toEqual([
      expect.objectContaining({
        kind: "jsx-attribute",
        attributeName: "placeholder",
        text: "Email",
        line: 2,
      }),
    ]);
  });

  it("does not flag non-user-facing attributes like className", async () => {
    const result = await scanHardcoded(fixturesRoot);
    const issues = issuesForFile(result.issues, "attr-classname.tsx");

    expect(issues).toEqual([]);
  });

  it("flags string literals inside JSX expression containers", async () => {
    const result = await scanHardcoded(fixturesRoot);
    const issues = issuesForFile(result.issues, "expression-string.tsx");

    expect(issues).toEqual([
      expect.objectContaining({
        kind: "jsx-text",
        text: "Hello",
        line: 2,
      }),
    ]);
  });

  it("does not flag whitespace, punctuation, emoji, or numeric-only text", async () => {
    const result = await scanHardcoded(fixturesRoot);
    const issues = issuesForFile(result.issues, "whitespace-only.tsx");

    expect(issues).toEqual([]);
  });

  it("does not flag text inside a Trans component", async () => {
    const result = await scanHardcoded(fixturesRoot);
    const issues = issuesForFile(result.issues, "trans-component.tsx");

    expect(issues).toEqual([]);
  });

  it("reports every obvious hardcoded string in a mixed file", async () => {
    const result = await scanHardcoded(fixturesRoot);
    const issues = issuesForFile(result.issues, "mixed.tsx");

    expect(issues).toHaveLength(4);
    expect(issues).toContainEqual(
      expect.objectContaining({
        kind: "jsx-text",
        text: "Welcome",
      }),
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        kind: "jsx-attribute",
        attributeName: "placeholder",
        text: "Your name",
      }),
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        kind: "jsx-attribute",
        attributeName: "aria-label",
        text: "Name field",
      }),
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        kind: "jsx-attribute",
        attributeName: "alt",
        text: "Logo",
      }),
    );
  });
});
