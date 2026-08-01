"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";

import { memo, useMemo, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import type { EntityMediaItemRecord } from "@/app/actions";
import { GalleryLayoutSwitcher, type GalleryLayoutMode, MediaLightbox, Tooltip, DestructiveActionDialog, EmptySection, RemoveWidgetButton } from "@synarava/ui-kit";
import { BaseWidget } from "@synarava/shell-kit";
import { normalizeWidgetBackgroundStyle } from "@/modules/shell/widget-background-style";
import {
  useCurrentWidget,
  useEntityMeta,
  useEntityData,
  useEntityWriteState,
  useEntityActions,
} from "@/modules/entity/EntityContext";

function getTileClass(layout: GalleryLayoutMode, index: number, count: number): string {
  if (layout === "strip") return "aspect-[3/4] w-[160px] shrink-0";
  if (layout === "grid") return "aspect-square";
  if (count === 1) return "col-span-2 aspect-[16/10]";
  if (count === 2) return "aspect-[4/5]";
  if (index === 0) return "col-span-2 aspect-[16/9]";
  return "aspect-square";
}

export const EntityGalleryWidgetCard = memo(function EntityGalleryWidgetCard() {
  const widget = useCurrentWidget();
  const { normalizedEntity: entity, entityInteractionsUnavailable } = useEntityMeta();
  const { mediaItems } = useEntityData();
  const { saving, mediaSaving, removingWidgetId } = useEntityWriteState();
  const { handleImageUpload, handleMediaItemDelete, handleUpdateWidgetBackground, handleRemoveWidget } = useEntityActions();

  const canRemove = widget ? widget.slug !== "entity_info" : false;
  const removing = removingWidgetId === widget?.id;
  const interactionDisabled = entityInteractionsUnavailable || saving || mediaSaving;

  const [layout, setLayout] = useState<GalleryLayoutMode>("mosaic");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [pendingDeleteMediaItemId, setPendingDeleteMediaItemId] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const sortedMediaItems = useMemo(
    () => [...mediaItems].sort((a: EntityMediaItemRecord, b: EntityMediaItemRecord) => a.position - b.position),
    [mediaItems]
  );

  const handleUploadInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    for (const file of files) {
      await handleImageUpload(file);
    }
    input.value = "";
  };

  const viewerOpen = viewerIndex !== null && sortedMediaItems[viewerIndex];
  const pendingDeleteMediaItem = sortedMediaItems.find((item) => item.id === pendingDeleteMediaItemId) ?? null;

  return (
    <>
      <BaseWidget {...WIDGET_GLASS}
        dataTestId="entity-gallery-widget"
        eyebrow="Gallery"
        title={widget?.name ?? "Gallery"}
        subtitle={`Visual media attached to this ${entity.type}.`}
        backgroundStyle={widget ? (normalizeWidgetBackgroundStyle(widget.config.chromeBackgroundStyle) ?? "default") : "default"}
        onBackgroundStyleChange={widget ? (style) => void handleUpdateWidgetBackground(widget.id, style) : undefined}
        settingsContent={canRemove && widget ? <RemoveWidgetButton onRemove={() => void handleRemoveWidget(widget.id)} removing={removing} /> : null}
      >
        <div className="rounded-xl bg-white/40 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Media Items</p>
              <p className="mt-1 text-sm text-neutral-700">
                {sortedMediaItems.length === 0 ? "No media yet" : `${sortedMediaItems.length} image${sortedMediaItems.length === 1 ? "" : "s"} attached`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {sortedMediaItems.length > 1 ? <GalleryLayoutSwitcher value={layout} onChange={setLayout} disabled={interactionDisabled} /> : null}
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                disabled={interactionDisabled}
                className="flex min-h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImagePlus className="h-4 w-4" />
                {mediaSaving ? "Uploading..." : "Add Media"}
              </button>
              <input
                ref={uploadInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                disabled={interactionDisabled}
                onChange={(event) => { void handleUploadInput(event); }}
              />
            </div>
          </div>
        </div>

        {sortedMediaItems.length === 0 ? (
          <EmptySection className="mt-4">
            Build a visual gallery for this entity. Images are stored through the canonical media layer and the image storage adapter, not inside the widget itself.
          </EmptySection>
        ) : layout === "strip" ? (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1" data-testid="gallery-layout-strip">
            {sortedMediaItems.map((item, index) => (
              <div key={item.id} className={`${getTileClass(layout, index, sortedMediaItems.length)} relative overflow-hidden rounded-[24px] border border-black/8 bg-white/55 shadow-[0px_12px_24px_rgba(0,0,0,0.06)]`}>
                <button type="button" className="h-full w-full" disabled={interactionDisabled} onClick={() => setViewerIndex(index)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.publicUrl} alt={item.caption || `${entity.title} media ${index + 1}`} className="h-full w-full object-cover" />
                </button>
                <Tooltip label="Remove Media">
                  <button type="button" onClick={() => setPendingDeleteMediaItemId(item.id)} disabled={interactionDisabled} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-neutral-800 transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
            ))}
          </div>
        ) : (
          <div className={`mt-4 grid gap-3 ${layout === "grid" ? "grid-cols-3" : "grid-cols-2"}`} data-testid={`gallery-layout-${layout}`}>
            {sortedMediaItems.map((item, index) => (
              <div key={item.id} className={`${getTileClass(layout, index, sortedMediaItems.length)} group relative overflow-hidden rounded-[24px] border border-black/8 bg-white/55 shadow-[0px_12px_24px_rgba(0,0,0,0.06)]`}>
                <button type="button" className="h-full w-full" disabled={interactionDisabled} onClick={() => setViewerIndex(index)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.publicUrl} alt={item.caption || `${entity.title} media ${index + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                </button>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent px-4 pb-4 pt-10">
                  <p className="truncate text-sm font-medium text-white">{item.caption || `Image ${index + 1}`}</p>
                </div>
                <Tooltip label="Remove Media">
                  <button type="button" onClick={() => setPendingDeleteMediaItemId(item.id)} disabled={interactionDisabled} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-neutral-800 transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </BaseWidget>

      <DestructiveActionDialog
        open={Boolean(pendingDeleteMediaItem)}
        saving={saving}
        eyebrow="Delete Image"
        title={pendingDeleteMediaItem?.caption || "Gallery Image"}
        description="This image will be removed from the entity gallery, but the widget and the rest of the gallery will stay in place."
        confirmLabel="Delete Image"
        onCancel={() => setPendingDeleteMediaItemId(null)}
        onConfirm={() => {
          if (!pendingDeleteMediaItem) return;
          void handleMediaItemDelete(pendingDeleteMediaItem.id).finally(() => setPendingDeleteMediaItemId(null));
        }}
      />

      <MediaLightbox
        open={Boolean(viewerOpen)}
        mediaItems={sortedMediaItems}
        activeIndex={viewerIndex ?? 0}
        entityTitle={entity.title}
        onClose={() => setViewerIndex(null)}
        onChangeIndex={setViewerIndex}
      />
    </>
  );
});
