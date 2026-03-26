"use client";

import { useEffect, useState } from "react";

import {
  addGlobalWidget,
  getGlobalWidgets,
  getWidgetDefinitions,
  reorderGlobalWidgets,
} from "@/app/actions";
import { useShellWidgetReorder } from "@/components/shells/useShellWidgetReorder";
import type { WidgetDefinitionRecord, WidgetInstanceRecord } from "@/lib/widgets";
import type { WidgetHost } from "@/lib/widget-hosts";

interface UseGlobalWidgetBindingsProps {
  isOpen: boolean;
}

export const useGlobalWidgetBindings = ({
  isOpen,
}: UseGlobalWidgetBindingsProps) => {
  const [widgets, setWidgets] = useState<WidgetInstanceRecord[]>([]);
  const [definitions, setDefinitions] = useState<WidgetDefinitionRecord[]>([]);
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
        const nextDefinitions = await getWidgetDefinitions();

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
  }, [libraryOpen]);

  const handleAddGlobalWidget = async (slug: string, host: WidgetHost) => {
    if (host !== "widget_center") {
      return;
    }

    setAddingSlug(slug);

    try {
      await addGlobalWidget(slug);
      const nextWidgets = await getGlobalWidgets();
      setWidgets(nextWidgets);
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
    handleAddGlobalWidget,
  };
};
