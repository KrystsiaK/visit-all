"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type FeatureType = 'pin' | 'trace' | 'area';

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
  // Raw properties associated with the geospatial feature
  properties: FeatureProperties;
  // Extracted coordinates for Quick Fly-To hooks
  coordinates?: { lng: number; lat: number };
}

interface WidgetContextType {
  activeFeature: ActiveFeature | null;
  setActiveFeature: (feature: ActiveFeature | null) => void;
  // Commands directed from Widgets -> Map
  flyToMapCommand: { lng: number; lat: number; zoom?: number } | null;
  triggerFlyTo: (lng: number, lat: number, zoom?: number) => void;
  clearFlyToMapCommand: () => void;
  // Ghost Highlights: Allows a widget to highlight map geo-boundaries
  highlightedFeatureId: string | null;
  setHighlightedFeatureId: (id: string | null) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [activeFeature, setActiveFeature] = useState<ActiveFeature | null>(null);
  const [flyToMapCommand, setFlyToMapCommand] = useState<{ lng: number; lat: number; zoom?: number } | null>(null);
  const [highlightedFeatureId, setHighlightedFeatureId] = useState<string | null>(null);

  const triggerFlyTo = (lng: number, lat: number, zoom?: number) => {
    setFlyToMapCommand({ lng, lat, zoom });
  };

  const clearFlyToMapCommand = () => {
    setFlyToMapCommand(null);
  };

  return (
    <WidgetContext.Provider value={{
      activeFeature, setActiveFeature,
      flyToMapCommand, triggerFlyTo, clearFlyToMapCommand,
      highlightedFeatureId, setHighlightedFeatureId
    }}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgetContext() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error("useWidgetContext must be used within a WidgetProvider");
  }
  return context;
}
