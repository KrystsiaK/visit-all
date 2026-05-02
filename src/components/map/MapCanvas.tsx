"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Map, { Marker, Source, Layer, MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import { LoaderCircle, LocateFixed } from "lucide-react";
import { getPins, getTraces, getAreas } from "@/app/actions";
import type { FeatureCollection, Feature, Point, LineString, Polygon } from "geojson";
import type { InteractionMode } from "@/app/page";
import type { FeatureProperties } from "@/components/widgets/ActiveFeatureContext";
import type { StyleSpecification } from "maplibre-gl";
import { lineString } from "@turf/helpers";
import bezierSpline from "@turf/bezier-spline";
import { useActiveFeature } from "@/components/widgets/ActiveFeatureContext";
import { GlassPinIcon } from "@/components/icons/GlassPinIcon";
import { DEFAULT_HOME_VIEW } from "@/components/map/geolocation";
import { useUserGeolocation } from "@/components/map/useUserGeolocation";

const VOYAGER_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://basemaps.cartocdn.com/gl/voyager-gl-style/fonts/{fontstack}/{range}.pbf",
  sources: {
    satellite: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Esri, Maxar"
    }
  },
  layers: [{ id: "satellite-layer", type: "raster", source: "satellite" }]
};

interface LocationGeometry {
  coordinates?: [number, number];
}

interface LineGeometry {
  coordinates?: [number, number][];
}

interface PolygonGeometry {
  coordinates?: [([number, number])[]];
}

interface PinMapRecord extends FeatureProperties {
  id: string;
  collection_id?: string;
  collectionColor?: string;
  collectionIcon?: string;
  location?: LocationGeometry;
}

interface TraceMapRecord {
  id: string;
  collection_id?: string;
  collectionColor?: string;
  color?: string;
  name?: string;
  path?: LineGeometry;
}

interface AreaMapRecord {
  id: string;
  collection_id?: string;
  collectionColor?: string;
  color?: string;
  name?: string;
  path?: PolygonGeometry;
}

function GeometryAnchorMarker({
  color,
  selected,
  variant,
  onClick,
}: {
  color: string;
  selected: boolean;
  variant: "trace-start" | "trace-end" | "area";
  onClick: () => void;
}) {
  const ariaLabel =
    variant === "trace-start"
      ? "Open path from start anchor"
      : variant === "trace-end"
        ? "Open path from end anchor"
        : "Open zone from closure anchor";

  const innerGlyph =
    variant === "trace-start" ? (
      <span className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-black/10 bg-white" />
    ) : variant === "trace-end" ? (
      <span className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-[#111111]" />
    ) : (
      <>
        <span className="absolute left-1/2 top-1/2 h-[12px] w-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2px] border-[#111111] bg-white" />
        <span className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ backgroundColor: color }} />
      </>
    );

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="group relative flex h-[54px] w-[36px] items-center justify-center"
      aria-label={ariaLabel}
    >
      <span
        className={`absolute left-1/2 top-[2px] h-[34px] w-[34px] -translate-x-1/2 rounded-full transition-all ${
          selected
            ? "scale-105 bg-white/95 shadow-[0px_4px_10px_rgba(0,0,0,0.12)]"
            : "bg-white/88 shadow-[0px_2px_6px_rgba(0,0,0,0.08)] group-hover:scale-[1.03]"
        }`}
        style={{ boxShadow: selected ? `0 0 0 3px ${color}, 0 4px 10px rgba(0,0,0,0.12)` : `0 0 0 2.5px ${color}, 0 2px 6px rgba(0,0,0,0.08)` }}
      />
      <span
        className="absolute left-1/2 top-[6px] h-[22px] w-[22px] -translate-x-1/2 rounded-full border-[2px] border-[#111111] bg-white"
      />
      <span
        className="absolute left-1/2 top-[6px] h-[5px] w-[22px] -translate-x-1/2 rounded-t-full"
        style={{ backgroundColor: color }}
      />
      <span className="absolute left-1/2 top-[17px] h-[10px] w-px -translate-x-1/2 bg-[#111111]/14" />
      <span className="absolute left-1/2 top-[22px] h-px w-[12px] -translate-x-1/2 bg-[#111111]/14" />
      {innerGlyph}
      <span
        className="absolute left-1/2 top-[31px] h-[13px] w-[2px] -translate-x-1/2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span
        className="absolute left-1/2 top-[42px] h-[8px] w-[8px] -translate-x-1/2 rotate-45 border-r-[1.5px] border-b-[1.5px] border-[#111111]"
        style={{ backgroundColor: color }}
      />
    </button>
  );
}

