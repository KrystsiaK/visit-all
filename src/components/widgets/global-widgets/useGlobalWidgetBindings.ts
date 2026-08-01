"use client";

import { useState } from "react";

import {
  addWidgetFromLibrary,
  getGlobalWidgets,
  reorderGlobalWidgets,
} from "@/app/actions";
import { useShellWidgetReorder } from "@synarava/shell-kit";
import type { WidgetEntityType } from "@/lib/widgets";
import type { WidgetHost } from "@/modules/shell/widget-hosts";
import { useWidgetLibrary } from "@/modules/widget-library/WidgetLibraryContext";

interface UseGlobalWidgetBindingsProps {
  isOpen: boolean;
  entityType?: WidgetEntityType;
  entityId?: string;
}

export const useGlobalWidgetBindings = ({
  entityType,
  entityId,
}: UseGlobalWidgetBindingsProps) => {
  const { widgets, definitions, loading, refresh, setWidgets } = useWidgetLibrary();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [addingSlug, setAddingSlug] = useState<string | null>(null);

  const {
    draggedWidgetId,
    dropTarget,
    handleSlotPointerDown,
  } = useShellWidgetReorder({
    shellId: "widget_center_shell",
    widgets,
    onReorder: (nextWidgets) => {
      setWidgets(nextWidgets);

      void reorderGlobalWidgets(nextWidgets.map((widget) => widget.id)).catch((error) => {
        console.error(error);
      });
    },
  });

  const handleAddWidgetFromLibrary = async (
    slug: string,
    targetHosts?: WidgetHost[],
    onLibraryMutation?: () => void
  ) => {
    setAddingSlug(slug);

    try {
      await addWidgetFromLibrary(slug, entityType, entityId, targetHosts);
      onLibraryMutation?.();
      const nextWidgets = await getGlobalWidgets();
      setWidgets(nextWidgets);
      await refresh();
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
    handleSlotPointerDown,
    setLibraryOpen,
    handleAddWidgetFromLibrary,
  };
};
