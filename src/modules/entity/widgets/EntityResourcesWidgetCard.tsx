"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";

import { memo, useEffect, useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { ExternalLink, Link2, Plus, Trash2 } from "lucide-react";
import type { EntityResourceLinkRecord } from "@/app/actions";
import { Tooltip, cn, EmptySection, RemoveWidgetButton } from "@synarava/ui-kit";
import { BaseWidget } from "@synarava/shell-kit";
import { normalizeWidgetBackgroundStyle } from "@/modules/shell/widget-background-style";
import {
  useCurrentWidget,
  useEntityMeta,
  useEntityData,
  useEntityWriteState,
  useEntityActions,
} from "@/modules/entity/EntityContext";

type ResourceDraft = { label: string; url: string };

function normalizeUrlInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidExternalUrl(input: string): boolean {
  const normalized = normalizeUrlInput(input);
  if (!normalized) return false;
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch { return false; }
}

function extractHostname(input: string): string | null {
  if (!isValidExternalUrl(input)) return null;
  try { return new URL(normalizeUrlInput(input)).hostname.replace(/^www\./, ""); }
  catch { return null; }
}

export const EntityResourcesWidgetCard = memo(function EntityResourcesWidgetCard() {
  const widget = useCurrentWidget();
  const { normalizedEntity: entity } = useEntityMeta();
  const { resourceLinks: resources } = useEntityData();
  const { saving, removingWidgetId } = useEntityWriteState();
  const { handleAddResourceLink, handleRemoveResourceLink, handleCommitResourceLink, handleUpdateWidgetBackground, handleRemoveWidget } = useEntityActions();

  const canRemove = widget ? widget.slug !== "entity_info" : false;
  const removing = removingWidgetId === widget?.id;

  const [drafts, setDrafts] = useState<Record<string, ResourceDraft>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [brokenPreviewImages, setBrokenPreviewImages] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts((current) => {
      const next: Record<string, ResourceDraft> = {};
      for (const resource of resources) {
        next[resource.id] = current[resource.id] ?? { label: resource.label ?? "", url: resource.url };
      }
      return next;
    });
    setErrors((current) => {
      const next: Record<string, string | null> = {};
      for (const resource of resources) { next[resource.id] = current[resource.id] ?? null; }
      return next;
    });
  }, [resources]);

  const empty = resources.length === 0;
  const orderedResources = useMemo(() => [...resources].sort((a, b) => a.position - b.position), [resources]);

  const handleFieldChange = (resourceId: string, field: keyof ResourceDraft) => (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setDrafts((current) => ({ ...current, [resourceId]: { ...(current[resourceId] ?? { label: "", url: "" }), [field]: nextValue } }));
    if (errors[resourceId]) setErrors((current) => ({ ...current, [resourceId]: null }));
  };

  const commitResource = async (resource: EntityResourceLinkRecord) => {
    const draft = drafts[resource.id] ?? { label: resource.label ?? "", url: resource.url };
    const normalizedUrl = normalizeUrlInput(draft.url);
    if (!normalizedUrl) { setErrors((c) => ({ ...c, [resource.id]: "A link URL is required." })); return; }
    if (!isValidExternalUrl(normalizedUrl)) { setErrors((c) => ({ ...c, [resource.id]: "Use a valid http or https URL." })); return; }
    const nextLabel = draft.label.trim();
    if (nextLabel === (resource.label ?? "") && normalizedUrl === resource.url) {
      setDrafts((c) => ({ ...c, [resource.id]: { label: nextLabel, url: normalizedUrl } }));
      setErrors((c) => ({ ...c, [resource.id]: null }));
      return;
    }
    setSavingId(resource.id);
    try {
      await handleCommitResourceLink(resource.id, { label: nextLabel || null, url: normalizedUrl });
      setDrafts((c) => ({ ...c, [resource.id]: { label: nextLabel, url: normalizedUrl } }));
      setErrors((c) => ({ ...c, [resource.id]: null }));
    } catch {
      setErrors((c) => ({ ...c, [resource.id]: "Could not save this source yet. Please retry." }));
    } finally { setSavingId(null); }
  };

  const handleFieldKeyDown = (resource: EntityResourceLinkRecord) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") { event.preventDefault(); void commitResource(resource); }
  };

  const handleAdd = async () => { setAdding(true); try { await handleAddResourceLink(); } finally { setAdding(false); } };
  const handleRemove = async (resourceId: string) => { setRemovingId(resourceId); try { await handleRemoveResourceLink(resourceId); } finally { setRemovingId(null); } };

  return (
    <BaseWidget {...WIDGET_GLASS}
      dataTestId="entity-resources-widget"
      eyebrow="Resources"
      title={widget?.name ?? "Resources"}
      subtitle={`External references connected to this ${entity.type}.`}
      backgroundStyle={widget ? (normalizeWidgetBackgroundStyle(widget.config.chromeBackgroundStyle) ?? "default") : "default"}
      onBackgroundStyleChange={widget ? (style) => void handleUpdateWidgetBackground(widget.id, style) : undefined}
      settingsContent={canRemove && widget ? <RemoveWidgetButton onRemove={() => void handleRemoveWidget(widget.id)} removing={removing} /> : null}
    >
      <div className="flex items-center justify-between rounded-xl bg-white/40 px-4 py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Linked Sources</p>
          <p className="mt-1 text-sm text-neutral-700">{empty ? "No resources yet" : `${resources.length} source${resources.length === 1 ? "" : "s"} linked`}</p>
        </div>
        <button type="button" onClick={() => void handleAdd()} disabled={adding || saving} className="flex min-h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60">
          <Plus className="h-4 w-4" />{adding ? "Adding..." : "Add Link"}
        </button>
      </div>

      {empty ? (
        <EmptySection className="mt-4">
          Use linked sources for articles, maps, booking pages, official sites, or reference URLs that give this entity outside context.
        </EmptySection>
      ) : (
        <div className="mt-4 space-y-3">
          {orderedResources.map((resource, index) => {
            const draft = drafts[resource.id] ?? { label: resource.label ?? "", url: resource.url };
            const normalizedDraftUrl = normalizeUrlInput(draft.url);
            const hasValidUrl = isValidExternalUrl(draft.url);
            const hostname = resource.preview?.hostname ?? extractHostname(draft.url);
            const displayTitle = draft.label.trim() || resource.preview?.title || resource.preview?.siteName || hostname || `Source ${index + 1}`;
            const previewDescription = resource.preview?.description || (hasValidUrl ? resource.preview?.resolvedUrl ?? hostname : null);
            const previewTitle = resource.preview?.title || resource.preview?.siteName || hostname || null;
            const previewImageUrl = resource.preview?.status === "ready" && !brokenPreviewImages[resource.id] ? resource.preview?.imageUrl : null;
            const previewStatusLabel = resource.preview?.status === "error" ? "Preview unavailable" : resource.preview?.status === "ready" ? "Preview" : null;
            const helperText = errors[resource.id] ?? (hasValidUrl ? resource.preview?.siteName || hostname || "Source ready" : "Paste a full URL or a domain like example.com");
            const busy = savingId === resource.id || removingId === resource.id;

            return (
              <div key={resource.id} className="rounded-xl border border-black/8 bg-white/55 px-4 py-4 shadow-[0px_8px_18px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563eb] text-white"><Link2 className="h-4 w-4" /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-950">{displayTitle}</p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">{hasValidUrl ? resource.preview?.siteName || hostname : "Unsaved external link"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasValidUrl ? (
                      <Tooltip label="Open source">
                        <a href={normalizedDraftUrl} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/8 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-950"><ExternalLink className="h-4 w-4" /></a>
                      </Tooltip>
                    ) : null}
                    <Tooltip label="Remove resource">
                      <button type="button" onClick={() => void handleRemove(resource.id)} disabled={busy} className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/8 bg-white text-neutral-700 transition-colors hover:bg-[#fff1f1] hover:text-[#a11a1a] disabled:cursor-not-allowed disabled:opacity-60"><Trash2 className="h-4 w-4" /></button>
                    </Tooltip>
                  </div>
                </div>

                {previewDescription || previewTitle || previewStatusLabel ? (
                  <div className="mt-3 rounded-xl border border-black/6 bg-white/42 px-3 py-3">
                    {previewImageUrl ? (
                      <div className="mb-3 overflow-hidden rounded-[18px] border border-black/6 bg-white/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewImageUrl} alt={previewTitle ? `${previewTitle} preview` : `${displayTitle} preview`} className="h-28 w-full object-cover" loading="lazy" onError={() => setBrokenPreviewImages((c) => ({ ...c, [resource.id]: true }))} />
                      </div>
                    ) : null}
                    {previewStatusLabel ? <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">{previewStatusLabel}</p> : null}
                    {previewTitle ? <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-neutral-900">{resource.preview?.status === "error" ? hostname : previewTitle}</p> : null}
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-neutral-600">{resource.preview?.status === "error" ? "This site did not expose usable metadata for a richer card preview yet." : previewDescription}</p>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3">
                  <label className="grid gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Label</span>
                    <input type="text" value={draft.label} onChange={handleFieldChange(resource.id, "label")} onBlur={() => void commitResource(resource)} onKeyDown={handleFieldKeyDown(resource)} disabled={busy} placeholder="Official site, article, booking page..." className="min-h-11 rounded-2xl border border-black/10 bg-white/85 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-black/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">URL</span>
                    <input type="text" value={draft.url} onChange={handleFieldChange(resource.id, "url")} onBlur={() => void commitResource(resource)} onKeyDown={handleFieldKeyDown(resource)} autoFocus={!resource.url && index === orderedResources.length - 1} disabled={busy} placeholder="example.com or https://example.com"
                      className={cn("min-h-11 rounded-2xl border bg-white/85 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60", errors[resource.id] ? "border-[#d92d20]/30 focus:border-[#d92d20]/50" : "border-black/10 focus:border-black/20")} />
                  </label>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white/45 px-3 py-2.5">
                  <span className={cn("truncate text-xs", errors[resource.id] ? "text-[#b42318]" : "text-neutral-500")}>{helperText}</span>
                  {savingId === resource.id ? <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Saving</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BaseWidget>
  );
});
