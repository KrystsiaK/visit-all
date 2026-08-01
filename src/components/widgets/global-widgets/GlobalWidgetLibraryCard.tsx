"use client";

import { WidgetLibraryCard } from "@/components/widgets/global-widgets/WidgetLibraryCard";
import { LibraryWidgetPreview } from "@/components/widgets/global-widgets/LibraryWidgetPreview";
import type { WidgetLibraryCatalogRecord } from "@/app/actions";
import type { WidgetHost } from "@/modules/shell/widget-hosts";

interface GlobalWidgetLibraryCardProps {
  definition: WidgetLibraryCatalogRecord;
  onAdd: (slug: string, hosts?: WidgetHost[]) => void;
  adding: boolean;
}

export const GlobalWidgetLibraryCard = ({
  definition,
  onAdd,
  adding,
}: GlobalWidgetLibraryCardProps) => {
  return (
    <WidgetLibraryCard
      name={definition.name}
      eyebrow={definition.layer}
      description={definition.placementSummary}
      preview={<LibraryWidgetPreview definition={definition} />}
      actionMode={definition.actionMode}
      placedHosts={definition.placedHosts}
      availableHosts={definition.availableHosts}
      adding={adding}
      disabledReason={definition.disabledReason}
      onAdd={(hosts) => {
        if (definition.actionMode === "automatic") {
          onAdd(definition.slug);
        } else {
          onAdd(definition.slug, hosts.length > 0 ? hosts : undefined);
        }
      }}
    />
  );
};
