"use client";

import { useState } from "react";
import { ExecutedWidget } from "@synarava/widget-generator/executor";
import { placeGeneratedWidget, archiveGeneratedWidget } from "@/app/actions";
import { WIDGET_SANDBOX_MODULES } from "@/modules/widget-runtime/sandbox-modules";
import { notifyWidgetLibraryChanged } from "@/modules/widget-runtime/notifyWidgetLibraryChanged";
import { WidgetLibraryCard } from "@/components/widgets/global-widgets/WidgetLibraryCard";
import type { GeneratedWidgetRecord } from "@/app/actions";
import type { WidgetHost } from "@/modules/shell/widget-hosts";

const GENERATED_WIDGET_HOSTS: WidgetHost[] = [
  "left_sidebar",
  "shared_entity_shell",
  "user_shell",
];

interface GeneratedWidgetLibraryCardProps {
  widget: GeneratedWidgetRecord;
  onPlaced?: () => void;
}

export function GeneratedWidgetLibraryCard({ widget, onPlaced }: GeneratedWidgetLibraryCardProps) {
  const [placing, setPlacing] = useState(false);

  const placedHosts = widget.targetHosts as WidgetHost[];
  const availableHosts = GENERATED_WIDGET_HOSTS.filter((h) => !placedHosts.includes(h));

  const handlePlace = async (hosts: WidgetHost[]) => {
    if (hosts.length === 0) return;
    setPlacing(true);
    try {
      const nextHosts = Array.from(new Set([...placedHosts, ...hosts]));
      await placeGeneratedWidget(widget.id, nextHosts);
      notifyWidgetLibraryChanged();
      onPlaced?.();
    } finally {
      setPlacing(false);
    }
  };

  const handleDelete = async () => {
    await archiveGeneratedWidget(widget.id);
    notifyWidgetLibraryChanged();
    onPlaced?.();
  };

  const chips: string[] = [];
  if (widget.ports.length > 0) {
    chips.push(`${widget.ports.length} port${widget.ports.length !== 1 ? "s" : ""}`);
  }

  return (
    <WidgetLibraryCard
      name={widget.name}
      eyebrow="AI Generated"
      isGenerated
      description={widget.description}
      chips={chips}
      preview={
        <div className="p-2">
          <ExecutedWidget
            code={widget.componentCode}
            modules={WIDGET_SANDBOX_MODULES}
            onError={() => undefined}
          />
        </div>
      }
      actionMode={availableHosts.length > 0 ? "choose-many" : "unavailable"}
      placedHosts={placedHosts}
      availableHosts={availableHosts}
      adding={placing}
      disabledReason={placedHosts.length > 0 ? `In: ${placedHosts.join(", ")}` : null}
      onAdd={handlePlace}
      onDelete={handleDelete}
      deleteTitle={widget.name}
      deleteDescription="This AI widget will be permanently removed from all shells and the library."
    />
  );
}