export interface MapCoordinate {
  lng: number;
  lat: number;
}

export type TraceRoutingMode = "direct" | "pedestrian";

export interface GeographicSearchResult extends MapCoordinate {
  id: string;
  title: string;
  subtitle: string;
}

export type FeatureType = "pin" | "trace" | "area";

export interface FeatureProperties {
  name?: string;
  note?: string;
  image_url?: string;
  altitude?: number;
  collection_id?: string;
  [key: string]: unknown;
}

export interface ActiveFeature {
  id: string;
  type: FeatureType;
  properties: FeatureProperties;
  coordinates?: { lng: number; lat: number };
}
