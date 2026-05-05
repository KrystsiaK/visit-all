"use client";

import { Settings2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  LiquidGlassSurface,
  TintedGlassSurface,
  getLiquidGlassClassName,
  type LiquidGlassTone,
} from "@synarava/liquid-glass";

import { cn } from "../lib/cn";
import { useOptionalShellRuntime } from "../shells/ShellRuntime";
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
    className: "",
    swatchClassName: "bg-white",
  },
  {
    value: "mist",
    label: "Mist",
    className: "",
    swatchClassName: "bg-[#d9eef9]",
  },
  {
    value: "cream",
    label: "Cream",
    className: "",
    swatchClassName: "bg-[#ffe9b8]",
  },
  {
    value: "rose",
    label: "Rose",
    className: "",
    swatchClassName: "bg-[#ffd4d4]",
  },
];

function getChromeTone(backgroundStyle: string | undefined): LiquidGlassTone {
  switch (backgroundStyle) {
    case "mist":
      return "mist";
    case "cream":
      return "cream";
    case "rose":
      return "rose";
    default:
      return "neutral";
  }
}

function getLibraryPreviewTone(backgroundStyle: string | undefined): LiquidGlassTone {
  if (!backgroundStyle || backgroundStyle === "default") {
    return "mist";
  }

  return getChromeTone(backgroundStyle);
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
  const shellRuntime = useOptionalShellRuntime();
  const isLibraryPreview = shellRuntime?.shellId === "widget-library-preview";
  const usesTintedSurface = backgroundStyle !== "default";

  const topPadding = showUtilityBar ? (draggable ? "pt-5" : "pt-3.5") : undefined;
  const widgetContent = (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        expanded ? "max-h-none" : "max-h-[min(560px,68vh)]",
        contentPaddingClassName
      )}
    >
      {hasSettings && settingsOpen ? (
        <div className="overflow-hidden">
          <div className={cn("mb-4 rounded-2xl p-4", getLiquidGlassClassName("inset", "neutral"))}>
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
        </div>
      ) : null}

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
  );

  return (
    <div className={cn("relative w-full", topPadding)}>
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
                "pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-neutral-600 transition-all hover:text-neutral-900",
                getLiquidGlassClassName("control", "neutral"),
                !settingsOpen && "opacity-70 group-hover:opacity-100"
              )}
              aria-label="Edit widget settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      {isLibraryPreview ? (
        <TintedGlassSurface
          data-testid={dataTestId}
          tone={getLibraryPreviewTone(backgroundStyle)}
          transparency={0.6}
          tintStrength={0.68}
          blurPx={3}
          shineIntensity={1}
          className={cn(
            "group relative rounded-2xl",
            expanded ? "overflow-visible" : "max-h-[min(560px,68vh)] overflow-hidden",
            className
          )}
        >
          {widgetContent}
        </TintedGlassSurface>
      ) : usesTintedSurface ? (
        <TintedGlassSurface
          data-testid={dataTestId}
          tone={getChromeTone(backgroundStyle)}
          transparency={0.28}
          tintStrength={0.56}
          blurPx={6}
          shineIntensity={0.9}
          effect="amplified"
          className={cn(
            "group relative rounded-2xl",
            expanded ? "overflow-visible" : "max-h-[min(560px,68vh)] overflow-hidden",
            className
          )}
        >
          {widgetContent}
        </TintedGlassSurface>
      ) : (
        <LiquidGlassSurface
          data-testid={dataTestId}
          variant="widget"
          tone={getChromeTone(backgroundStyle)}
          className={cn(
            "group relative rounded-2xl",
            expanded ? "overflow-visible" : "max-h-[min(560px,68vh)] overflow-hidden",
            className
          )}
        >
          {widgetContent}
        </LiquidGlassSurface>
      )}
    </div>
  );
};