function applySmoothingToLine(coords: [number, number][], curveMode?: boolean) {
  if (!curveMode || coords.length < 3) return coords;
  try {
    const line = lineString(coords);
    return bezierSpline(line, { resolution: 10000, sharpness: 0.85 }).geometry.coordinates as [number, number][];
  } catch {
    return coords;
  }
}

function applySmoothingToPolygon(polyCoords: [number, number][], curveMode?: boolean) {
  if (!curveMode || polyCoords.length < 4) return polyCoords;
  try {
    return bezierSpline(lineString(polyCoords), { resolution: 10000, sharpness: 0.85 }).geometry.coordinates as [number, number][];
  } catch {
    return polyCoords;
  }
}

const getLocateButtonLabel = (
  permissionState: ReturnType<typeof useUserGeolocation>["permissionState"],
  isLocating: boolean
) => {
  if (isLocating) {
    return "Locating you";
  }

  if (permissionState === "denied") {
    return "Location blocked. Enable browser location and try again";
  }

  if (permissionState === "unsupported") {
    return "Location unavailable on this device";
  }

  if (permissionState === "error") {
    return "Could not get your location";
  }

  return "Center on my location";
};

interface MapCanvasProps {
  mode: InteractionMode;
  onMapClick?: (lng: number, lat: number) => void;
  onTraceSelected?: (id: string, coords: {lng: number, lat: number}[], properties?: FeatureProperties) => void;
  onAreaSelected?: (id: string, coords: {lng: number, lat: number}[], properties?: FeatureProperties) => void;
  onPinSelected?: (id: string, properties: FeatureProperties) => void;
  onPendingPinCancel?: () => void;
  onTraceNodeClick?: (nodeIndex: number) => void;
  selectedTraceNodeIndex?: number | null;
  selectedPoint?: { lng: number; lat: number } | null;
  drawingPath?: { lng: number; lat: number }[];
  setDrawingPath?: React.Dispatch<React.SetStateAction<{lng: number, lat: number}[]>>;
  editingTraceId?: string | null;
  editingAreaId?: string | null;
  traceDraftFinalized?: boolean;
  areaDraftFinalized?: boolean;
  curveMode?: boolean;
  terrain3D?: boolean;
  isSatellite?: boolean;
  resetViewTrigger?: number;
  refreshTrigger?: number;
  hiddenCollectionIds?: string[];
}

