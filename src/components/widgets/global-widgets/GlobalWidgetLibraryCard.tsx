"use client";

import { Plus } from "lucide-react";

import { Tooltip } from "@/components/ui/Tooltip";
import { LibraryWidgetPreview } from "@/components/widgets/global-widgets/LibraryWidgetPreview";
import { getWidgetHostLabel } from "@/lib/widget-hosts";
import type { WidgetLibraryCatalogRecord } from "@/app/actions";

interface GlobalWidgetLibraryCardProps {
  definition: WidgetLibraryCatalogRecord;
  onAdd: (slug: string) => void;
  adding: boolean;
}

export const GlobalWidgetLibraryCard = ({
  definition,
  onAdd,
  adding,
}: GlobalWidgetLibraryCardProps) => {
  const disabled = adding || !definition.canAdd;

  return (
    <div className="flex flex-col gap-3">
      <div className={disabled ? "opacity-65" : undefined}>
        <LibraryWidgetPreview definition={definition} />
      </div>

      <div className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
            {definition.layer}
          </p>
          <p className="mt-1 text-xs font-medium text-neutral-700">
            Native shell: {getWidgetHostLabel(definition.nativeHost)}
          </p>
          {definition.disabledReason ? (
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              {definition.disabledReason}
            </p>
          ) : null}
        </div>
        <Tooltip label={definition.canAdd ? "Add Widget" : definition.disabledReason ?? "Unavailable"}>
          <button
            type="button"
            onClick={() => onAdd(definition.slug)}
            disabled={disabled}
            className="flex h-11 min-w-11 items-center justify-center rounded-2xl border border-black/10 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
