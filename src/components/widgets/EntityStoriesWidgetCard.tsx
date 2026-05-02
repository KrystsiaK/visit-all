"use client";

import { Eye, NotebookPen, PencilLine, Plus, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { EntityStoryEntryRecord } from "@/app/actions";
import { DestructiveActionDialog } from "@/components/widgets/DestructiveActionDialog";
import { BaseWidget } from "@synarava/shell-kit";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";

interface EntityStoriesWidgetCardProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  storyEntries: EntityStoryEntryRecord[];
  saving: boolean;
  canRemove?: boolean;
  removing?: boolean;
  onBackgroundStyleChange?: (widgetId: string, backgroundStyle: string) => void;
  onSaveStoryEntry: (params: {
    storyEntryId?: string | null;
    title?: string | null;
    bodyMarkdown: string;
  }) => Promise<void>;
  onRemoveStoryEntry: (storyEntryId: string) => Promise<void>;
  onRemove?: () => void;
}

interface NoteDraftState {
  storyEntryId: string | null;
  bodyMarkdown: string;
}

function getFirstMeaningfulMarkdownLine(bodyMarkdown: string): string | null {
  const firstLine = bodyMarkdown
    .split("\n")
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .find((line) => line.length > 0);

  return firstLine ?? null;
}

function getNoteDisplayTitle(title: string | null, bodyMarkdown: string, index: number): string {
  const firstLine = getFirstMeaningfulMarkdownLine(bodyMarkdown);

  if (firstLine) {
    return firstLine;
  }

  if (title?.trim()) {
    return title.trim();
  }

  return `Note ${String(index + 1).padStart(2, "0")}`;
}

