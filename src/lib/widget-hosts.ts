import type {
  WidgetComponentKey,
  WidgetDefinitionRecord,
  WidgetEntityType,
  WidgetInstanceRecord,
} from "@/lib/widgets";

export type WidgetHost =
  | "widget_library"
  | "widget_center"
  | "left_sidebar"
  | "user_shell"
  | "pin_entity_shell"
  | "trace_entity_shell"
  | "area_entity_shell";

export interface WidgetHostOption {
  value: WidgetHost;
  label: string;
}

const widgetHostLabels: Record<WidgetHost, string> = {
  widget_library: "Widget Library",
  widget_center: "Widget Center",
  left_sidebar: "Left Shell",
  user_shell: "Account Shell",
  pin_entity_shell: "Pin Shell",
  trace_entity_shell: "Path Shell",
  area_entity_shell: "Area Shell",
};

export const getWidgetHostLabel = (host: WidgetHost) => widgetHostLabels[host];

export const getEntityWidgetHost = (entityType: WidgetEntityType): WidgetHost => {
  if (entityType === "trace") {
    return "trace_entity_shell";
  }

  if (entityType === "area") {
    return "area_entity_shell";
  }

  return "pin_entity_shell";
};

const getShellWidgetHost = (componentKey: WidgetComponentKey): WidgetHost => {
  if (
    componentKey === "shell_chrome_primary" ||
    componentKey === "shell_search" ||
    componentKey === "shell_mode_switch" ||
    componentKey === "shell_collections" ||
    componentKey === "shell_controls" ||
    componentKey === "shell_create_collection" ||
    componentKey === "shell_reset_view" ||
    componentKey === "shell_finish_trace" ||
    componentKey === "shell_remove_trace_point" ||
    componentKey === "shell_header" ||
    componentKey === "shell_actions"
  ) {
    return "left_sidebar";
  }

  if (componentKey === "user_profile" || componentKey === "user_account_actions") {
    return "user_shell";
  }

  return "left_sidebar";
};

const uniqHosts = (hosts: WidgetHost[]) =>
  hosts.filter((host, index) => hosts.indexOf(host) === index);

export const getWidgetAllowedHosts = ({
  layer,
  componentKey,
  supportedEntityTypes,
}: Pick<WidgetDefinitionRecord, "layer" | "componentKey" | "supportedEntityTypes">): WidgetHost[] => {
  if (layer === "global") {
    return ["widget_center"];
  }

  if (layer === "shell") {
    return [getShellWidgetHost(componentKey)];
  }

  return uniqHosts(supportedEntityTypes.map(getEntityWidgetHost));
};

export const getWidgetCurrentHost = (
  widget: Pick<WidgetInstanceRecord, "layer" | "componentKey" | "entityType">
): WidgetHost => {
  if (widget.layer === "global") {
    return "widget_center";
  }

  if (widget.layer === "shell") {
    return getShellWidgetHost(widget.componentKey);
  }

  if (widget.entityType) {
    return getEntityWidgetHost(widget.entityType);
  }

  return "widget_library";
};

export const getWidgetHostOptions = (hosts: WidgetHost[]) =>
  hosts.map((host) => ({
    value: host,
    label: widgetHostLabels[host],
  }));

export const getWidgetLibraryHostOptions = (
  definition: Pick<WidgetDefinitionRecord, "layer" | "componentKey" | "supportedEntityTypes">
) =>
  getWidgetHostOptions(["widget_library", ...getWidgetAllowedHosts(definition)]);

export const canWidgetHostBeChanged = (hosts: WidgetHost[]) => hosts.length > 1;

export const isWidgetHostSelectorLocked = (
  definition: Pick<WidgetDefinitionRecord, "layer" | "supportedEntityTypes">
) => {
  if (definition.layer === "shell" || definition.layer === "global") {
    return true;
  }

  return definition.supportedEntityTypes.length <= 1;
};