export default function MapCanvas({ 
  mode, onMapClick, onTraceSelected, onAreaSelected, onPinSelected,
  onPendingPinCancel, onTraceNodeClick, selectedTraceNodeIndex = null,
  selectedPoint, drawingPath, setDrawingPath, 
  traceDraftFinalized = false, areaDraftFinalized = false, curveMode, terrain3D, isSatellite = false, resetViewTrigger = 0, refreshTrigger, hiddenCollectionIds = []
}: MapCanvasProps) {
  const previousResetViewTrigger = useRef(resetViewTrigger);
  const mapRef = useRef<MapRef | null>(null);
  const homeViewRef = useRef(DEFAULT_HOME_VIEW);
  const [shouldLoadSpatialData, setShouldLoadSpatialData] = useState(false);
  const [pins, setPins] = useState<PinMapRecord[]>([]);
  const [traces, setTraces] = useState<TraceMapRecord[]>([]);
  const [areas, setAreas] = useState<AreaMapRecord[]>([]);
  const { isLocating, location, permissionState, requestLocation } = useUserGeolocation();

  const {
    activeFeature,
    setActiveFeature,
    flyToMapCommand,
    clearFlyToMapCommand,
    highlightedFeatureId,
    setHighlightedFeatureId,
  } = useActiveFeature();
  const geometryDraftFinalized =
    mode.includes("trace") ? traceDraftFinalized : mode.includes("area") ? areaDraftFinalized : false;
  const selectedFeatureId = highlightedFeatureId ?? activeFeature?.id ?? null;

  const flyToHomeView = useCallback((duration = 900) => {
    mapRef.current?.flyTo({
      center: [homeViewRef.current.lng, homeViewRef.current.lat],
      zoom: homeViewRef.current.zoom,
      bearing: 0,
      pitch: terrain3D ? 60 : 0,
      duration,
    });
  }, [terrain3D]);

  useEffect(() => {
    mapRef.current?.easeTo({
      pitch: terrain3D ? 60 : 0,
      duration: 400,
    });
  }, [terrain3D]);

  useEffect(() => {
    if (previousResetViewTrigger.current === resetViewTrigger) {
      return;
    }

    previousResetViewTrigger.current = resetViewTrigger;
    flyToHomeView();
  }, [resetViewTrigger, flyToHomeView]);

  useEffect(() => {
    if (!location) {
      return;
    }

    homeViewRef.current = {
      lng: location.lng,
      lat: location.lat,
      zoom: 14,
    };

    mapRef.current?.flyTo({
      center: [location.lng, location.lat],
      zoom: Math.max(mapRef.current?.getZoom() ?? 12, 14),
      duration: 1100,
    });
  }, [location]);

  useEffect(() => {
    if (flyToMapCommand) {
      const currentZoom = mapRef.current?.getZoom() ?? 12;
      mapRef.current?.flyTo({
        center: [flyToMapCommand.lng, flyToMapCommand.lat],
        zoom: flyToMapCommand.zoom || Math.max(currentZoom, 14),
        duration: 1500,
      });
      clearFlyToMapCommand();
    }
  }, [flyToMapCommand, clearFlyToMapCommand]);

  useEffect(() => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (shouldLoadSpatialData) {
      return;
    }

    if (typeof idleWindow.requestIdleCallback === "function") {
      const idleId = idleWindow.requestIdleCallback(() => setShouldLoadSpatialData(true), { timeout: 1200 });

      return () => {
        idleWindow.cancelIdleCallback?.(idleId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      setShouldLoadSpatialData(true);
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shouldLoadSpatialData]);

  useEffect(() => {
    if (!shouldLoadSpatialData) {
      return;
    }

    async function loadData() {
      try {
        const [pinData, traceData, areaData] = await Promise.all([getPins(), getTraces(), getAreas()]);
        setPins(pinData);
        setTraces(traceData);
        setAreas(areaData);
      } catch (err) { console.error("Failed to load map data:", err); }
    }
    loadData();
  }, [refreshTrigger, shouldLoadSpatialData]);

  const visiblePins = useMemo(
    () => pins.filter((pin) => !pin.collection_id || !hiddenCollectionIds.includes(pin.collection_id)),
    [pins, hiddenCollectionIds]
  );

  const visibleTraces = useMemo(
    () => traces.filter((trace) => !trace.collection_id || !hiddenCollectionIds.includes(trace.collection_id)),
    [traces, hiddenCollectionIds]
  );

  const visibleAreas = useMemo(
    () => areas.filter((area) => !area.collection_id || !hiddenCollectionIds.includes(area.collection_id)),
    [areas, hiddenCollectionIds]
  );

  const tracesGeoJson: FeatureCollection = useMemo(() => {
    const features: Feature[] = visibleTraces
      .map(trace => {
        let coords: [number, number][] = [];
        if (trace.path?.coordinates) coords = applySmoothingToLine(trace.path.coordinates, curveMode);
        return {
          type: 'Feature' as const,
          geometry: { type: 'LineString', coordinates: coords } as LineString,
          properties: {
            id: trace.id,
            color: trace.collectionColor || trace.color || '#3b82f6',
            collection_id: trace.collection_id,
            name: trace.name,
          }
        };
      }).filter(f => (f.geometry as LineString).coordinates.length >= 2);
    return { type: 'FeatureCollection', features };
  }, [visibleTraces, curveMode]);

  const selectedTraceGeoJson: FeatureCollection = useMemo(() => {
    if (!selectedFeatureId) {
      return { type: "FeatureCollection", features: [] };
    }

    const selectedTrace = visibleTraces.find(
      (trace) => trace.id === selectedFeatureId
    );

    if (!selectedTrace?.path?.coordinates || selectedTrace.path.coordinates.length < 2) {
      return { type: "FeatureCollection", features: [] };
    }

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: applySmoothingToLine(selectedTrace.path.coordinates, curveMode),
          } as LineString,
          properties: {
            id: selectedTrace.id,
            color: selectedTrace.collectionColor || selectedTrace.color || "#0000ff",
          },
        },
      ],
    };
  }, [curveMode, selectedFeatureId, visibleTraces]);

  const areasGeoJson: FeatureCollection = useMemo(() => {
    const features: Feature[] = visibleAreas
      .map(area => {
        let coords: [number, number][][] = [];
        if (area.path?.coordinates && area.path.coordinates[0]) {
           const smoothRing = applySmoothingToPolygon(area.path.coordinates[0], curveMode);
           coords = [smoothRing];
        }
        return {
          type: 'Feature' as const,
          geometry: { type: 'Polygon', coordinates: coords } as Polygon,
          properties: {
            id: area.id,
            color: area.collectionColor || area.color || '#10b981',
            collection_id: area.collection_id,
            name: area.name,
          }
        };
      }).filter(f => (f.geometry as Polygon).coordinates[0]?.length >= 3);
    return { type: 'FeatureCollection', features };
  }, [visibleAreas, curveMode]);

  const selectedAreaGeoJson: FeatureCollection = useMemo(() => {
    if (!selectedFeatureId) {
      return { type: "FeatureCollection", features: [] };
    }

    const selectedArea = visibleAreas.find(
      (area) => area.id === selectedFeatureId
    );

    if (!selectedArea?.path?.coordinates?.[0] || selectedArea.path.coordinates[0].length < 3) {
      return { type: "FeatureCollection", features: [] };
    }

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [applySmoothingToPolygon(selectedArea.path.coordinates[0], curveMode)],
          } as Polygon,
          properties: {
            id: selectedArea.id,
            color: selectedArea.collectionColor || selectedArea.color || "#10b981",
          },
        },
      ],
    };
  }, [curveMode, selectedFeatureId, visibleAreas]);

  const activeDrawingGeoJson: FeatureCollection = useMemo(() => {
    if (!drawingPath || drawingPath.length < 2) return { type: 'FeatureCollection', features: [] };
    
    const coords = drawingPath.map(p => [p.lng, p.lat] as [number, number]);
    const features: Feature[] = [];

    if (mode.includes('trace')) {
      features.push({ 
        type: 'Feature' as const, 
        geometry: { type: 'LineString', coordinates: applySmoothingToLine(coords, curveMode) }, 
        properties: {} 
      });
    } 
    else if (mode.includes('area')) {
      if (drawingPath.length >= 2) {
        let polyCoords = [...coords];
        if (polyCoords[0][0] !== polyCoords[polyCoords.length - 1][0] || polyCoords[0][1] !== polyCoords[polyCoords.length - 1][1]) {
           polyCoords.push([...polyCoords[0]]);
        }
        polyCoords = applySmoothingToPolygon(polyCoords, curveMode);
        features.push({
          type: 'Feature' as const,
          geometry: { type: 'Polygon', coordinates: [polyCoords] } as Polygon,
          properties: {}
        });
      }
    }

    return { type: 'FeatureCollection', features };
  }, [drawingPath, curveMode, mode]);

  const handleMapClick = (evt: MapLayerMouseEvent) => {
    
    // Cluster Automatic Zoom Handler
    if (!mode.includes('edit')) {
      const clusterFeat = evt.features?.find(f => f.layer.id === 'clusters');
      if (clusterFeat && clusterFeat.geometry.type === 'Point') {
        const geom = clusterFeat.geometry as Point;
        const currentZoom = mapRef.current?.getZoom() ?? 12;
        mapRef.current?.easeTo({
          center: [geom.coordinates[0], geom.coordinates[1]],
          zoom: Math.min(currentZoom + 2, 20),
          duration: 500,
        });
        return; // Early return to prevent marking a point under a cluster
      }
    }

    // Unclustered Point Memory Trigger
    if (onPinSelected && (!mode.includes('edit') || mode === 'editPin')) {
      const pinFeat = evt.features?.find(f => f.layer.id === 'unclustered-point');
      if (pinFeat?.properties?.id) {
        onPinSelected(pinFeat.properties.id, pinFeat.properties);
        setHighlightedFeatureId(pinFeat.properties.id);
        setActiveFeature({ 
           id: pinFeat.properties.id, 
           type: 'pin', 
           properties: pinFeat.properties, 
           coordinates: { lng: evt.lngLat.lng, lat: evt.lngLat.lat } 
        });
        return;
      }
    }

    // Saved geometry surfaces should not open the entity shell directly.
    if (onTraceSelected && (!mode.includes('edit') || mode === 'editTrace')) {
      const traceFeat = evt.features?.find(f => f.layer.id === 'traces');
      if (traceFeat?.properties?.id) {
        return;
      }
    }
    if (onAreaSelected && (!mode.includes('edit') || mode === 'editArea')) {
      const areaFeat = evt.features?.find(f => f.layer.id === 'areas-fill');
      if (areaFeat?.properties?.id) {
        return;
      }
    }
    
    // Deselect if clicking on empty spot
    if (!mode.includes('edit') && mode !== 'pin' && drawingPath && drawingPath.length === 0) {
       setActiveFeature(null);
       setHighlightedFeatureId(null);
    }
    
    if (onMapClick) onMapClick(evt.lngLat.lng, evt.lngLat.lat);
  };

  return (
    <div className={`flex-1 relative w-full h-full bg-gray-100 ${((!selectedPoint && mode === 'pin') || (drawingPath && drawingPath.length === 0 && (mode === 'trace' || mode === 'area'))) ? 'cursor-crosshair' : ''}`}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: DEFAULT_HOME_VIEW.lng,
          latitude: DEFAULT_HOME_VIEW.lat,
          zoom: DEFAULT_HOME_VIEW.zoom,
          bearing: 0,
          pitch: terrain3D ? 60 : 0,
        }}
        onClick={handleMapClick}
        mapStyle={isSatellite ? SATELLITE_STYLE : VOYAGER_STYLE}
        terrain={terrain3D ? { source: 'terrain-source', exaggeration: 1.5 } : undefined}
        style={{ width: "100%", height: "100%" }}
        // Explicitly declare interactive layers so Mapbox issues feature hits gracefully
        interactiveLayerIds={['traces', 'areas-fill', 'unclustered-point', 'clusters']}
      >
        {/* 3D DEM Source */}
        {terrain3D && (
          <Source id="terrain-source" type="raster-dem" tiles={['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']} encoding="terrarium" tileSize={256} maxzoom={14} />
        )}

        {/* Saved Areas Layer */}
        <Source id="areas-source" type="geojson" data={areasGeoJson}>
          <Layer id="areas-fill" type="fill" paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': 0.18 }} />
          <Layer id="areas-outline" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 2 }} />
        </Source>

        <Source id="areas-selected-source" type="geojson" data={selectedAreaGeoJson}>
          <Layer id="areas-selected-fill" type="fill" paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': 0.3 }} />
          <Layer id="areas-selected-outline-underlay" type="line" paint={{ 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.9 }} />
          <Layer id="areas-selected-outline" type="line" paint={{ 'line-color': '#111111', 'line-width': 5 }} />
        </Source>

        {/* Saved Traces Layer */}
        <Source id="traces-source" type="geojson" data={tracesGeoJson}>
          <Layer id="traces" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 5, 'line-opacity': 1 }} layout={{ 'line-join': 'round', 'line-cap': 'round' }} />
        </Source>

        <Source id="traces-selected-source" type="geojson" data={selectedTraceGeoJson}>
          <Layer id="traces-selected-underlay" type="line" paint={{ 'line-color': '#ffffff', 'line-width': 11, 'line-opacity': 0.9 }} layout={{ 'line-join': 'round', 'line-cap': 'round' }} />
          <Layer id="traces-selected-outline" type="line" paint={{ 'line-color': '#111111', 'line-width': 8, 'line-opacity': 1 }} layout={{ 'line-join': 'round', 'line-cap': 'round' }} />
          <Layer id="traces-selected" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 5, 'line-opacity': 1 }} layout={{ 'line-join': 'round', 'line-cap': 'round' }} />
        </Source>

        {/* Active Drawing/Editing GeoJSON Preview */}
        {(mode.includes('trace') || mode.includes('area')) && drawingPath && drawingPath.length >= 2 && (
          <Source id="active-draw-source" type="geojson" data={activeDrawingGeoJson}>
            {mode.includes('trace') && <Layer id="active-trace" type="line" paint={{ 'line-color': '#111111', 'line-width': 5, 'line-dasharray': [2, 2], 'line-opacity': 1 }} />}
            {mode.includes('area') && <Layer id="active-area-fill" type="fill" paint={{ 'fill-color': mode === 'editArea' ? '#ff0000' : '#ffff00', 'fill-opacity': 0.2 }} />}
            {mode.includes('area') && <Layer id="active-area-line" type="line" paint={{ 'line-color': mode === 'editArea' ? '#ff0000' : '#ffff00', 'line-width': 3, 'line-dasharray': [2, 2] }} />}
          </Source>
        )}

        {/* Active Drawing Vertices */}
        {(mode.includes('trace') || mode.includes('area')) && drawingPath && !geometryDraftFinalized && drawingPath.map((p, index) => {
          const isEditableNode = true;
          const isSelectedNode = selectedTraceNodeIndex === index;

          return (
          <Marker
            key={`node-${index}`}
            longitude={p.lng}
            latitude={p.lat}
            anchor="center"
            draggable={isEditableNode}
            onDragEnd={(e) => {
              if (!isEditableNode || !setDrawingPath) return;
              setDrawingPath(prev => {
                const newPath = [...prev];
                newPath[index] = { lng: e.lngLat.lng, lat: e.lngLat.lat };
                return newPath;
              });
            }}
          >
             <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onTraceNodeClick?.(index);
              }}
              className="group relative flex h-5 w-5 items-center justify-center rounded-full cursor-pointer"
              title={mode.includes("trace") || mode.includes("area") ? "Click to select. Drag to adjust." : undefined}
            >
                <span className={`absolute inset-0 rounded-full shadow-[0px_3px_10px_rgba(0,0,0,0.22)] ring-1 transition-all ${isSelectedNode ? "bg-[#111111] ring-black/40 scale-110" : "bg-white/95 ring-black/10"}`} />
                <span className={`absolute inset-[3px] rounded-full border transition-all ${mode.startsWith('edit') ? 'border-[#5b4300] bg-[#ffdf9b]' : 'border-[#00327d] bg-[#f8f6f1]'} ${isSelectedNode ? "scale-95" : ""}`} />
                <span className={`absolute inset-[6px] rounded-full transition-transform duration-200 ${index === drawingPath.length - 1 && mode === "trace" ? "bg-[#ff0000] group-hover:scale-125" : mode === "area" ? "bg-[#ffff00]" : "bg-[#0000ff]"} ${isSelectedNode ? "scale-125" : ""}`} />
              </button>
          </Marker>
        )})}

        {/* Ghost Midpoints */}
        {(mode.includes('trace') || mode.includes('area')) && drawingPath && !geometryDraftFinalized && drawingPath.map((p, index) => {
          let nextP;
          if (index === drawingPath.length - 1) {
            if (mode.includes('area') && drawingPath.length >= 3) nextP = drawingPath[0]; // Area closes back to start forming inner ghost midpoint
            else return null;
          } else {
            nextP = drawingPath[index + 1];
          }
          const midLng = (p.lng + nextP.lng) / 2, midLat = (p.lat + nextP.lat) / 2;
          return (
            <Marker key={`mid-${index}`} longitude={midLng} latitude={midLat} anchor="center" draggable={true} onDragEnd={(e) => { if (setDrawingPath) setDrawingPath(prev => { const newPath = [...prev]; newPath.splice(index + 1, 0, { lng: e.lngLat.lng, lat: e.lngLat.lat }); return newPath; }); }}>
              <div className="w-3 h-3 bg-white border border-[#b7102a] rounded-none shadow-none hover:bg-[#b7102a] hover:scale-150 transition-colors cursor-grab active:cursor-grabbing" title="Drag to add point" />
            </Marker>
          );
        })}

        {/* Saved Trace Anchor Points */}
        {visibleTraces
          .flatMap((trace) => {
            const coords = trace.path?.coordinates ?? [];
            if (coords.length < 2) {
              return [];
            }

            const color = trace.collectionColor || trace.color || "#0000ff";
            const isSelected = selectedFeatureId === trace.id;
            const properties: FeatureProperties = {
              id: trace.id,
              name: trace.name,
              collection_id: trace.collection_id,
            };
            const lineCoords = coords.map((point) => ({ lng: point[0], lat: point[1] }));
            const openTrace = () => {
              onTraceSelected?.(trace.id, lineCoords, properties);
              setHighlightedFeatureId(trace.id);
              setActiveFeature({ id: trace.id, type: 'trace', properties });
            };
            const [startLng, startLat] = coords[0];
            const [endLng, endLat] = coords[coords.length - 1];

            return [
              <Marker key={`trace-start-${trace.id}`} longitude={startLng} latitude={startLat} anchor="bottom">
                <GeometryAnchorMarker color={color} selected={isSelected} variant="trace-start" onClick={openTrace} />
              </Marker>,
              <Marker key={`trace-end-${trace.id}`} longitude={endLng} latitude={endLat} anchor="bottom">
                <GeometryAnchorMarker color={color} selected={isSelected} variant="trace-end" onClick={openTrace} />
              </Marker>,
            ];
          })}

        {/* Saved Area Closure Points */}
        {visibleAreas
          .flatMap((area) => {
            const ring = area.path?.coordinates?.[0] ?? [];
            if (ring.length < 3) {
              return [];
            }

            const color = area.collectionColor || area.color || "#10b981";
            const isSelected = selectedFeatureId === area.id;
            const properties: FeatureProperties = {
              id: area.id,
              name: area.name,
              collection_id: area.collection_id,
            };
            const polygonCoords = ring
              .slice(0, ring.length > 1 ? -1 : ring.length)
              .map((point) => ({ lng: point[0], lat: point[1] }));
            const openArea = () => {
              onAreaSelected?.(area.id, polygonCoords, properties);
              setHighlightedFeatureId(area.id);
              setActiveFeature({ id: area.id, type: 'area', properties });
            };
            const [startLng, startLat] = ring[0];

            return [
              <Marker key={`area-anchor-${area.id}`} longitude={startLng} latitude={startLat} anchor="bottom">
                <GeometryAnchorMarker color={color} selected={isSelected} variant="area" onClick={openArea} />
              </Marker>,
            ];
          })}

        {/* Figma Liquid Glass React Pins */}
        {visiblePins.map(pin => {
          const coords = pin.location?.coordinates;
          if (!coords || !coords[0]) return null;
          const isHighlighted = selectedFeatureId === pin.id;
          return (
            <Marker key={pin.id} longitude={coords[0]} latitude={coords[1]} anchor="bottom" onClick={(e) => { e.originalEvent.stopPropagation(); onPinSelected?.(pin.id, pin); setHighlightedFeatureId(pin.id); setActiveFeature({ id: pin.id, type: 'pin', properties: pin, coordinates: { lng: coords[0], lat: coords[1] } }); }}>
              <div data-testid={`pin-marker-${pin.id}`} className="flex flex-col items-center gap-1 group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
                <div className={`relative transition-transform duration-300 ${isHighlighted ? 'scale-125 z-50' : 'hover:scale-110'}`}>
                  <GlassPinIcon className="w-[48px] h-[60px] drop-shadow-xl" accentColor={pin.collectionColor || "#1A1A1A"} />
                  {isHighlighted && <div className="absolute inset-0 rounded-full border border-white/60 animate-pulse pointer-events-none" style={{ borderRadius: '50%', transform: 'scale(0.8) translateY(-10%)' }} />}
                </div>
              </div>
            </Marker>
          );
        })}

        {mode === 'pin' && selectedPoint && (
          <Marker
            longitude={selectedPoint.lng}
            latitude={selectedPoint.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onPendingPinCancel?.();
            }}
          >
             <div className="flex flex-col items-center gap-3">
               <div className="relative animate-bounce cursor-pointer" title="Click to cancel pending pin">
                 <GlassPinIcon className="w-[64px] h-[80px] drop-shadow-2xl" />
               </div>
             </div>
          </Marker>
        )}

        {location ? (
          <Marker
            longitude={location.lng}
            latitude={location.lat}
            anchor="center"
          >
            <div className="pointer-events-none relative flex h-5 w-5 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#2f6bff]/20 animate-ping" />
              <span className="absolute inset-[2px] rounded-full bg-[#2f6bff]/25" />
              <span className="relative h-3 w-3 rounded-full border-2 border-white bg-[#2f6bff] shadow-[0px_4px_14px_rgba(47,107,255,0.45)]" />
            </div>
          </Marker>
        ) : null}
      </Map>

      <div className="pointer-events-none absolute right-4 top-20 z-30 flex flex-col gap-2 md:right-6 md:top-28">
        <button
          type="button"
          onClick={() => requestLocation("manual")}
          className={`pointer-events-auto group relative flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-[20px] border border-black/12 bg-[#f8f6f1]/95 text-neutral-900 shadow-[0px_12px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-transform hover:scale-[1.02] ${
            permissionState === "denied" ? "text-[#b42318]" : ""
          }`}
          aria-label={getLocateButtonLabel(permissionState, isLocating)}
          title={getLocateButtonLabel(permissionState, isLocating)}
        >
          <span
            className={`absolute inset-y-0 left-0 w-[4px] ${
              permissionState === "denied"
                ? "bg-[#ff3b30]"
                : permissionState === "granted"
                  ? "bg-[#2f6bff]"
                  : "bg-[#ffd84d]"
            }`}
          />
          {isLocating ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <LocateFixed className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          )}
        </button>
        <button
          type="button"
          onClick={() =>
            mapRef.current?.easeTo({
              zoom: Math.min((mapRef.current?.getZoom() ?? 12) + 1, 20),
              duration: 250,
            })
          }
          className="pointer-events-auto group relative flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-[20px] border border-black/12 bg-[#f8f6f1]/95 text-neutral-900 shadow-[0px_12px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-transform hover:scale-[1.02]"
          aria-label="Zoom in"
        >
          <span className="absolute inset-y-0 left-0 w-[4px] bg-[#ff0000]" />
          <span className="text-[30px] font-extralight leading-none transition-transform duration-200 group-hover:scale-110">+</span>
        </button>
        <button
          type="button"
          onClick={() =>
            mapRef.current?.easeTo({
              zoom: Math.max((mapRef.current?.getZoom() ?? 12) - 1, 2),
              duration: 250,
            })
          }
          className="pointer-events-auto group relative flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-[20px] border border-black/12 bg-[#f8f6f1]/95 text-neutral-900 shadow-[0px_12px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-transform hover:scale-[1.02]"
          aria-label="Zoom out"
        >
          <span className="absolute inset-y-0 left-0 w-[4px] bg-[#0000ff]" />
          <span className="mb-[3px] text-[32px] font-extralight leading-none transition-transform duration-200 group-hover:scale-110">−</span>
        </button>
      </div>
    </div>
  );
}