export function EntityStoriesWidgetCard({
  widget,
  entity,
  storyEntries,
  saving,
  canRemove = false,
  removing = false,
  onBackgroundStyleChange,
  onSaveStoryEntry,
  onRemoveStoryEntry,
  onRemove,
}: EntityStoriesWidgetCardProps) {
  const orderedEntries = useMemo(() => [...storyEntries].sort((a, b) => a.position - b.position), [storyEntries]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(orderedEntries[0]?.id ?? null);
  const [editingDraft, setEditingDraft] = useState<NoteDraftState | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const activeEntry =
    editingDraft?.storyEntryId
      ? orderedEntries.find((entry) => entry.id === editingDraft.storyEntryId) ?? null
      : orderedEntries.find((entry) => entry.id === selectedEntryId) ?? orderedEntries[0] ?? null;

  const pendingDeleteEntry = orderedEntries.find((entry) => entry.id === pendingDeleteId) ?? null;

  const handleStartNew = () => {
    setValidationMessage(null);
    setEditingDraft({
      storyEntryId: null,
      bodyMarkdown: "",
    });
  };

  const handleStartEdit = (entry: EntityStoryEntryRecord) => {
    setValidationMessage(null);
    setSelectedEntryId(entry.id);
    setEditingDraft({
      storyEntryId: entry.id,
      bodyMarkdown: entry.bodyMarkdown,
    });
  };

  const handleCancelEdit = () => {
    setValidationMessage(null);
    setEditingDraft(null);
  };

  const handleSave = async () => {
    if (!editingDraft) {
      return;
    }

    if (!editingDraft.bodyMarkdown.trim()) {
      setValidationMessage("Write note content before saving.");
      return;
    }

    await onSaveStoryEntry({
      storyEntryId: editingDraft.storyEntryId,
      title: null,
      bodyMarkdown: editingDraft.bodyMarkdown,
    });

    if (editingDraft.storyEntryId) {
      setSelectedEntryId(editingDraft.storyEntryId);
    }

    setValidationMessage(null);
    setEditingDraft(null);
  };

  return (
    <>
      <BaseWidget
        dataTestId="entity-stories-widget"
        eyebrow="Notes"
        title={widget.name}
        subtitle={`Markdown notes for this ${entity.type}.`}
        backgroundStyle={
          typeof widget.config.chromeBackgroundStyle === "string"
            ? widget.config.chromeBackgroundStyle
            : "default"
        }
        onBackgroundStyleChange={
          onBackgroundStyleChange
            ? (backgroundStyle) => onBackgroundStyleChange(widget.id, backgroundStyle)
            : undefined
        }
        sizeMode={editingDraft ? "expanded" : "compact"}
        settingsContent={
          canRemove && onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={removing}
              className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#c61f1f]/15 bg-[#fff6f6] px-4 text-sm font-medium text-[#a11a1a] transition-colors hover:bg-[#ffefef] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {removing ? "Removing..." : "Remove Widget"}
            </button>
          ) : null
        }
        accent={
          <div className="grid h-8 w-8 grid-cols-2 grid-rows-2 overflow-hidden rounded-xl border border-black/10">
            <span className="bg-[#ff0000]" />
            <span className="bg-[#ffff00]" />
            <span className="bg-[#0000ff]" />
            <span className="bg-[#f8f6f1]" />
          </div>
        }
      >
        <div className="rounded-[24px] bg-white/42 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                Notes Collection
              </p>
              <p className="mt-1 text-sm text-neutral-700">
                {orderedEntries.length === 0
                  ? "No notes yet"
                  : `${orderedEntries.length} note${orderedEntries.length === 1 ? "" : "s"} saved`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartNew}
              disabled={saving || editingDraft?.storyEntryId === null}
              className="flex min-h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add Note
            </button>
          </div>
        </div>

        {orderedEntries.length > 0 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {orderedEntries.map((entry, index) => {
              const isActive = activeEntry?.id === entry.id && editingDraft?.storyEntryId !== entry.id;
              const isEditing = editingDraft?.storyEntryId === entry.id;

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setEditingDraft(null);
                    setSelectedEntryId(entry.id);
                    setValidationMessage(null);
                  }}
                  className={`min-w-[180px] shrink-0 rounded-[22px] border px-4 py-3 text-left transition-all ${
                    isEditing
                      ? "border-[#111111] bg-[#f8f6f1]"
                      : isActive
                        ? "border-[#111111] bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.06)]"
                        : "border-black/8 bg-white/55 hover:bg-white/75"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-neutral-950">
                      {getNoteDisplayTitle(entry.title, entry.bodyMarkdown, index)}
                    </p>
                    <span className="shrink-0 rounded-full border border-black/10 bg-white/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">
                      {isEditing ? "Edit" : isActive ? "Open" : "View"}
                    </span>
                  </div>
                <p className="mt-1 truncate text-xs text-neutral-500">
                    {entry.bodyMarkdown.trim() ? "Markdown note" : "Empty note"}
                </p>
              </button>
              );
            })}
          </div>
        ) : null}

        {editingDraft && editingDraft.storyEntryId === null ? (
          <div className="mt-4 rounded-[28px] border border-black/10 bg-[#f8f6f1]/92 p-5 shadow-[0px_12px_28px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                  New Note
                </p>
                <h3 className="mt-2 text-[24px] font-black tracking-tight text-neutral-950">
                  Drafting
                </h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-600">
                <NotebookPen className="h-3.5 w-3.5" />
                Edit
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <textarea
                value={editingDraft.bodyMarkdown}
                onChange={(event) => {
                  setValidationMessage(null);
                  setEditingDraft((current) =>
                    current ? { ...current, bodyMarkdown: event.target.value } : current
                  );
                }}
                placeholder={"# Why this place matters\n\nWrite the note in raw markdown.\n\n- observations\n- references\n- practical context"}
                disabled={saving}
                className="min-h-[220px] w-full rounded-[24px] border border-black/8 bg-white/90 px-4 py-4 text-sm leading-7 text-neutral-900 outline-none transition-colors placeholder:text-neutral-300 focus:border-neutral-900/20"
              />
            </div>

            {validationMessage ? (
              <p className="mt-3 text-sm text-[#a11a1a]">{validationMessage}</p>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex min-h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex min-h-11 items-center gap-2 rounded-2xl bg-[#111111] px-4 text-sm font-medium text-white transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        ) : null}

        {!editingDraft && !activeEntry ? (
          <div className="mt-4 rounded-[24px] border border-dashed border-black/10 bg-white/35 px-5 py-6">
            <p className="text-sm leading-7 text-neutral-500">
              Keep rich notes for this entity here: observations, logistics, curatorial thoughts,
              or markdown snippets that need to stay attached to the place itself.
            </p>
          </div>
        ) : null}

        {activeEntry ? (
          <article className="mt-4 overflow-hidden rounded-[28px] border border-black/10 bg-white/68 shadow-[0px_12px_28px_rgba(0,0,0,0.06)]">
            <div className="flex h-2">
              <div className="flex-1 bg-[#ff0000]" />
              <div className="flex-1 bg-[#ffff00]" />
              <div className="flex-1 bg-[#0000ff]" />
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                      {editingDraft?.storyEntryId === activeEntry.id ? (
                        <>
                          <NotebookPen className="h-3.5 w-3.5" />
                          Editing
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </>
                      )}
                    </span>
                    <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                      {entity.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingDraft?.storyEntryId === activeEntry.id ? null : (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(activeEntry)}
                      disabled={saving}
                      className="flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PencilLine className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(activeEntry.id)}
                    disabled={saving}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white text-neutral-700 transition-colors hover:bg-[#fff1f1] hover:text-[#a11a1a] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={`Delete ${getNoteDisplayTitle(activeEntry.title, activeEntry.bodyMarkdown, 0)}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {editingDraft?.storyEntryId === activeEntry.id ? (
                <div className="mt-4 rounded-[24px] bg-[#f8f6f1]/92 p-4">
                  <div className="space-y-3">
                    <textarea
                      value={editingDraft.bodyMarkdown}
                      onChange={(event) => {
                        setValidationMessage(null);
                        setEditingDraft((current) =>
                          current ? { ...current, bodyMarkdown: event.target.value } : current
                        );
                      }}
                      placeholder={"# Why this place matters\n\nWrite the note in raw markdown.\n\n- observations\n- references\n- practical context"}
                      disabled={saving}
                      className="min-h-[220px] w-full rounded-[24px] border border-black/8 bg-white/90 px-4 py-4 text-sm leading-7 text-neutral-900 outline-none transition-colors placeholder:text-neutral-300 focus:border-neutral-900/20"
                    />
                  </div>

                  {validationMessage ? (
                    <p className="mt-3 text-sm text-[#a11a1a]">{validationMessage}</p>
                  ) : null}

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="flex min-h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={saving}
                      className="flex min-h-11 items-center gap-2 rounded-2xl bg-[#111111] px-4 text-sm font-medium text-white transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Note"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[24px] bg-[#f8fbff] px-5 py-5">
                  <div className="markdown-body [&_a]:text-[#0f55ff] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-black/10 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-600 [&_code]:rounded [&_code]:bg-black/[0.04] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.92em] [&_em]:italic [&_h1]:text-[28px] [&_h1]:font-black [&_h1]:tracking-tight [&_h2]:mt-6 [&_h2]:text-[22px] [&_h2]:font-black [&_h2]:tracking-tight [&_hr]:my-6 [&_hr]:border-black/8 [&_li]:ml-5 [&_li]:list-disc [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:my-3 [&_p]:text-[15px] [&_p]:leading-7 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-[#111111] [&_pre]:p-4 [&_pre]:text-white [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_td]:border-b [&_td]:border-black/8 [&_td]:px-3 [&_td]:py-2 [&_th]:border-b [&_th]:border-black/10 [&_th]:px-3 [&_th]:py-2 [&_th]:font-black [&_ul]:space-y-2 [&_ul]:pl-5 text-neutral-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {activeEntry.bodyMarkdown || "_Empty markdown note._"}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </article>
        ) : null}

        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/40 px-3 py-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-[#525252]">
              {entity.title}
            </span>
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium uppercase text-[#525252]">
              {entity.type}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
            {editingDraft ? "Editing" : activeEntry ? "Viewing" : "Ready"}
          </span>
        </div>
      </BaseWidget>

      <DestructiveActionDialog
        open={Boolean(pendingDeleteEntry)}
        saving={saving}
        eyebrow="Delete Note"
        title={pendingDeleteEntry ? getNoteDisplayTitle(pendingDeleteEntry.title, pendingDeleteEntry.bodyMarkdown, 0) : "Note"}
        description="This note will be removed from the entity, but the rest of the notes collection will stay intact."
        confirmLabel="Delete Note"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (!pendingDeleteEntry) {
            return;
          }

          void onRemoveStoryEntry(pendingDeleteEntry.id).then(() => {
            setPendingDeleteId(null);
            if (selectedEntryId === pendingDeleteEntry.id) {
              setSelectedEntryId(null);
            }
          });
        }}
      />
    </>
  );
}
