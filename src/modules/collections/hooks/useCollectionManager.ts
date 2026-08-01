"use client";

import { useState, useEffect, useCallback, useMemo, useReducer } from "react";
import { getCollections } from "@/app/actions";
import type { Collection } from "@/modules/collections/types";
import {
  createLayerVisibilityState,
  getInvisibleCollectionIdsFromState,
  layerVisibilityReducer,
} from "@/modules/collections/layer-visibility";

export function useCollectionManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [targetCollectionId, setTargetCollectionId] = useState("");
  const [dbRefreshTrigger, setDbRefreshTrigger] = useState(0);
  const [layerVisibility, dispatchLayerVisibility] = useReducer(
    layerVisibilityReducer,
    undefined,
    () => createLayerVisibilityState()
  );

  const triggerRefresh = useCallback(() => setDbRefreshTrigger((v) => v + 1), []);

  const registerCollection = useCallback((collection: Collection) => {
    setCollections((prev) => {
      const without = prev.filter((c) => c.id !== collection.id);
      return [collection, ...without];
    });
    setAllCollections((prev) => {
      const without = prev.filter((c) => c.id !== collection.id);
      const next = [collection, ...without];
      dispatchLayerVisibility({ type: "sync", collectionIds: next.map((c) => c.id) });
      return next;
    });
  }, []);

  const unregisterCollection = useCallback((collectionId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    setAllCollections((prev) => {
      const next = prev.filter((c) => c.id !== collectionId);
      dispatchLayerVisibility({ type: "sync", collectionIds: next.map((c) => c.id) });
      return next;
    });
  }, []);

  const revealCollection = useCallback((collectionId: string) => {
    dispatchLayerVisibility({ type: "reveal", collectionId });
  }, []);

  const toggleCollectionVisibility = useCallback((collectionId: string) => {
    dispatchLayerVisibility({ type: "toggle-mute", collectionId });
  }, []);

  const showOnlyCollection = useCallback((collectionId: string) => {
    dispatchLayerVisibility({ type: "toggle-solo", collectionId });
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getCollections();
        setCollections(data);
        if (data.length > 0) {
          const exists = data.find((c) => c.id === targetCollectionId);
          if (!exists) setTargetCollectionId(data[0].id);
        } else {
          setTargetCollectionId("");
        }
      } catch (err) { console.error("Failed to load collections", err); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbRefreshTrigger]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getCollections();
        setAllCollections(data);
        dispatchLayerVisibility({ type: "sync", collectionIds: data.map((c) => c.id) });
      } catch (err) { console.error("Failed to load all collections", err); }
    })();
  }, [dbRefreshTrigger]);

  useEffect(() => {
    if (collections.length === 0) return;
    setAllCollections((current) => {
      let changed = false;
      const next = current.map((cur) => {
        const updated = collections.find((c) => c.id === cur.id);
        if (!updated) return cur;
        if (updated.name === cur.name && updated.color === cur.color && updated.icon === cur.icon && updated.itemCount === cur.itemCount) return cur;
        changed = true;
        return { ...cur, ...updated };
      });
      return changed ? next : current;
    });
  }, [collections]);

  const liveCollectionStyles = useMemo(
    () => Object.fromEntries(allCollections.map((c) => [c.id, { color: c.color, icon: c.icon }])),
    [allCollections]
  );

  const invisibleCollectionIds = getInvisibleCollectionIdsFromState(allCollections, layerVisibility);

  return {
    collections,
    setCollections,
    allCollections,
    layerVisibility,
    targetCollectionId,
    setTargetCollectionId,
    dbRefreshTrigger,
    triggerRefresh,
    registerCollection,
    unregisterCollection,
    revealCollection,
    toggleCollectionVisibility,
    showOnlyCollection,
    liveCollectionStyles,
    invisibleCollectionIds,
  };
}