import { describe, expect, it } from "vitest";

import { getWidgetPlacementPolicy, getWidgetPlacementState } from "@/lib/widget-placement";

describe("widget placement policy", () => {
  it("marks entity_info as a required fixed widget", () => {
    const policy = getWidgetPlacementPolicy({
      layer: "entity",
      slug: "entity_info",
      componentKey: "entity_info",
      supportedEntityTypes: ["pin", "trace", "area"],
    }, "pin");

    expect(policy.mode).toBe("required_fixed");
    expect(policy.managedBySystem).toBe(true);
    expect(policy.removable).toBe(false);
    expect(policy.hosts).toEqual(["pin_entity_shell"]);
  });

  it("marks gallery as a single fixed host widget for the active entity shell", () => {
    const policy = getWidgetPlacementPolicy({
      layer: "entity",
      slug: "entity_gallery",
      componentKey: "entity_gallery",
      supportedEntityTypes: ["pin", "trace", "area"],
    }, "trace");

    expect(policy.mode).toBe("single_fixed_host");
    expect(policy.hosts).toEqual(["trace_entity_shell"]);
    expect(policy.removable).toBe(true);
  });

  it("disables add when a fixed widget is already placed", () => {
    const state = getWidgetPlacementState(
      {
        mode: "single_fixed_host",
        hosts: ["pin_entity_shell"],
        removable: true,
        reorderable: false,
        managedBySystem: false,
      },
      ["pin_entity_shell"]
    );

    expect(state.canAdd).toBe(false);
    expect(state.actionMode).toBe("unavailable");
    expect(state.disabledReason).toContain("Already placed");
  });

  it("describes multi-host widgets as choose-many", () => {
    const state = getWidgetPlacementState(
      {
        mode: "multi_host",
        hosts: ["left_sidebar", "widget_center"],
        removable: true,
        reorderable: false,
        managedBySystem: false,
      },
      ["left_sidebar"]
    );

    expect(state.canAdd).toBe(true);
    expect(state.actionMode).toBe("choose-many");
    expect(state.availableHosts).toEqual(["widget_center"]);
  });
});
