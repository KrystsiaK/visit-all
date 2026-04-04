"use client";

import { useEffect, useState } from "react";

import {
  addWidgetFromLibrary,
  getGlobalWidgets,
  getWidgetLibraryCatalog,
  reorderGlobalWidgets,
} from "@/app/actions";
import { useShellWidgetReorder } from "@/components/shells/useShellWidgetReorder";
import type { WidgetLibraryCatalogRecord } from "@/app/actions";
import type { WidgetEntityType, WidgetInstanceRecord } from "@/lib/widgets";

interface UseGlobalWidgetBindingsProps {
  isOpen: boolean;
  entityType?: WidgetEntityType;
  entityId?: string;
}

export const useGlobalWidgetBindings = ({
  isOpen,
  entityType,
  entityId,
}: UseGlobalWidgetBindingsProps) => {
  const [widgets, setWidgets] = useState<WidgetInstanceRecord[]>([]);
  const [definitions, setDefinitions] = useState<WidgetLibraryCatalogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [addingSlug, setAddingSlug] = useState<string | null>(null);

  const {
    draggedWidgetId,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  } = useShellWidgetReorder({
    widgets,
    onReorder: (nextWidgets) => {
      setWidgets(nextWidgets);

      void reorderGlobalWidgets(nextWidgets.map((widget) => widget.id)).catch((error) => {
        console.error(error);
      });
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);

      try {
        const instances = await getGlobalWidgets();

        if (!cancelled) {
          setWidgets(instances);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setWidgets([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!libraryOpen) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const nextDefinitions = await getWidgetLibraryCatalog(entityType, entityId);

        if (!cancelled) {
          setDefinitions(nextDefinitions);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setDefinitions([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entityId, entityType, libraryOpen]);

  const handleAddWidgetFromLibrary = async (slug: string) => {
    setAddingSlug(slug);

    try {
      await addWidgetFromLibrary(slug, entityType, entityId);
      const nextWidgets = await getGlobalWidgets();
      setWidgets(nextWidgets);
      const nextDefinitions = await getWidgetLibraryCatalog(entityType, entityId);
      setDefinitions(nextDefinitions);
      setLibraryOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setAddingSlug(null);
    }
  };

  return {
    widgets,
    definitions,
    loading,
    libraryOpen,
    addingSlug,
    draggedWidgetId,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    setLibraryOpen,
    handleAddWidgetFromLibrary,
  };
};
