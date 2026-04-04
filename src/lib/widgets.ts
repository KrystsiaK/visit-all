export type WidgetEntityType = "pin" | "trace" | "area";
export type WidgetLayerType = "global" | "entity" | "shell";
export type WidgetGeometryKind = "point" | "line" | "polygon";
export type WidgetRuntimeChannel = string;
export type WidgetMobility = "free" | "restricted" | "locked";
export type WidgetInstanceStatus = "library" | "placed" | "disabled" | "broken";
export type SignalScopeType = "shell" | "widget" | "map" | "app";
export type SignalValueType = "boolean" | "string" | "number" | "json";
export type WidgetPortDirection = "input" | "output";
export type WidgetConnectionTargetType = "widget" | "shell" | "map";

export type WidgetComponentKey =
  | "global_overview"
  | "user_profile"
  | "user_account_actions"
  | "entity_info"
  | "entity_delete"
  | "entity_gallery"
  | "entity_stories"
  | "entity_resources"
  | "entity_rating"
  | "entity_nearby_pins"
  | "entity_transport_mode"
  | "shell_chrome_primary"
  | "shell_header"
  | "shell_search"
  | "shell_mode_switch"
  | "shell_collections"
  | "shell_controls"
  | "shell_actions"
  | "shell_create_collection"
  | "shell_reset_view"
  | "shell_finish_trace"
  | "shell_remove_trace_point";

export interface WidgetCollectionRef {
  id: string;
  name: string;
  color: string;
  type: string;
}

export interface WidgetEntityPayload {
  id: string;
  type: WidgetEntityType;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  collection: WidgetCollectionRef | null;
  geometryKind: WidgetGeometryKind;
  metadata: Record<string, unknown>;
}

export interface WidgetDefinitionRecord {
  id: string;
  slug: string;
  name: string;
  layer: WidgetLayerType;
  supportedEntityTypes: WidgetEntityType[];
  componentKey: WidgetComponentKey;
  defaultConfig: Record<string, unknown>;
  isSystem: boolean;
  mobility?: WidgetMobility;
  supportsManualConnections?: boolean;
  supportsAutoShellSignals?: boolean;
  settingsSchema?: Record<string, unknown>;
}

export interface WidgetInstanceRecord {
  id: string;
  definitionId: string;
  slug: string;
  name: string;
  layer: WidgetLayerType;
  entityType: WidgetEntityType | null;
  entityId: string | null;
  componentKey: WidgetComponentKey;
  position: number;
  config: Record<string, unknown>;
  state: Record<string, unknown>;
  status?: WidgetInstanceStatus;
  lockedToHost?: boolean;
  settings?: Record<string, unknown>;
  runtimeOverrides?: Record<string, unknown>;
  placedInLeftSidebar?: boolean;
}

export interface WidgetPlacementRecord {
  id: string;
  shellInstanceId: string;
  widgetInstanceId: string;
  slot: string;
  position: number;
}

export interface SignalDefinitionRecord {
  id: string;
  scopeType: SignalScopeType;
  signalKey: string;
  valueType: SignalValueType;
  description: string | null;
  isSystem: boolean;
}

export interface WidgetPortRecord {
  id: string;
  widgetDefinitionId: string;
  direction: WidgetPortDirection;
  portKey: string;
  valueType: SignalValueType;
  required: boolean;
  autoBindable: boolean;
  description: string | null;
}

export interface ShellSignalBindingRecord {
  id: string;
  widgetDefinitionId: string;
  widgetPortId: string;
  signalDefinitionId: string;
  bindingMode: "auto" | "manual";
  defaultEnabled: boolean;
}

export interface WidgetConnectionRecord {
  id: string;
  sourceWidgetInstanceId: string;
  sourcePortId: string;
  targetType: WidgetConnectionTargetType;
  targetWidgetInstanceId: string | null;
  targetPortId: string | null;
  targetSignalDefinitionId: string | null;
  transformConfig: Record<string, unknown>;
  enabled: boolean;
}

export type ButtonGroupWidgetIcon = "pin" | "route" | "polygon";

export interface ButtonGroupWidgetButtonBinding {
  id: string;
  label: string;
  value: string;
  icon: ButtonGroupWidgetIcon;
  disabledChannel?: WidgetRuntimeChannel;
}

export interface ButtonGroupWidgetConfig {
  kind: "button_group";
  valueChannel: WidgetRuntimeChannel;
  buttons: ButtonGroupWidgetButtonBinding[];
}

export interface GalleryWidgetConfig {
  kind: "gallery";
  allowMultiple: boolean;
  maxItems?: number;
}

export interface StoriesWidgetConfig {
  kind: "stories";
  format: "markdown";
  allowMultiple: boolean;
}

export interface ResourceLinkWidgetConfig {
  label?: string;
  url: string;
}

export interface ResourcesWidgetConfig {
  kind: "resources";
  allowMultiple: boolean;
}

export interface RatingWidgetConfig {
  kind: "rating";
  scale: 5;
}

export interface NearbyPinsWidgetConfig {
  kind: "nearby_pins";
  maxItems: number;
  minRating?: number;
}

export type TransportModeWidgetOption =
  | "walk"
  | "car"
  | "bus"
  | "tram"
  | "train"
  | "ferry";

export interface TransportModeWidgetConfig {
  kind: "transport_mode";
  options: TransportModeWidgetOption[];
  allowMultiple: boolean;
}

export function isButtonGroupWidgetConfig(
  value: unknown
): value is ButtonGroupWidgetConfig {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (candidate.kind !== "button_group" || typeof candidate.valueChannel !== "string") {
    return false;
  }

  if (!Array.isArray(candidate.buttons)) {
    return false;
  }

  return candidate.buttons.every((button) => {
    if (!button || typeof button !== "object") {
      return false;
    }

    const candidate = button as Record<string, unknown>;

    return (
      typeof candidate.id === "string" &&
      typeof candidate.label === "string" &&
      typeof candidate.value === "string" &&
      (candidate.icon === "pin" || candidate.icon === "route" || candidate.icon === "polygon") &&
      (candidate.disabledChannel === undefined || typeof candidate.disabledChannel === "string")
    );
  });
}
