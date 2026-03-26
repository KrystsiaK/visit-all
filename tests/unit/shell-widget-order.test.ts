import { describe, expect, it } from "vitest";
import { moveShellWidget, type ShellWidgetRecord } from "@/lib/shell-widget-order";

const createWidget = (id: string, position: number): ShellWidgetRecord => ({
  id,
  shellInstanceId: "shell-1",
  widgetInstanceId: `widget-${id}`,
  slot: "main",
  position,
  definitionId: `definition-${id}`,
  slug: id,
  name: id,
  layer: "shell",
  entityType: null,
  entityId: null,
  componentKey: "shell_search",
  config: {},
  state: {},
});

describe("moveShellWidget", () => {
  it("moves a widget before the target and rewrites positions", () => {
    const widgets = [
      createWidget("a", 0),
      createWidget("b", 1),
      createWidget("c", 2),
    ];

    const next = moveShellWidget(widgets, "c", "a", "before");

    expect(next.map((widget) => widget.id)).toEqual(["c", "a", "b"]);
    expect(next.map((widget) => widget.position)).toEqual([0, 1, 2]);
  });

  it("moves a widget after the target and rewrites positions", () => {
    const widgets = [
      createWidget("a", 0),
      createWidget("b", 1),
      createWidget("c", 2),
    ];

    const next = moveShellWidget(widgets, "a", "c", "after");

    expect(next.map((widget) => widget.id)).toEqual(["b", "c", "a"]);
    expect(next.map((widget) => widget.position)).toEqual([0, 1, 2]);
  });

  it("returns the same array when dragging onto itself", () => {
    const widgets = [
      createWidget("a", 0),
      createWidget("b", 1),
    ];

    const next = moveShellWidget(widgets, "a", "a", "before");

    expect(next).toBe(widgets);
  });
});
