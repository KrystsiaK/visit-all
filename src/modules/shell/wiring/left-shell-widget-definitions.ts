import { createWidgetRegistry, defineWidget } from "@synarava/wiring-engine";

import { ShellClockWidget } from "@/components/widgets/shell-widgets/ShellClockWidget";
import { ShellCollectionsWidget } from "@/components/widgets/shell-widgets/ShellCollectionsWidget";
import { ShellControlsWidget } from "@/components/widgets/shell-widgets/ShellControlsWidget";
import { ShellCreateCollectionWidget } from "@/components/widgets/shell-widgets/ShellCreateCollectionWidget";
import { ShellFinishTraceWidget } from "@/components/widgets/shell-widgets/ShellFinishTraceWidget";
import { ShellModeSwitchWidget } from "@/components/widgets/shell-widgets/ShellModeSwitchWidget";
import { ShellNotesWidget } from "@/components/widgets/shell-widgets/ShellNotesWidget";
import { ShellRemoveTracePointWidget } from "@/components/widgets/shell-widgets/ShellRemoveTracePointWidget";
import { ShellResetViewWidget } from "@/components/widgets/shell-widgets/ShellResetViewWidget";
import { ShellSearchWidget } from "@/components/widgets/shell-widgets/ShellSearchWidget";

export const leftShellWidgetDefinitions = [
  defineWidget({
    key: "shell_search",
    name: "Search",
    description: "Emits the collection search query.",
    ports: [
      { portKey: "query_out", direction: "output", valueType: "string", label: "Query" },
    ],
    Component: ShellSearchWidget,
    ui: { color: "#f59e0b", icon: "search" },
  }),
  defineWidget({
    key: "shell_mode_switch",
    name: "Mode Switch",
    description: "Selects the active map interaction mode.",
    ports: [
      { portKey: "mode_in", direction: "input", valueType: "string", label: "Active Mode" },
      { portKey: "mode_out", direction: "output", valueType: "string", label: "Requested Mode" },
      { portKey: "locked_in", direction: "input", valueType: "boolean", label: "Locked" },
      { portKey: "route_mode_in", direction: "input", valueType: "string", label: "Path Routing" },
      { portKey: "route_mode_out", direction: "output", valueType: "string", label: "Requested Path Routing" },
      { portKey: "routing_pending_in", direction: "input", valueType: "boolean", label: "Routing Pending" },
      { portKey: "routing_error_in", direction: "input", valueType: "string", label: "Routing Error" },
    ],
    Component: ShellModeSwitchWidget,
    ui: { color: "#8b5cf6", icon: "layers" },
  }),
  defineWidget({
    key: "shell_collections",
    name: "Collections",
    description: "Displays collections filtered by wired shell signals.",
    ports: [
      { portKey: "query_in", direction: "input", valueType: "string", label: "Filter Query" },
    ],
    Component: ShellCollectionsWidget,
    ui: { color: "#3b82f6", icon: "collections" },
  }),
  defineWidget({
    key: "shell_controls",
    name: "Map Controls",
    ports: [],
    Component: ShellControlsWidget,
    ui: { color: "#10b981", icon: "sliders" },
  }),
  defineWidget({
    key: "shell_create_collection",
    name: "Create Collection",
    ports: [],
    Component: ShellCreateCollectionWidget,
    ui: { color: "#ec4899", icon: "plus" },
  }),
  defineWidget({
    key: "shell_reset_view",
    name: "Reset View",
    ports: [],
    Component: ShellResetViewWidget,
  }),
  defineWidget({
    key: "shell_finish_trace",
    name: "Finish Geometry",
    ports: [],
    Component: ShellFinishTraceWidget,
  }),
  defineWidget({
    key: "shell_remove_trace_point",
    name: "Geometry Draft Controls",
    description: "Undoes the latest point or cancels the active geometry draft.",
    ports: [],
    Component: ShellRemoveTracePointWidget,
  }),
  defineWidget({
    key: "shell_notes",
    name: "Notes",
    ports: [],
    Component: ShellNotesWidget,
  }),
  defineWidget({
    key: "shell_clock",
    name: "Clock",
    ports: [],
    Component: ShellClockWidget,
  }),
] as const;

export const leftShellWidgetRegistry = createWidgetRegistry().registerMany([
  ...leftShellWidgetDefinitions,
]);
