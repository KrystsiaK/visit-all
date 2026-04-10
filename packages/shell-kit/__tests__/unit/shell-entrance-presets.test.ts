import { describe, expect, it } from "vitest";
import {
  shellEntrancePresets,
  resolveShellEntrance,
  type ShellEntranceName,
} from "../../src/lib/shell-entrance-presets";

const ALL_PRESETS: ShellEntranceName[] = [
  "overlay",
  "slide-left",
  "slide-right",
  "slide-top",
  "slide-bottom",
];

describe("shellEntrancePresets", () => {
  it("has an entry for every ShellEntranceName", () => {
    for (const name of ALL_PRESETS) {
      expect(shellEntrancePresets[name]).toBeDefined();
      expect(shellEntrancePresets[name].shell).toBeDefined();
      expect(shellEntrancePresets[name].section).toBeDefined();
    }
  });

  it("each preset has hidden/visible/exit keys on shell variants", () => {
    for (const name of ALL_PRESETS) {
      const { shell } = shellEntrancePresets[name];
      expect(shell).toHaveProperty("hidden");
      expect(shell).toHaveProperty("visible");
      expect(shell).toHaveProperty("exit");
    }
  });
});

describe("resolveShellEntrance", () => {
  it("returns overlay preset by default (no args)", () => {
    const result = resolveShellEntrance(undefined, undefined, undefined);
    expect(result).toBe(shellEntrancePresets.overlay);
  });

  it("returns the named preset when entrance is specified", () => {
    const result = resolveShellEntrance("slide-left", undefined, undefined);
    expect(result).toBe(shellEntrancePresets["slide-left"]);
  });

  it("prefers custom shellVariants over entrance name", () => {
    const custom = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    const result = resolveShellEntrance("slide-left", custom, undefined);
    expect(result.shell).toBe(custom);
    expect(result.section).toBe(shellEntrancePresets.overlay.section);
  });

  it("uses custom sectionVariants when provided with shellVariants", () => {
    const customShell = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    const customSection = { hidden: { y: -10 }, visible: { y: 0 } };
    const result = resolveShellEntrance(undefined, customShell, customSection);
    expect(result.shell).toBe(customShell);
    expect(result.section).toBe(customSection);
  });
});

