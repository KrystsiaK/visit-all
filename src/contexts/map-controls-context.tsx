"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { MapStyleId } from "@/modules/map/config";

export interface MapControlsContextValue {
  mapStyleId: MapStyleId;
  setMapStyleId: (value: MapStyleId) => void;
  terrain3D: boolean;
  setTerrain3D: (v: boolean) => void;
  curveMode: boolean;
  setCurveMode: (v: boolean) => void;
  onResetView: () => void;
  disabled: boolean;
}

const MapControlsContext = createContext<MapControlsContextValue | null>(null);

export function useMapControls(): MapControlsContextValue {
  const ctx = useContext(MapControlsContext);
  if (!ctx) throw new Error("useMapControls must be used within MapControlsProvider");
  return ctx;
}

interface MapControlsProviderProps {
  children: ReactNode;
  mapStyleId: MapStyleId;
  setMapStyleId: (value: MapStyleId) => void;
  terrain3D: boolean;
  setTerrain3D: (v: boolean) => void;
  curveMode: boolean;
  setCurveMode: (v: boolean) => void;
  onResetView: () => void;
  disabled: boolean;
}

export function MapControlsProvider({
  children,
  mapStyleId,
  setMapStyleId,
  terrain3D,
  setTerrain3D,
  curveMode,
  setCurveMode,
  onResetView,
  disabled,
}: MapControlsProviderProps) {
  return (
    <MapControlsContext.Provider
      value={{ mapStyleId, setMapStyleId, terrain3D, setTerrain3D, curveMode, setCurveMode, onResetView, disabled }}
    >
      {children}
    </MapControlsContext.Provider>
  );
}
