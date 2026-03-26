"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Settings2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/components/ui/utils";
import { useWidgetChromeContext } from "@/components/widgets/WidgetChromeContext";
import type { WidgetHost, WidgetHostOption } from "@/lib/widget-hosts";

interface WidgetChromeProps {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  className?: string;
  bodyClassName?: string;
  contentPaddingClassName?: string;
  children: ReactNode;
  currentHost?: WidgetHost;
  hostOptions?: WidgetHostOption[];
  hostSelectionDisabled?: boolean;
  onHostChange?: (host: WidgetHost) => void;
  settingsContent?: ReactNode;
  accent?: ReactNode;
  identityVisibility?: "inline" | "settings-only";
}

export const WidgetChrome = ({
  title,
  eyebrow,
  subtitle,
  className,
  bodyClassName,
  contentPaddingClassName = "px-[17px] pb-[17px] pt-[17px]",
  children,
  currentHost,
  hostOptions,
  hostSelectionDisabled,
  onHostChange,
  settingsContent,
  accent,
  identityVisibility = "inline",
}: WidgetChromeProps) => {
  const chromeContext = useWidgetChromeContext();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const resolvedCurrentHost = currentHost ?? chromeContext?.currentHost;
  const resolvedHostOptions = hostOptions ?? chromeContext?.hostOptions;
  const resolvedHostSelectionDisabled =
    hostSelectionDisabled ?? chromeContext?.hostSelectionDisabled ?? false;
  const resolvedOnHostChange = onHostChange ?? chromeContext?.onHostChange;
  const hasSettings = Boolean(
    (resolvedCurrentHost && resolvedHostOptions?.length) || settingsContent
  );
  const hasIdentity = Boolean(eyebrow || title || subtitle);
  const showInlineIdentity = identityVisibility === "inline" && hasIdentity;
  const compactLabel = eyebrow || title;
  const showCompactIdentity = identityVisibility === "settings-only" && Boolean(compactLabel);
  const showUtilityBar = hasSettings || showInlineIdentity || showCompactIdentity;

  return (
    <motion.div className="relative w-full" layout="position">
      {showUtilityBar ? (
        <div className="pointer-events-none absolute inset-x-3 -top-4 z-[3] flex items-start justify-between gap-2">
          <div className="min-w-0 max-w-[calc(50%-2.5rem)] flex-1">
            {showInlineIdentity ? (
              <div className="pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-full border border-black/8 bg-white/80 px-3 py-1.5 shadow-[0px_6px_18px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                {eyebrow ? (
                  <span className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                    {eyebrow}
                  </span>
                ) : null}
                {title ? (
                  <span className="truncate text-xs font-semibold text-neutral-900">
                    {title}
                  </span>
                ) : null}
                {subtitle ? (
                  <span className="truncate text-[11px] text-neutral-500">
                    {subtitle}
                  </span>
                ) : null}
              </div>
            ) : null}
            {showCompactIdentity ? (
              <div className="pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-full border border-black/8 bg-white/82 px-2.5 py-1 shadow-[0px_6px_18px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                <span className="grid h-3.5 w-3.5 shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-[4px] border border-black/10 bg-white/70">
                  <span className="bg-[#ff0000]" />
                  <span className="bg-[#ffff00]" />
                  <span className="bg-[#0000ff]" />
                  <span className="bg-[#111111]" />
                </span>
                <span className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                  {compactLabel}
                </span>
              </div>
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
        className={cn(
          "group relative h-full overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl",
          className
        )}
      >
        <div className={cn("flex h-full flex-col", contentPaddingClassName)}>
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
                  {resolvedCurrentHost && resolvedHostOptions?.length ? (
                    <>
                      <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                        Host Shell
                      </label>
                      <div className="relative mt-3">
                        <select
                          value={resolvedCurrentHost}
                          disabled={resolvedHostSelectionDisabled}
                          onChange={(event) =>
                            resolvedOnHostChange?.(event.target.value as WidgetHost)
                          }
                          className="h-11 w-full appearance-none rounded-2xl border border-black/10 bg-white px-4 pr-12 text-sm font-medium text-neutral-900 outline-none transition-colors disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500"
                        >
                          {resolvedHostOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </>
                  ) : null}
                  {settingsContent ? (
                    <div
                      className={
                        resolvedCurrentHost && resolvedHostOptions?.length ? "mt-4" : undefined
                      }
                    >
                      {settingsContent}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {accent ? <div className="mb-3">{accent}</div> : null}
          <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );
};
