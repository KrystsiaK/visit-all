/** Shared glass settings applied to every BaseShell in the app. */
export const SHELL_GLASS = {
  glassEffect: "amplified" as const,
  glassTransparency: 0.98,
  glassShineIntensity: 0.42,
  glassRefractive: true,
  glassDeformationScale: 70,
} satisfies Record<string, unknown>;

/** Nearly opaque matte material used only by the full-screen widget builder. */
export const WIDGET_BUILDER_SHELL_GLASS = {
  glassVariant: "frosted-glass" as const,
  glassEffect: "default" as const,
  glassTransparency: 0,
  glassShineIntensity: 0.2,
  glassRefractive: false,
} satisfies Record<string, unknown>;

/** Shared matte material applied to every BaseWidget owned by the app. */
export const WIDGET_GLASS = {
  glassVariant: "frosted-glass" as const,
  glassTransparency: 0.3,
  glassShineIntensity: 0.28,
  glassEffect: "default" as const,
} satisfies Record<string, unknown>;

import type { CSSProperties } from "react";

export const SHELL_PANEL_WIDTH = 420;

export const SHELL_PANEL_STYLE = {
  "--shell-panel-width": `${SHELL_PANEL_WIDTH}px`,
} as CSSProperties;

export const SHELL_PANEL_CONTENT_LAYOUT = {
  contentContainerClassName: "flex h-full flex-col overflow-visible",
  bodyClassName: "flex h-full min-h-0 flex-col overflow-hidden",
  scrollBodyClassName: "min-h-0 flex-1 overflow-y-auto overflow-x-visible no-scrollbar [will-change:scroll-position]",
  scrollContentClassName: "flex min-h-full w-full flex-col gap-6 px-3 pt-3 pb-6",
  childrenClassName: "flex w-full flex-col gap-3 pointer-events-auto",
} as const;
