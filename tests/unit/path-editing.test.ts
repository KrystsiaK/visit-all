import { describe, expect, it } from "vitest";
import { removePathPoint } from "../../src/lib/path-editing";

describe("path editing helpers", () => {
  it("removes the selected point from the path", () => {
    const path = [
      { lng: 1, lat: 1 },
      { lng: 2, lat: 2 },
      { lng: 3, lat: 3 },
    ];

    expect(removePathPoint(path, 1)).toEqual([
      { lng: 1, lat: 1 },
      { lng: 3, lat: 3 },
    ]);
  });

  it("returns the same path when index is out of bounds", () => {
    const path = [
      { lng: 1, lat: 1 },
      { lng: 2, lat: 2 },
    ];

    expect(removePathPoint(path, -1)).toBe(path);
    expect(removePathPoint(path, 2)).toBe(path);
  });
});
