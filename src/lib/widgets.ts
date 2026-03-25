export type WidgetEntityType = "pin" | "trace" | "area";
export type WidgetLayerType = "global" | "entity";
export type WidgetGeometryKind = "point" | "line" | "polygon";

export type WidgetComponentKey = "global_overview" | "entity_info" | "entity_delete";

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
