"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getWidgetCenterSnapshot,
  type GeneratedWidgetRecord,
  type WidgetLibraryCatalogRecord,
} from "@/app/actions";
import type { WidgetInstanceRecord } from "@/lib/widgets";

interface WidgetLibraryState {
  widgets: WidgetInstanceRecord[];
  definitions: WidgetLibraryCatalogRecord[];
  generatedWidgets: GeneratedWidgetRecord[];
  loading: boolean;
  refresh: () => Promise<void>;
  notifyChanged: () => void;
  setWidgets: (widgets: WidgetInstanceRecord[]) => void;
}

const WidgetLibraryContext = createContext<WidgetLibraryState | null>(null);
const WIDGET_LIBRARY_CHANNEL = "synarava-widget-library";
const WIDGET_LIBRARY_STORAGE_KEY = "synarava:widget-library:changed";

export function WidgetLibraryProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetInstanceRecord[]>([]);
  const [definitions, setDefinitions] = useState<WidgetLibraryCatalogRecord[]>([]);
  const [generatedWidgets, setGeneratedWidgets] = useState<GeneratedWidgetRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getWidgetCenterSnapshot();
      setWidgets(snapshot.widgets);
      setDefinitions(snapshot.definitions);
      setGeneratedWidgets(snapshot.generatedWidgets);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh().catch((error) => {
      console.error("Failed to preload widget library", error);
    });
  }, [refresh]);

  useEffect(() => {
    const channel = typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(WIDGET_LIBRARY_CHANNEL);
    const handleChange = () => {
      void refresh().catch((error) => {
        console.error("Failed to synchronize widget library", error);
      });
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === WIDGET_LIBRARY_STORAGE_KEY) handleChange();
    };

    channel?.addEventListener("message", handleChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleChange);

    return () => {
      channel?.removeEventListener("message", handleChange);
      channel?.close();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleChange);
    };
  }, [refresh]);

  const notifyChanged = useCallback(() => {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(WIDGET_LIBRARY_CHANNEL);
      channel.postMessage({ type: "changed" });
      channel.close();
    }
    window.localStorage.setItem(WIDGET_LIBRARY_STORAGE_KEY, String(Date.now()));
  }, []);

  const value = useMemo(
    () => ({ widgets, definitions, generatedWidgets, loading, refresh, notifyChanged, setWidgets }),
    [definitions, generatedWidgets, loading, notifyChanged, refresh, widgets]
  );

  return <WidgetLibraryContext.Provider value={value}>{children}</WidgetLibraryContext.Provider>;
}

export function useWidgetLibrary(): WidgetLibraryState {
  const context = useContext(WidgetLibraryContext);
  if (!context) throw new Error("useWidgetLibrary must be used within WidgetLibraryProvider");
  return context;
}
