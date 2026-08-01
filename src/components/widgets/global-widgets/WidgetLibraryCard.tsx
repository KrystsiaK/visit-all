"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { DeleteButton, LazyPreview, Chip } from "@synarava/ui-kit";
import { getWidgetHostLabel, type WidgetHost } from "@/modules/shell/widget-hosts";
import type { WidgetPlacementActionMode } from "@/modules/shell/widget-placement";


export interface WidgetLibraryCardProps {
  /** Widget name shown as the card title. */
  name: string;
  /** Small badge above the name: "AI Generated", "Shell", "Entity", "Global"… */
  eyebrow: string;
  /** Optional description shown below the name. */
  description?: string | null;
  /** Extra chips shown below description (e.g. "3 ports", "Signals"). */
  chips?: string[];
  /** Whether to show the ✦ AI badge on the preview. */
  isGenerated?: boolean;
  /** The live preview rendered in the card body. */
  preview: ReactNode;
  /** Controls which action button to show. */
  actionMode: WidgetPlacementActionMode;
  /** Hosts the widget is currently placed in (shown as info text). */
  placedHosts: WidgetHost[];
  /** Hosts still available to add. */
  availableHosts: WidgetHost[];
  /** Called when user confirms placement. */
  onAdd?: (hosts: WidgetHost[]) => void;
  /** Adding in progress (disables button). */
  adding?: boolean;
  /** Optional reason why the action is disabled. */
  disabledReason?: string | null;
  /** If provided, shows a delete button with confirmation. */
  onDelete?: () => Promise<void> | void;
  /** Label for delete confirmation. */
  deleteTitle?: string;
  /** Description for delete confirmation. */
  deleteDescription?: string;
}

const actionLabel: Record<WidgetPlacementActionMode, string> = {
  automatic: "Add to App",
  "choose-one": "Choose Shell",
  "choose-many": "Add to Shells",
  unavailable: "In App",
};

export function WidgetLibraryCard({
  name,
  eyebrow,
  description,
  chips = [],
  isGenerated = false,
  preview,
  actionMode,
  placedHosts,
  availableHosts,
  onAdd,
  adding = false,
  disabledReason,
  onDelete,
  deleteTitle,
  deleteDescription,
}: WidgetLibraryCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedHosts, setSelectedHosts] = useState<WidgetHost[]>([]);
  const [pickerDirection, setPickerDirection] = useState<"down" | "up">("down");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const canAdd = actionMode !== "unavailable" && availableHosts.length > 0;

  // Detect picker direction to avoid overflow off-screen
  useEffect(() => {
    if (!pickerOpen) return;
    const updateDirection = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      const pickerRect = pickerRef.current?.getBoundingClientRect();
      if (!triggerRect) { setPickerDirection("down"); return; }
      const estimated = Math.max(pickerRect?.height ?? 0, 280);
      const spaceBelow = window.innerHeight - triggerRect.bottom - 16;
      const spaceAbove = triggerRect.top - 16;
      setPickerDirection(spaceBelow < estimated && spaceAbove > spaceBelow ? "up" : "down");
    };
    updateDirection();
    window.addEventListener("resize", updateDirection);
    window.addEventListener("scroll", updateDirection, true);
    return () => {
      window.removeEventListener("resize", updateDirection);
      window.removeEventListener("scroll", updateDirection, true);
    };
  }, [pickerOpen, selectedHosts.length]);

  const handleTrigger = () => {
    if (!canAdd || adding) return;
    if (actionMode === "automatic") { onAdd?.([]); return; }
    setSelectedHosts(actionMode === "choose-one" ? [availableHosts[0]].filter(Boolean) as WidgetHost[] : []);
    setPickerOpen((v) => !v);
  };

  const toggleHost = (host: WidgetHost) => {
    setSelectedHosts((prev) =>
      actionMode === "choose-one"
        ? [host]
        : prev.includes(host) ? prev.filter((h) => h !== host) : [...prev, host]
    );
  };

  const submitSelection = () => {
    if (selectedHosts.length === 0) return;
    onAdd?.(selectedHosts);
    setPickerOpen(false);
  };

  return (
    <div className={`relative overflow-visible ${pickerOpen ? "z-30" : "z-0"}`}>
      {/* Card surface */}
      <div className="flex flex-col gap-3 rounded-[24px] border border-black/10 bg-white/72 p-4 shadow-[0px_6px_24px_rgba(0,0,0,0.06)]">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${isGenerated ? "text-[#1122ff]" : "text-neutral-400"}`}>
                {eyebrow}
              </p>
              {isGenerated && (
                <Sparkles className="h-3 w-3 text-[#1122ff]" />
              )}
            </div>
            <h3 className="mt-0.5 truncate text-sm font-black tracking-tight text-neutral-950">
              {name}
            </h3>
            {description && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                {description}
              </p>
            )}
            {chips.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {chips.map((chip) => <Chip key={chip}>{chip}</Chip>)}
              </div>
            )}
          </div>

          {onDelete && (
            <DeleteButton
              eyebrow="Delete Widget"
              title={deleteTitle ?? name}
              description={deleteDescription ?? "This widget will be permanently removed from all shells and the library."}
              confirmLabel="Delete"
              onConfirm={onDelete}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#b7102a]/20 bg-[#fff4f4] text-[#b7102a] transition-colors hover:bg-[#ffe4e4]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </DeleteButton>
          )}
        </div>

        {/* Live preview — lazy: renders only when card enters viewport */}
        <div className="overflow-hidden rounded-[18px] border border-black/8 bg-gradient-to-br from-white/60 to-white/30">
          <LazyPreview>{preview}</LazyPreview>
        </div>

        {/* Placement footer */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {placedHosts.length > 0 && (
              <p className="text-[10px] font-medium leading-5 text-neutral-500">
                {placedHosts.map((h) => getWidgetHostLabel(h)).join(", ")}
              </p>
            )}
            {disabledReason && actionMode === "unavailable" && (
              <p className="text-[10px] leading-5 text-neutral-400">{disabledReason}</p>
            )}
          </div>

          <div className="relative shrink-0">
            <button
              ref={triggerRef}
              type="button"
              onClick={handleTrigger}
              disabled={!canAdd || adding}
              className={`flex h-9 items-center gap-1.5 rounded-2xl px-3 text-xs font-black uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                actionMode === "unavailable"
                  ? "bg-black/5 text-neutral-400"
                  : "bg-[#111111] text-white hover:bg-[#1122ff]"
              }`}
            >
              {adding ? "Adding…" : actionLabel[actionMode]}
              {(actionMode === "choose-one" || actionMode === "choose-many") && (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {pickerOpen && (actionMode === "choose-one" || actionMode === "choose-many") && (
              <div
                ref={pickerRef}
                className={`absolute right-0 z-40 w-56 ${
                  pickerDirection === "up" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"
                } rounded-[20px] border border-black/10 bg-white/90 p-3 shadow-xl backdrop-blur-xl`}
              >
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  {actionMode === "choose-many" ? "Select shells" : "Select shell"}
                </p>
                <div className="flex flex-col gap-1.5">
                  {availableHosts.map((host) => {
                    const active = selectedHosts.includes(host);
                    return (
                      <button
                        key={host}
                        type="button"
                        onClick={() => toggleHost(host)}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                          active
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-black/10 bg-white text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <span>{getWidgetHostLabel(host)}</span>
                        {active && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerOpen(false)}
                    className="rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitSelection}
                    disabled={selectedHosts.length === 0}
                    className="rounded-xl bg-[#111111] px-3 py-1.5 text-xs font-black text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add to App
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
