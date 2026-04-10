export { BaseWidget } from "./widgets/BaseWidget";
export { TitlePill, CompactTitlePill } from "./widgets/TitlePill";
export { WidgetProvider, useWidgetContext, type WidgetContextValue, type WidgetHostOption } from "./widgets/WidgetContext";
export { BaseShell } from "./shells/BaseShell";
export {
  shellEntrancePresets,
  resolveShellEntrance,
  type ShellEntranceName,
  type ShellEntrancePreset,
} from "./lib/shell-entrance-presets";
export {
  ShellRuntimeProvider,
  useShellRuntime,
  useOptionalShellRuntime,
  useShellRuntimeActions,
  useOptionalShellRuntimeActions,
  useShellRuntimeValue,
  type ShellRuntimeState,
  type TypedShellRuntime,
  type ShellRuntimeActions,
} from "./shells/ShellRuntime";
export { ShellSlot } from "./shells/ShellSlot";
export { useShellWidgetReorder, getAutoScrollVelocity, getWidgetHoverScrollVelocity } from "./shells/useShellWidgetReorder";
export {
  moveShellWidget,
  type ShellWidgetLike,
  type ShellDropEdge,
} from "./shells/shell-widget-order";
