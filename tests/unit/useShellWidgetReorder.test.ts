import { describe, expect, it } from "vitest";

import {
  getAutoScrollVelocity,
  getWidgetHoverScrollVelocity,
} from "@synarava/shell-kit";

describe("getAutoScrollVelocity", () => {
  it("returns negative velocity near the top edge", () => {
    expect(
      getAutoScrollVelocity({
        pointerY: 110,
        containerTop: 100,
        containerBottom: 500,
      })
    ).toBeLessThan(0);
  });

  it("returns positive velocity near the bottom edge", () => {
    expect(
      getAutoScrollVelocity({
        pointerY: 490,
        containerTop: 100,
        containerBottom: 500,
      })
    ).toBeGreaterThan(0);
  });

  it("returns zero velocity when the pointer stays in the safe middle zone", () => {
    expect(
      getAutoScrollVelocity({
        pointerY: 300,
        containerTop: 100,
        containerBottom: 500,
      })
    ).toBe(0);
  });
});

describe("getWidgetHoverScrollVelocity", () => {
  it("nudges scroll downward when dragging after a widget near the bottom of the container", () => {
    expect(
      getWidgetHoverScrollVelocity({
        targetTop: 410,
        targetBottom: 490,
        containerTop: 100,
        containerBottom: 500,
        edge: "after",
      })
    ).toBeGreaterThan(0);
  });

  it("nudges scroll upward when dragging before a widget near the top of the container", () => {
    expect(
      getWidgetHoverScrollVelocity({
        targetTop: 120,
        targetBottom: 210,
        containerTop: 100,
        containerBottom: 500,
        edge: "before",
      })
    ).toBeLessThan(0);
  });

  it("stays idle when the hovered widget has enough room around the intended drop edge", () => {
    expect(
      getWidgetHoverScrollVelocity({
        targetTop: 220,
        targetBottom: 300,
        containerTop: 100,
        containerBottom: 500,
        edge: "after",
      })
    ).toBe(0);
  });
});
