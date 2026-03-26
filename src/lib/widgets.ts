export type WidgetEntityType = "pin" | "trace" | "area";
export type WidgetLayerType = "global" | "entity" | "shell";
export type WidgetGeometryKind = "point" | "line" | "polygon";
export type WidgetRuntimeChannel = string;

export type WidgetComponentKey =
  | "global_overview"
  | "entity_info"
  | "entity_delete"
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
}

export interface WidgetPlacementRecord {
  id: string;
  shellInstanceId: string;
  widgetInstanceId: string;
  slot: string;
  position: number;
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
