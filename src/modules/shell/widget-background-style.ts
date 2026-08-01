import type { WidgetChromeBackgroundStyle } from "@synarava/shell-kit";

const validWidgetBackgroundStyles = new Set<WidgetChromeBackgroundStyle>([
  "default",
  "mist",
  "cream",
  "rose",
]);

export function normalizeWidgetBackgroundStyle(
  value: unknown
): WidgetChromeBackgroundStyle | undefined {
  return typeof value === "string" && validWidgetBackgroundStyles.has(value as WidgetChromeBackgroundStyle)
    ? (value as WidgetChromeBackgroundStyle)
    : undefined;
}
