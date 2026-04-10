"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Settings2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "../lib/cn";
import { TitlePill, CompactTitlePill } from "./TitlePill";

type WidgetChromeBackgroundStyle = "default" | "mist" | "cream" | "rose";

const widgetChromeBackgroundStyles: Array<{
  value: WidgetChromeBackgroundStyle;
  label: string;
  className: string;
  swatchClassName: string;
}> = [
  {
    value: "default",
    label: "White",
    className: "bg-white/70",
    swatchClassName: "bg-white",
  },
  {
    value: "mist",
    label: "Mist",
    className: "bg-[#eef8fd]/88",
    swatchClassName: "bg-[#d9eef9]",
  },
  {
    value: "cream",
    label: "Cream",
    className: "bg-[#fff8ec]/88",
    swatchClassName: "bg-[#ffe9b8]",
  },
  {
    value: "rose",
    label: "Rose",
    className: "bg-[#fff1f1]/88",
    swatchClassName: "bg-[#ffd4d4]",
  },
];

function getChromeBackgroundClassName(backgroundStyle: string | undefined): string {
  return (
    widgetChromeBackgroundStyles.find((style) => style.value === backgroundStyle)?.className ??
    widgetChromeBackgroundStyles[0].className
  );
}

interface BaseWidgetProps {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  className?: string;
  bodyClassName?: string;
  contentPaddingClassName?: string;
  dataTestId?: string;
  children: ReactNode;
  settingsContent?: ReactNode;
  accent?: ReactNode;
  identityVisibility?: "inline" | "settings-only";
  backgroundStyle?: string;
  onBackgroundStyleChange?: (backgroundStyle: WidgetChromeBackgroundStyle) => void;
  sizeMode?: "compact" | "expanded";
  draggable?: boolean;
  onDelete?: () => void;
}

export const BaseWidget = ({
  title,
  eyebrow,
  subtitle,
  className,
  bodyClassName,
  contentPaddingClassName = "px-[17px] pb-[17px] pt-[17px]",
  dataTestId,
  children,
  settingsContent,
  accent,
  identityVisibility = "inline",
  backgroundStyle = "default",
  onBackgroundStyleChange,
  sizeMode = "compact",
  draggable = false,
  onDelete,
}: BaseWidgetProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hasSettings = Boolean(settingsContent || onBackgroundStyleChange);
  const hasIdentity = Boolean(eyebrow || title || subtitle);
  const showInlineIdentity = identityVisibility === "inline" && hasIdentity;
  const compactLabel = eyebrow || title;
  const showCompactIdentity = identityVisibility === "settings-only" && Boolean(compactLabel);
  const showUtilityBar = hasSettings || showInlineIdentity || showCompactIdentity;
  const expanded = sizeMode === "expanded" || settingsOpen;
  const hasDelete = Boolean(onDelete);

  const topPadding = showUtilityBar ? (draggable ? "pt-5" : "pt-3.5") : undefined;

  return (
    <motion.div className={cn("relative w-full", topPadding)} layout="position">
      {showUtilityBar ? (
        <div className="pointer-events-none absolute inset-x-3 top-3.5 z-[5] flex -translate-y-1/2 items-center justify-between gap-2">
          <div className="pointer-events-auto min-w-0 max-w-[40%] flex-1 transition-[max-width] duration-420 ease-[cubic-bezier(0.23,1,0.32,1)] hover:max-w-full">
            {showInlineIdentity ? (
              <TitlePill eyebrow={eyebrow} title={title} subtitle={subtitle} expandedMaxWidth="100%" />
            ) : null}
            {showCompactIdentity ? (
              <CompactTitlePill label={compactLabel!} expandedMaxWidth="100%" />
            ) : null}
          </div>
          {hasSettings ? (
            <button
              type="button"
              onClick={() => setSettingsOpen((value) => !value)}
              className={cn(
                "pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white/82 text-neutral-600 shadow-[0px_6px_18px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all hover:bg-white hover:text-neutral-900",
                !settingsOpen && "opacity-70 group-hover:opacity-100"
              )}
              aria-label="Edit widget settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      <motion.div
        data-testid={dataTestId}
        className={cn(
          "group relative rounded-2xl border border-black/10 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl",
          expanded ? "overflow-visible" : "max-h-[min(560px,68vh)] overflow-hidden",
          getChromeBackgroundClassName(backgroundStyle),
          className
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-col",
            expanded ? "max-h-none" : "max-h-[min(560px,68vh)]",
            contentPaddingClassName
          )}
        >
          <AnimatePresence initial={false}>
            {hasSettings && settingsOpen ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mb-4 rounded-2xl border border-black/8 bg-white/55 p-4">
                  {identityVisibility === "settings-only" && hasIdentity ? (
                    <div className="mb-4">
                      {eyebrow ? (
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                          {eyebrow}
                        </p>
                      ) : null}
                      {title ? (
                        <h3 className="mt-1 text-sm font-semibold leading-5 text-neutral-950">
                          {title}
                        </h3>
                      ) : null}
                      {subtitle ? (
                        <p className="mt-1 text-xs leading-4 text-neutral-500">
                          {subtitle}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {onBackgroundStyleChange ? (
                    <div className="mb-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                        Background
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {widgetChromeBackgroundStyles.map((style) => {
                          const active = style.value === backgroundStyle;
                          return (
                            <button
                              key={style.value}
                              type="button"
                              onClick={() => onBackgroundStyleChange(style.value)}
                              className={cn(
                                "flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-colors",
                                active
                                  ? "border-neutral-900 bg-white/90 text-neutral-950"
                                  : "border-black/8 bg-white/55 text-neutral-700 hover:bg-white/75"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-4 w-4 shrink-0 rounded-full border border-black/10",
                                  style.swatchClassName
                                )}
                              />
                              <span className="text-sm font-medium">{style.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  {settingsContent ? (
                    <div className="mb-4">
                      {settingsContent}
                    </div>
                  ) : null}
                  {hasDelete ? (
                    <div>
                      <button
                        type="button"
                        onClick={onDelete}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(214,0,0,0.25)] bg-[rgba(255,0,0,0.04)] px-3 py-2.5 text-sm font-semibold text-[#a33b3b] transition-colors hover:border-[rgba(214,0,0,0.4)] hover:bg-[rgba(255,0,0,0.08)]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                        Delete Widget
                      </button>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {accent ? <div className="mb-3">{accent}</div> : null}
          <div
            className={cn(
              "min-h-0 flex-1 overflow-x-hidden pr-1 no-scrollbar",
              expanded ? "overflow-visible" : "overflow-y-auto",
              bodyClassName
            )}
          >
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
