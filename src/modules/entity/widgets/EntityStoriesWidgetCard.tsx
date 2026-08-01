"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";
import { memo, useMemo, useState } from "react";
import { Eye, NotebookPen, PencilLine, Plus, Save, Trash2, X } from "lucide-react";
import type { EntityStoryEntryRecord } from "@/app/actions";
import { ColorStripe, DestructiveActionDialog, EmptySection, MarkdownViewer, PillTag, RemoveWidgetButton } from "@synarava/ui-kit";
import { BaseWidget } from "@synarava/shell-kit";
import { normalizeWidgetBackgroundStyle } from "@/modules/shell/widget-background-style";
import {
  useCurrentWidget,
  useEntityMeta,
  useEntityData,
  useEntityWriteState,
  useEntityActions,
} from "@/modules/entity/EntityContext";

interface NoteDraftState {
  storyEntryId: string | null;
  bodyMarkdown: string;
}

function getFirstMeaningfulMarkdownLine(bodyMarkdown: string): string | null {
  return bodyMarkdown.split("\n").map((line) => line.replace(/^#+\s*/, "").trim()).find((line) => line.length > 0) ?? null;
}

function getNoteDisplayTitle(title: string | null, bodyMarkdown: string, index: number): string {
  const firstLine = getFirstMeaningfulMarkdownLine(bodyMarkdown);
  if (firstLine) return firstLine;
  if (title?.trim()) return title.trim();
  return `Note ${String(index + 1).padStart(2, "0")}`;
}

export const EntityStoriesWidgetCard = memo(function EntityStoriesWidgetCard() {
  const widget = useCurrentWidget();
  const { normalizedEntity: entity } = useEntityMeta();
  const { storyEntries } = useEntityData();
  const { saving, storySaving, removingWidgetId } = useEntityWriteState();
  const { handleSaveStoryEntry, handleRemoveStoryEntry, handleUpdateWidgetBackground, handleRemoveWidget } = useEntityActions();

  const canRemove = widget ? widget.slug !== "entity_info" : false;
  const removing = removingWidgetId === widget?.id;
  const isSaving = saving || storySaving;

  const orderedEntries = useMemo(() => [...storyEntries].sort((a, b) => a.position - b.position), [storyEntries]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(orderedEntries[0]?.id ?? null);
  const [editingDraft, setEditingDraft] = useState<NoteDraftState | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const activeEntry =
    editingDraft?.storyEntryId
      ? orderedEntries.find((e) => e.id === editingDraft.storyEntryId) ?? null
      : orderedEntries.find((e) => e.id === selectedEntryId) ?? orderedEntries[0] ?? null;

  const pendingDeleteEntry = orderedEntries.find((e) => e.id === pendingDeleteId) ?? null;

  const handleStartNew = () => { setValidationMessage(null); setEditingDraft({ storyEntryId: null, bodyMarkdown: "" }); };
  const handleStartEdit = (entry: EntityStoryEntryRecord) => { setValidationMessage(null); setSelectedEntryId(entry.id); setEditingDraft({ storyEntryId: entry.id, bodyMarkdown: entry.bodyMarkdown }); };
  const handleCancelEdit = () => { setValidationMessage(null); setEditingDraft(null); };

  const handleSave = async () => {
    if (!editingDraft) return;
    if (!editingDraft.bodyMarkdown.trim()) { setValidationMessage("Write note content before saving."); return; }
    await handleSaveStoryEntry({ storyEntryId: editingDraft.storyEntryId, title: null, bodyMarkdown: editingDraft.bodyMarkdown });
    if (editingDraft.storyEntryId) setSelectedEntryId(editingDraft.storyEntryId);
    setValidationMessage(null);
    setEditingDraft(null);
  };

  return (
    <>
      <BaseWidget {...WIDGET_GLASS}
        dataTestId="entity-stories-widget"
        eyebrow="Notes"
        title={widget?.name ?? "Notes"}
        subtitle={`Markdown notes for this ${entity.type}.`}
        backgroundStyle={widget ? (normalizeWidgetBackgroundStyle(widget.config.chromeBackgroundStyle) ?? "default") : "default"}
        onBackgroundStyleChange={widget ? (style) => void handleUpdateWidgetBackground(widget.id, style) : undefined}
        sizeMode={editingDraft ? "expanded" : "compact"}
        settingsContent={canRemove && widget ? <RemoveWidgetButton onRemove={() => void handleRemoveWidget(widget.id)} removing={removing} /> : null}
        accent={
          <div className="grid h-8 w-8 grid-cols-2 grid-rows-2 overflow-hidden rounded-xl border border-black/10">
            <span className="bg-[#ff0000]" /><span className="bg-[#ffff00]" /><span className="bg-[#0000ff]" /><span className="bg-[#f8f6f1]" />
          </div>
        }
      >
        <div className="rounded-[24px] bg-white/42 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Notes Collection</p>
              <p className="mt-1 text-sm text-neutral-700">{orderedEntries.length === 0 ? "No notes yet" : `${orderedEntries.length} note${orderedEntries.length === 1 ? "" : "s"} saved`}</p>
            </div>
            <button type="button" onClick={handleStartNew} disabled={isSaving || editingDraft?.storyEntryId === null} className="flex min-h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60">
              <Plus className="h-4 w-4" /> Add Note
            </button>
          </div>
        </div>

        {orderedEntries.length > 0 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {orderedEntries.map((entry, index) => {
              const isActive = activeEntry?.id === entry.id && editingDraft?.storyEntryId !== entry.id;
              const isEditing = editingDraft?.storyEntryId === entry.id;
              return (
                <button key={entry.id} type="button" onClick={() => { setEditingDraft(null); setSelectedEntryId(entry.id); setValidationMessage(null); }}
                  className={`min-w-[180px] shrink-0 rounded-[22px] border px-4 py-3 text-left transition-all ${isEditing ? "border-[#111111] bg-[#f8f6f1]" : isActive ? "border-[#111111] bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.06)]" : "border-black/8 bg-white/55 hover:bg-white/75"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-neutral-950">{getNoteDisplayTitle(entry.title, entry.bodyMarkdown, index)}</p>
                    <PillTag>{isEditing ? "Edit" : isActive ? "Open" : "View"}</PillTag>
                  </div>
                  <p className="mt-1 truncate text-xs text-neutral-500">{entry.bodyMarkdown.trim() ? "Markdown note" : "Empty note"}</p>
                </button>
              );
            })}
          </div>
        ) : null}

        {editingDraft && editingDraft.storyEntryId === null ? (
          <div className="mt-4 rounded-[28px] border border-black/10 bg-[#f8f6f1]/92 p-5 shadow-[0px_12px_28px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">New Note</p>
                <h3 className="mt-2 text-[24px] font-black tracking-tight text-neutral-950">Drafting</h3>
              </div>
              <PillTag><NotebookPen className="h-3.5 w-3.5" />Edit</PillTag>
            </div>
            <textarea value={editingDraft.bodyMarkdown} onChange={(e) => { setValidationMessage(null); setEditingDraft((c) => c ? { ...c, bodyMarkdown: e.target.value } : c); }} placeholder={"# Why this place matters\n\nWrite the note in raw markdown."} disabled={isSaving} className="mt-5 min-h-[220px] w-full rounded-[24px] border border-black/8 bg-white/90 px-4 py-4 text-sm leading-7 text-neutral-900 outline-none placeholder:text-neutral-300 focus:border-neutral-900/20" />
            {validationMessage ? <p className="mt-3 text-sm text-[#a11a1a]">{validationMessage}</p> : null}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" onClick={handleCancelEdit} disabled={isSaving} className="flex min-h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"><X className="h-4 w-4" />Cancel</button>
              <button type="button" onClick={() => void handleSave()} disabled={isSaving} className="flex min-h-11 items-center gap-2 rounded-2xl bg-[#111111] px-4 text-sm font-medium text-white transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{isSaving ? "Saving..." : "Save Note"}</button>
            </div>
          </div>
        ) : null}

        {!editingDraft && !activeEntry ? (
          <EmptySection className="mt-4">
            Keep rich notes for this entity here: observations, logistics, curatorial thoughts, or markdown snippets.
          </EmptySection>
        ) : null}

        {activeEntry ? (
          <article className="mt-4 overflow-hidden rounded-[28px] border border-black/10 bg-white/68 shadow-[0px_12px_28px_rgba(0,0,0,0.06)]">
            <ColorStripe colors={["#ff0000", "#ffff00", "#0000ff"]} />
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <PillTag>
                      {editingDraft?.storyEntryId === activeEntry.id ? <><NotebookPen className="h-3.5 w-3.5" />Editing</> : <><Eye className="h-3.5 w-3.5" />View</>}
                    </PillTag>
                    <PillTag uppercase>{entity.type}</PillTag>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingDraft?.storyEntryId === activeEntry.id ? null : (
                    <button type="button" onClick={() => handleStartEdit(activeEntry)} disabled={isSaving} className="flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"><PencilLine className="h-4 w-4" />Edit</button>
                  )}
                  <button type="button" onClick={() => setPendingDeleteId(activeEntry.id)} disabled={isSaving} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white text-neutral-700 transition-colors hover:bg-[#fff1f1] hover:text-[#a11a1a] disabled:cursor-not-allowed disabled:opacity-60"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              {editingDraft?.storyEntryId === activeEntry.id ? (
                <div className="mt-4 rounded-[24px] bg-[#f8f6f1]/92 p-4">
                  <textarea value={editingDraft.bodyMarkdown} onChange={(e) => { setValidationMessage(null); setEditingDraft((c) => c ? { ...c, bodyMarkdown: e.target.value } : c); }} placeholder={"# Why this place matters\n\nWrite the note in raw markdown."} disabled={isSaving} className="min-h-[220px] w-full rounded-[24px] border border-black/8 bg-white/90 px-4 py-4 text-sm leading-7 text-neutral-900 outline-none placeholder:text-neutral-300 focus:border-neutral-900/20" />
                  {validationMessage ? <p className="mt-3 text-sm text-[#a11a1a]">{validationMessage}</p> : null}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button type="button" onClick={handleCancelEdit} disabled={isSaving} className="flex min-h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"><X className="h-4 w-4" />Cancel</button>
                    <button type="button" onClick={() => void handleSave()} disabled={isSaving} className="flex min-h-11 items-center gap-2 rounded-2xl bg-[#111111] px-4 text-sm font-medium text-white transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{isSaving ? "Saving..." : "Save Note"}</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[24px] bg-[#f8fbff] px-5 py-5">
                  <MarkdownViewer markdown={activeEntry.bodyMarkdown} />
                </div>
              )}
            </div>
          </article>
        ) : null}

        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/40 px-3 py-3">
          <div className="flex flex-wrap gap-2">
            <PillTag>{entity.title}</PillTag>
            <PillTag uppercase>{entity.type}</PillTag>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">{editingDraft ? "Editing" : activeEntry ? "Viewing" : "Ready"}</span>
        </div>
      </BaseWidget>

      <DestructiveActionDialog
        open={Boolean(pendingDeleteEntry)}
        saving={isSaving}
        eyebrow="Delete Note"
        title={pendingDeleteEntry ? getNoteDisplayTitle(pendingDeleteEntry.title, pendingDeleteEntry.bodyMarkdown, 0) : "Note"}
        description="This note will be removed from the entity, but the rest of the notes collection will stay intact."
        confirmLabel="Delete Note"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (!pendingDeleteEntry) return;
          void handleRemoveStoryEntry(pendingDeleteEntry.id).then(() => {
            setPendingDeleteId(null);
            if (selectedEntryId === pendingDeleteEntry.id) setSelectedEntryId(null);
          });
        }}
      />
    </>
  );
});
