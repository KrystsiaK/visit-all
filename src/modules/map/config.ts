const CARTO_VOYAGER_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();

export const MAP_STYLE_GROUPS = [
  {
    label: "Streets",
    styles: [
      { id: "streets-v4", label: "Streets" },
      { id: "streets-v4-dark", label: "Streets Dark" },
      { id: "streets-v4-pastel", label: "Streets Pastel" },
      { id: "bright-v2", label: "Bright" },
      { id: "bright-v2-dark", label: "Bright Dark" },
      { id: "bright-v2-light", label: "Bright Light" },
      { id: "bright-v2-pastel", label: "Bright Pastel" },
      { id: "openstreetmap", label: "OpenStreetMap" },
      { id: "openstreetmap-dark", label: "OpenStreetMap Dark" },
    ],
  },
  {
    label: "Minimal",
    styles: [
      { id: "base-v4", label: "Base" },
      { id: "base-v4-dark", label: "Base Dark" },
      { id: "base-v4-light", label: "Base Light" },
      { id: "base-v4-ai", label: "Base AI" },
      { id: "dataviz-v4", label: "Dataviz" },
      { id: "dataviz-v4-dark", label: "Dataviz Dark" },
      { id: "dataviz-v4-light", label: "Dataviz Light" },
      { id: "backdrop-v4", label: "Backdrop" },
      { id: "backdrop-v4-dark", label: "Backdrop Dark" },
      { id: "backdrop-v4-light", label: "Backdrop Light" },
    ],
  },
  {
    label: "Terrain",
    styles: [
      { id: "outdoor-v4", label: "Outdoor" },
      { id: "outdoor-v4-dark", label: "Outdoor Dark" },
      { id: "topo-v4", label: "Topo" },
      { id: "topo-v4-dark", label: "Topo Dark" },
      { id: "topo-v4-pastel", label: "Topo Pastel" },
      { id: "topo-v4-topographique", label: "Topographique" },
      { id: "landscape-v4", label: "Landscape" },
      { id: "landscape-v4-dark", label: "Landscape Dark" },
      { id: "landscape-v4-vivid", label: "Landscape Vivid" },
      { id: "winter-v4", label: "Winter" },
      { id: "winter-v4-dark", label: "Winter Dark" },
    ],
  },
  {
    label: "Imagery",
    styles: [
      { id: "satellite-v4", label: "Satellite" },
      { id: "satellite-v4-dark", label: "Satellite Dark" },
      { id: "hybrid-v4", label: "Hybrid" },
      { id: "hybrid-v4-dark", label: "Hybrid Dark" },
    ],
  },
  {
    label: "Creative",
    styles: [
      { id: "aquarelle-v4", label: "Aquarelle" },
      { id: "aquarelle-v4-dark", label: "Aquarelle Dark" },
      { id: "aquarelle-v4-vivid", label: "Aquarelle Vivid" },
      { id: "ocean-v4", label: "Ocean" },
      { id: "ocean-v4-dark", label: "Ocean Dark" },
    ],
  },
] as const;

export type MapStyleId = (typeof MAP_STYLE_GROUPS)[number]["styles"][number]["id"];

export const DEFAULT_MAP_STYLE_ID: MapStyleId = "streets-v4";
export const MAP_STYLE_STORAGE_KEY = "visit-all:map-style";

const MAP_STYLE_IDS = new Set<string>(
  MAP_STYLE_GROUPS.flatMap((group) => group.styles.map((style) => style.id))
);

export const isMapStyleId = (value: string | null): value is MapStyleId =>
  value !== null && MAP_STYLE_IDS.has(value);

export const getMapStyleUrl = (styleId: MapStyleId) =>
  mapTilerKey
    ? `https://api.maptiler.com/maps/${styleId}/style.json?key=${encodeURIComponent(mapTilerKey)}`
    : CARTO_VOYAGER_STYLE;
