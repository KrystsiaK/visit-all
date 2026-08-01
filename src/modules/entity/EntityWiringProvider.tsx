"use client";

import { useMemo, type ReactNode } from "react";
import { WiringEngineContext, type WiringEngineContextValue } from "@synarava/wiring-engine";
import { ENTITY_SHELL_WIRING_CONFIG, ENTITY_SIGNAL_KEYS } from "@/modules/shell/wiring/entity-shell-wiring";

interface EntityWiringProviderProps {
  children: ReactNode;
}

/**
 * Provides wiring context for the entity shell.
 *
 * Entity signal ports (entity_title, entity_image, etc.) are resolved
 * directly to their bus key regardless of widget key. This allows
 * AI-generated widgets with unknown keys to consume entity data via
 * usePortConsumer("any_key", "entity_title", "").
 */
export function EntityWiringProvider({ children }: EntityWiringProviderProps) {
  const value = useMemo<WiringEngineContextValue>(() => ({
    config: ENTITY_SHELL_WIRING_CONFIG,
    resolveOutputKey: () => null,
    resolveInputKey: (_widgetKey: string, portKey: string): string | null => {
      // Entity signals pass through directly as bus keys
      if ((ENTITY_SIGNAL_KEYS as readonly string[]).includes(portKey)) {
        return portKey;
      }
      return null;
    },
  }), []);

  return (
    <WiringEngineContext.Provider value={value}>
      {children}
    </WiringEngineContext.Provider>
  );
}