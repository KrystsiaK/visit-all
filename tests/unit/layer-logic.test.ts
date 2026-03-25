import { describe, expect, it } from "vitest";
import {
  modeToCollectionType,
  moveCollectionToTop,
  shouldAutoOpenLayerDrawer,
} from "../../src/lib/layer-logic";

const collections = [
  { id: "a" },
  { id: "b" },
  { id: "c" },
];

describe("layer logic spec", () => {
  it("maps interaction modes to collection types", () => {
    expect(modeToCollectionType("pin")).toBe("pin");
    expect(modeToCollectionType("editPin")).toBe("pin");
    expect(modeToCollectionType("trace")).toBe("trace");
    expect(modeToCollectionType("editTrace")).toBe("trace");
    expect(modeToCollectionType("area")).toBe("area");
    expect(modeToCollectionType("editArea")).toBe("area");
  });

  it("moves the selected collection to the top while preserving others", () => {
    expect(moveCollectionToTop(collections, "c").map((item) => item.id)).toEqual(["c", "a", "b"]);
    expect(moveCollectionToTop(collections, "a").map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(moveCollectionToTop(collections, "missing").map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  it("auto-opens the mobile drawer only when layer confirmation is needed", () => {
    expect(shouldAutoOpenLayerDrawer(true, "pin", true, false)).toBe(true);
    expect(shouldAutoOpenLayerDrawer(true, "trace", false, true)).toBe(true);
    expect(shouldAutoOpenLayerDrawer(true, "trace", false, false)).toBe(false);
    expect(shouldAutoOpenLayerDrawer(false, "pin", true, false)).toBe(false);
  });
});
