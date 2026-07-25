//* Libraries imports
import { describe, expect, it } from "bun:test";

//* Local imports
import { isLikelyUserVisible } from "../../src/core/scan/filters.ts";

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
