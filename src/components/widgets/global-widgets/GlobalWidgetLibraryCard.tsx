"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Tooltip } from "@/components/ui/Tooltip";
import { WidgetChrome } from "@/components/widgets/WidgetChrome";
import {
  getWidgetLibraryHostOptions,
  isWidgetHostSelectorLocked,
  type WidgetHost,
} from "@/lib/widget-hosts";
import type { WidgetDefinitionRecord } from "@/lib/widgets";

interface GlobalWidgetLibraryCardProps {
  definition: WidgetDefinitionRecord;
  onAdd: (slug: string, host: WidgetHost) => void;
  adding: boolean;
}

export const GlobalWidgetLibraryCard = ({
  definition,
  onAdd,
  adding,
}: GlobalWidgetLibraryCardProps) => {
  const hostOptions = getWidgetLibraryHostOptions(definition);
  const hostSelectorLocked = isWidgetHostSelectorLocked(definition);
  const [selectedHost, setSelectedHost] = useState<WidgetHost>(
    hostSelectorLocked
      ? (hostOptions[1]?.value ?? hostOptions[0]?.value ?? "widget_library")
      : (hostOptions[0]?.value ?? "widget_library")
  );
  const isWandererDefinition =
    definition.componentKey !== "shell_header" &&
    definition.componentKey !== "shell_chrome_primary" &&
    definition.componentKey !== "shell_mode_switch" &&
    definition.componentKey !== "shell_search" &&
    definition.componentKey !== "entity_delete";
  const canAddNow = selectedHost === "widget_center" && definition.layer === "global";

  return (
    <WidgetChrome
      title={definition.name}
      subtitle={definition.slug.replaceAll("_", " ")}
      currentHost={selectedHost}
      hostOptions={hostOptions}
      hostSelectionDisabled={hostSelectorLocked}
      onHostChange={setSelectedHost}
      settingsContent={
        <p className="text-xs leading-5 text-neutral-500">
          {isWandererDefinition
            ? canAddNow
              ? "This wanderer can be added to the Widget Center now."
              : "This wanderer belongs in the shared pool for now. Placement wiring comes next."
            : "This widget is system-bound and does not move between shells."}
        </p>
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
            {definition.layer}
          </p>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {definition.slug.replaceAll("_", " ")}
          </p>
        </div>
        <Tooltip label={canAddNow ? "Add Widget" : "Placement Not Ready"}>
          <button
            type="button"
            onClick={() => onAdd(definition.slug, selectedHost)}
            disabled={adding || !canAddNow}
            className="flex h-11 min-w-11 items-center justify-center rounded-2xl border border-black/10 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>
    </WidgetChrome>
  );
};
