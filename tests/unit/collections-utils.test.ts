import { describe, expect, it } from "vitest";
import type { Collection } from "@/app/page";
import { getSelectionActionLabel, isCollectionDirty, moveCollectionToFront } from "@/components/widgets/shell-widgets/collections/utils";

const makeCollection = (overrides: Partial<Collection> = {}): Collection => ({
  id: "c1",
  name: "Collection",
  color: "#0000ff",
  icon: "!",
  itemCount: 3,
  ...overrides,
});

describe("collections utils", () => {
  describe("getSelectionActionLabel", () => {
    it("returns Pin for pin modes", () => {
      expect(getSelectionActionLabel("pin")).toBe("Pin");
      expect(getSelectionActionLabel("editPin")).toBe("Pin");
    });

    it("returns Path for trace modes", () => {
      expect(getSelectionActionLabel("trace")).toBe("Path");
      expect(getSelectionActionLabel("editTrace")).toBe("Path");
    });

    it("returns Zone for area modes", () => {
      expect(getSelectionActionLabel("area")).toBe("Zone");
      expect(getSelectionActionLabel("editArea")).toBe("Zone");
    });
  });

  describe("isCollectionDirty", () => {
    it("returns false when draft or baseline is missing", () => {
      expect(isCollectionDirty(null, makeCollection())).toBe(false);
      expect(isCollectionDirty(makeCollection(), null)).toBe(false);
    });

    it("returns false when collection fields are unchanged", () => {
      const baseline = makeCollection();
      const draft = makeCollection();

      expect(isCollectionDirty(draft, baseline)).toBe(false);
    });

    it("returns true when name changes", () => {
      expect(isCollectionDirty(makeCollection({ name: "Next" }), makeCollection())).toBe(true);
    });

    it("returns true when color changes", () => {
      expect(isCollectionDirty(makeCollection({ color: "#ff0000" }), makeCollection())).toBe(true);
    });

    it("returns true when icon changes", () => {
      expect(isCollectionDirty(makeCollection({ icon: "*" }), makeCollection())).toBe(true);
    });
  });

  describe("moveCollectionToFront", () => {
    const c1 = makeCollection({ id: "c1", name: "One" });
    const c2 = makeCollection({ id: "c2", name: "Two" });
    const c3 = makeCollection({ id: "c3", name: "Three" });

    it("returns the same array when collection is already first", () => {
      const collections = [c1, c2, c3];

      expect(moveCollectionToFront(collections, "c1")).toBe(collections);
    });

    it("returns the same array when collection is missing", () => {
      const collections = [c1, c2, c3];

      expect(moveCollectionToFront(collections, "missing")).toBe(collections);
    });

    it("moves a non-first collection to the front", () => {
      const collections = [c1, c2, c3];

      expect(moveCollectionToFront(collections, "c3")).toEqual([c3, c1, c2]);
    });
  });
});
