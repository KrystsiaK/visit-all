"use client";

import { useEffect } from "react";
import { useOptionalSignalBusApi } from "@synarava/wiring-engine";
import { useEntityMeta, useEntityData } from "@/modules/entity/EntityContext";

/**
 * Reads from EntityContext and publishes entity data to the shared signal bus
 * so AI-generated widgets can consume it via usePortConsumer.
 *
 * Must render inside EntityProvider + SignalBusProvider.
 * Pairs with EntityWiringProvider which resolves entity_ port keys to bus keys.
 */
export function EntitySignalBridge() {
  const bus = useOptionalSignalBusApi();
  const { normalizedEntity } = useEntityMeta();
  const { entityTitle, pinImage, entityRating } = useEntityData();

  useEffect(() => {
    if (!bus) return;
    const { setSignal } = bus.getState();

    setSignal("entity_title", entityTitle || normalizedEntity.title || "");
    setSignal("entity_description", normalizedEntity.description ?? "");
    setSignal("entity_type", normalizedEntity.type ?? "pin");
    setSignal("entity_image", pinImage ?? normalizedEntity.imageUrl ?? "");
    setSignal("entity_collection", normalizedEntity.collection?.name ?? "");
    setSignal("entity_rating", entityRating ?? 0);
  }, [
    bus,
    entityTitle,
    pinImage,
    entityRating,
    normalizedEntity.title,
    normalizedEntity.description,
    normalizedEntity.type,
    normalizedEntity.imageUrl,
    normalizedEntity.collection,
  ]);

  return null;
}