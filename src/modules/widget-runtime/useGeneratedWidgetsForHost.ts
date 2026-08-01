"use client";

import { useEffect, useRef, useState } from "react";
import { getGeneratedWidgetsForHost } from "@/app/actions";
import type { GeneratedWidgetRecord } from "@/app/actions";
import type { WidgetHost } from "@/modules/shell/widget-hosts";

const CHANNEL = "synarava-widget-library";
const STORAGE_KEY = "synarava:widget-library:changed";

export function useGeneratedWidgetsForHost(host: WidgetHost, enabled = true): GeneratedWidgetRecord[] {
  const [widgets, setWidgets] = useState<GeneratedWidgetRecord[]>([]);
  const hostRef = useRef(host);
  hostRef.current = host;

  // Stable fetch function via ref so BroadcastChannel handler never goes stale
  const fetchRef = useRef(() => {
    void getGeneratedWidgetsForHost(hostRef.current).then(setWidgets).catch(console.error);
  });

  useEffect(() => {
    if (!enabled) return;
    fetchRef.current();
  }, [host, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const channel = typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(CHANNEL);

    const handleChange = () => fetchRef.current();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) handleChange();
    };

    channel?.addEventListener("message", handleChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      channel?.removeEventListener("message", handleChange);
      channel?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [enabled]);

  return widgets;
}
