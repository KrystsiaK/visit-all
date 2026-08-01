import type { SystemBinding, WiringConfig } from "@synarava/wiring-engine";

export const LEFT_SHELL_SYSTEM_BINDINGS: SystemBinding[] = [
  {
    busKey: "collectionQuery",
    label: "Collection Filter",
    source: { widgetKey: "shell_search", portKey: "query_out" },
    sinks: [{ widgetKey: "shell_collections", portKey: "query_in" }],
  },
  {
    busKey: "interactionMode",
    label: "Active Interaction Mode",
    source: null,
    sinks: [{ widgetKey: "shell_mode_switch", portKey: "mode_in" }],
  },
  {
    busKey: "interactionModeRequest",
    label: "Requested Interaction Mode",
    source: { widgetKey: "shell_mode_switch", portKey: "mode_out" },
    sinks: [],
  },
  {
    busKey: "interactionLocked",
    label: "Interaction Locked",
    source: null,
    sinks: [{ widgetKey: "shell_mode_switch", portKey: "locked_in" }],
  },
  {
    busKey: "traceRoutingMode",
    label: "Path Routing Mode",
    source: null,
    sinks: [{ widgetKey: "shell_mode_switch", portKey: "route_mode_in" }],
  },
  {
    busKey: "traceRoutingModeRequest",
    label: "Requested Path Routing Mode",
    source: { widgetKey: "shell_mode_switch", portKey: "route_mode_out" },
    sinks: [],
  },
  {
    busKey: "traceRoutingPending",
    label: "Path Routing Pending",
    source: null,
    sinks: [{ widgetKey: "shell_mode_switch", portKey: "routing_pending_in" }],
  },
  {
    busKey: "traceRoutingError",
    label: "Path Routing Error",
    source: null,
    sinks: [{ widgetKey: "shell_mode_switch", portKey: "routing_error_in" }],
  },
  {
    busKey: "flyTo",
    label: "Fly To Location",
    source: { widgetKey: "entity_nearby_pins", portKey: "fly_to_out" },
    sinks: [],
  },
  {
    busKey: "activeFeature",
    label: "Active Map Feature",
    source: null,
    sinks: [],
  },
  {
    busKey: "highlightedFeatureId",
    label: "Highlighted Feature",
    source: null,
    sinks: [],
  },
];

export const makeLeftShellWiringConfig = (shellId: string): WiringConfig => ({
  shellId,
  systemBindings: LEFT_SHELL_SYSTEM_BINDINGS,
  userConnections: [],
});
