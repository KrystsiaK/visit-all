"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { LiquidGlassSurface, getLiquidGlassClassName } from "@synarava/liquid-glass";

import { Tooltip } from "@/components/ui/Tooltip";
import { LibraryWidgetPreview } from "@/components/widgets/global-widgets/LibraryWidgetPreview";
import { getWidgetHostLabel, type WidgetHost } from "@/lib/widget-hosts";
import type { WidgetLibraryCatalogRecord } from "@/app/actions";

interface GlobalWidgetLibraryCardProps {
  definition: WidgetLibraryCatalogRecord;
  onAdd: (slug: string, hosts?: WidgetHost[]) => void;
  adding: boolean;
}

const actionLabelByMode = {
  automatic: "Add to App",
  "choose-one": "Choose Shell",
  "choose-many": "Choose Shells",
  unavailable: "In App",
} as const;

export const GlobalWidgetLibraryCard = ({
  definition,
  onAdd,
  adding,
}: GlobalWidgetLibraryCardProps) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedHosts, setSelectedHosts] = useState<WidgetHost[]>([]);
  const [pickerDirection, setPickerDirection] = useState<"down" | "up">("down");
  const disabled = adding || !definition.canAdd;
  const hostChoices = definition.availableHosts;
  const actionLabel = actionLabelByMode[definition.actionMode];
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const helperCopy = useMemo(() => {
    if (definition.actionMode === "choose-many") {
      return "Select one or more shells. Existing placements stay disabled until removed from the app.";
    }

    if (definition.actionMode === "choose-one") {
      return "Choose one shell target for this widget.";
    }

    return definition.disabledReason;
  }, [definition.actionMode, definition.disabledReason]);

  const toggleHost = (host: WidgetHost) => {
    setSelectedHosts((current) =>
      current.includes(host)
        ? current.filter((value) => value !== host)
        : [...current, host]
    );
  };

  const submitSelection = () => {
    if (definition.actionMode === "choose-one") {
      if (selectedHosts[0]) {
        onAdd(definition.slug, [selectedHosts[0]]);
        setPickerOpen(false);
      }
      return;
    }

    if (definition.actionMode === "choose-many") {
      if (selectedHosts.length > 0) {
        onAdd(definition.slug, selectedHosts);
        setPickerOpen(false);
      }
      return;
    }

    onAdd(definition.slug);
  };

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    const updateDirection = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      const pickerRect = pickerRef.current?.getBoundingClientRect();

      if (!triggerRect) {
        setPickerDirection("down");
        return;
      }

      const estimatedHeight = Math.max(pickerRect?.height ?? 0, 304);
      const spaceBelow = window.innerHeight - triggerRect.bottom - 16;
      const spaceAbove = triggerRect.top - 16;

      if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        setPickerDirection("up");
        return;
      }

      setPickerDirection("down");
    };

    updateDirection();
    window.addEventListener("resize", updateDirection);
    window.addEventListener("scroll", updateDirection, true);

    return () => {
      window.removeEventListener("resize", updateDirection);
      window.removeEventListener("scroll", updateDirection, true);
    };
  }, [pickerOpen, selectedHosts.length]);

  return (
    <LiquidGlassSurface
      variant="widget"
      tone="neutral"
      className={`relative flex flex-col gap-3 rounded-[28px] p-3 shadow-[0px_12px_40px_rgba(0,0,0,0.08)] overflow-visible ${pickerOpen ? "z-30" : "z-0"}`}
    >
      <div className={disabled ? "opacity-65" : undefined}>
        <LibraryWidgetPreview definition={definition} />
      </div>

      <div className="flex items-start justify-between gap-4 px-1 pt-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
            {definition.layer}
          </p>
          <p className="mt-1 text-xs font-medium text-neutral-700">
            Placement: {definition.placementSummary}
          </p>
          {definition.placedHosts.length > 0 ? (
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Current: {definition.placedHosts.map((host) => getWidgetHostLabel(host)).join(", ")}
            </p>
          ) : null}
          {helperCopy ? (
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              {helperCopy}
            </p>
          ) : null}
        </div>

        <div className="relative z-10 shrink-0">
          <Tooltip
            label={
              definition.canAdd
                ? definition.actionLabel
                : definition.disabledReason ?? "Unavailable"
            }
          >
            <button
              ref={triggerRef}
              type="button"
              onClick={() => {
                if (disabled) {
                  return;
                }

                if (definition.actionMode === "automatic") {
                  onAdd(definition.slug);
                  return;
                }

                setSelectedHosts(definition.actionMode === "choose-one" ? [hostChoices[0]].filter(Boolean) as WidgetHost[] : []);
                setPickerOpen((value) => !value);
              }}
              disabled={disabled}
              className={`flex h-11 min-w-11 items-center justify-center gap-2 rounded-2xl px-3 text-neutral-700 transition-colors hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60 ${getLiquidGlassClassName("control", "neutral")}`}
              aria-label={definition.actionLabel}
            >
              {definition.actionMode === "automatic" ? (
                <Plus className="h-5 w-5" />
              ) : (
                <>
                  <span className="text-xs font-semibold">{actionLabel}</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </Tooltip>

          {pickerOpen && (definition.actionMode === "choose-one" || definition.actionMode === "choose-many") ? (
            <div
              ref={pickerRef}
              className={`absolute right-0 z-40 w-64 ${
                pickerDirection === "up"
                  ? "bottom-[calc(100%+10px)]"
                  : "top-[calc(100%+10px)]"
              }`}
            >
              <LiquidGlassSurface
                variant="widget"
                tone="neutral"
                className="rounded-[24px] overflow-visible p-3 shadow-[0px_18px_50px_rgba(0,0,0,0.18)]"
              >
                <LiquidGlassSurface
                  variant="control"
                  tone="neutral"
                  refractive
                  transparency={0.05}
                  shineIntensity={1.15}
                  className="rounded-[20px] p-3 shadow-[0px_10px_24px_rgba(0,0,0,0.12)]"
                  materialStyle={{
                    backdropFilter:
                      "url(#lg-refract-strong) blur(18px) saturate(185%)",
                    WebkitBackdropFilter:
                      "url(#lg-refract-strong) blur(18px) saturate(185%)",
                    backgroundColor: "rgba(255,255,255,0.18)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="inline-flex rounded-full bg-neutral-950/88 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0px_4px_12px_rgba(0,0,0,0.22)]">
                      {definition.actionMode === "choose-many" ? "Select Shells" : "Select Shell"}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] font-semibold leading-5 text-neutral-900 [text-shadow:0_1px_0_rgba(255,255,255,0.28)]">
                    {definition.actionMode === "choose-many"
                      ? "Choose every shell where this widget should stay active."
                      : "Choose the one shell where this widget should live."}
                  </p>
                </LiquidGlassSurface>
                <div className="mt-3 flex flex-col gap-2">
                  {hostChoices.map((host) => {
                    const active = selectedHosts.includes(host);
                    return (
                      <button
                        key={host}
                        type="button"
                        onClick={() => {
                          if (definition.actionMode === "choose-one") {
                            setSelectedHosts([host]);
                          } else {
                            toggleHost(host);
                          }
                        }}
                        className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-black/10 bg-white text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <span>{getWidgetHostLabel(host)}</span>
                        {active ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerOpen(false)}
                    className="rounded-2xl px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitSelection}
                    disabled={selectedHosts.length === 0}
                    className="rounded-2xl bg-[#111111] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add to App
                  </button>
                </div>
              </LiquidGlassSurface>
            </div>
          ) : null}
        </div>
      </div>
    </LiquidGlassSurface>
  );
};
