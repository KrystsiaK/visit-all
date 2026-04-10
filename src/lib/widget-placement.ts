import type { WidgetComponentKey, WidgetEntityType, WidgetLayerType } from "@/lib/widgets";
import { getEntityWidgetHost, getWidgetAllowedHosts, getWidgetHostLabel, type WidgetHost } from "@/lib/widget-hosts";

export type WidgetPlacementMode =
  | "required_fixed"
  | "single_fixed_host"
  | "single_selectable_host"
  | "multi_host";

export type WidgetPlacementActionMode =
  | "automatic"
  | "choose-one"
  | "choose-many"
  | "unavailable";

export interface WidgetPlacementPolicy {
  mode: WidgetPlacementMode;
  hosts: WidgetHost[];
  removable: boolean;
  reorderable: boolean;
  managedBySystem: boolean;
}

export interface WidgetPlacementState {
  placedHosts: WidgetHost[];
  availableHosts: WidgetHost[];
  actionMode: WidgetPlacementActionMode;
  actionLabel: string;
  canAdd: boolean;
  disabledReason: string | null;
  summary: string;
}

interface PlacementDefinitionInput {
  layer: WidgetLayerType;
  componentKey: WidgetComponentKey;
  supportedEntityTypes: WidgetEntityType[];
  slug: string;
}

const describeHosts = (hosts: WidgetHost[]) =>
  hosts.map((host) => getWidgetHostLabel(host)).join(", ");

export function getWidgetPlacementPolicy(
  definition: PlacementDefinitionInput,
  contextEntityType?: WidgetEntityType
): WidgetPlacementPolicy {
  if (definition.layer === "shell") {
    return {
      mode: "required_fixed",
      hosts: getWidgetAllowedHosts(definition),
      removable: false,
      reorderable: false,
      managedBySystem: true,
    };
  }

  if (definition.layer === "global") {
    return {
      mode: "required_fixed",
      hosts: getWidgetAllowedHosts(definition),
      removable: false,
      reorderable: true,
      managedBySystem: true,
    };
  }

  if (definition.componentKey === "entity_info") {
    return {
      mode: "required_fixed",
      hosts: contextEntityType ? [getEntityWidgetHost(contextEntityType)] : getWidgetAllowedHosts(definition),
      removable: false,
      reorderable: false,
      managedBySystem: true,
    };
  }

  return {
    mode: "single_fixed_host",
    hosts: contextEntityType ? [getEntityWidgetHost(contextEntityType)] : getWidgetAllowedHosts(definition),
    removable: true,
    reorderable: false,
    managedBySystem: false,
  };
}

export function getWidgetPlacementState(
  policy: WidgetPlacementPolicy,
  placedHosts: WidgetHost[]
): WidgetPlacementState {
  const uniquePlacedHosts = placedHosts.filter((host, index) => placedHosts.indexOf(host) === index);
  const availableHosts = policy.hosts.filter((host) => !uniquePlacedHosts.includes(host));

  switch (policy.mode) {
    case "required_fixed":
      return {
        placedHosts: uniquePlacedHosts,
        availableHosts: [],
        actionMode: "unavailable",
        actionLabel: "System",
        canAdd: false,
        disabledReason:
          uniquePlacedHosts.length > 0
            ? `Always present in ${describeHosts(uniquePlacedHosts)}.`
            : `Managed automatically by the system in ${describeHosts(policy.hosts)}.`,
        summary: `System widget fixed to ${describeHosts(policy.hosts)}.`,
      };
    case "single_fixed_host":
      return {
        placedHosts: uniquePlacedHosts,
        availableHosts,
        actionMode: availableHosts.length > 0 ? "automatic" : "unavailable",
        actionLabel: "Add",
        canAdd: availableHosts.length > 0,
        disabledReason:
          availableHosts.length > 0
            ? null
            : `Already placed in ${describeHosts(uniquePlacedHosts.length > 0 ? uniquePlacedHosts : policy.hosts)}.`,
        summary: `Auto-placed into ${describeHosts(policy.hosts)}.`,
      };
    case "single_selectable_host":
      return {
        placedHosts: uniquePlacedHosts,
        availableHosts,
        actionMode: availableHosts.length > 0 ? "choose-one" : "unavailable",
        actionLabel: "Choose Panel",
        canAdd: availableHosts.length > 0,
        disabledReason:
          availableHosts.length > 0
            ? null
            : `Already placed in ${describeHosts(uniquePlacedHosts)}.`,
        summary: `Can live in one of: ${describeHosts(policy.hosts)}.`,
      };
    case "multi_host":
      return {
        placedHosts: uniquePlacedHosts,
        availableHosts,
        actionMode: availableHosts.length > 0 ? "choose-many" : "unavailable",
        actionLabel: "Choose Panels",
        canAdd: availableHosts.length > 0,
        disabledReason:
          availableHosts.length > 0
            ? null
            : `Already placed in all allowed panels: ${describeHosts(uniquePlacedHosts)}.`,
        summary: `Can be added to multiple panels: ${describeHosts(policy.hosts)}.`,
      };
    default: {
      const exhaustiveCheck: never = policy.mode;
      throw new Error(`Unsupported placement mode: ${String(exhaustiveCheck)}`);
    }
  }
}
