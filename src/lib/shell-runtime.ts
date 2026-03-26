import type { WidgetComponentKey, WidgetInstanceRecord, WidgetPlacementRecord } from "@/lib/widgets";

export const shellEntranceTimeoutMs = 420;

export function isLeftShellWidgetEnabled(
  componentKey: WidgetComponentKey,
  sections: {
    search: boolean;
    modeSwitch: boolean;
    collections: boolean;
    controls: boolean;
    actions: boolean;
  }
) {
  switch (componentKey) {
    case "shell_search":
      return sections.search;
    case "shell_mode_switch":
      return sections.modeSwitch;
    case "shell_collections":
      return sections.collections;
    case "shell_controls":
      return sections.controls;
    case "shell_actions":
    case "shell_create_collection":
    case "shell_reset_view":
    case "shell_finish_trace":
    case "shell_remove_trace_point":
      return sections.actions;
    default:
      return false;
  }
}

export function getVisibleShellWidgets(
  widgets: Array<WidgetPlacementRecord & WidgetInstanceRecord>,
  sections: Parameters<typeof isLeftShellWidgetEnabled>[1]
) {
  return widgets.filter((widget) => isLeftShellWidgetEnabled(widget.componentKey, sections));
}
