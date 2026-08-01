import { WIDGET_GLASS } from "@/modules/shell/constants";
import { useMemo } from "react";
import type { PointerEvent } from "react";
import { Footprints, Layers3, Loader2, MapPin, MoveRight, Pentagon, Route } from "lucide-react";
import type { ButtonGroupWidgetButtonBinding } from "@/lib/widgets";
import { isButtonGroupWidgetConfig } from "@/lib/widgets";
import { BaseWidget } from "@synarava/shell-kit";
import { usePortConsumer, usePortPublisher } from "@synarava/wiring-engine";

interface ShellModeSwitchWidgetProps {
  config?: Record<string, unknown>;
  draggable?: boolean;
  onDragHandlePointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
}

const resolveButtonGroupIcon = (button: ButtonGroupWidgetButtonBinding) => {
  switch (button.icon) {
    case "pin":
      return MapPin;
    case "route":
      return Route;
    case "polygon":
      return Pentagon;
    default:
      return Layers3;
  }
};

const getButtonGroupActiveClasses = (value: string) => {
  if (value === "trace") {
    return "bg-[#ff0000] text-white";
  }

  if (value === "area") {
    return "bg-[#111111] text-white";
  }

  return "bg-[#0000ff] text-white";
};

const normalizeInteractionMode = (value: string) => {
  if (value === "editTrace") return "trace";
  if (value === "editArea") return "area";
  if (value === "editPin") return "pin";
  return value;
};

export const ShellModeSwitchWidget = ({
  config,
  draggable = false,
  onDragHandlePointerDown,
}: ShellModeSwitchWidgetProps) => {
  const fallbackConfig = useMemo(
    () => ({
      kind: "button_group" as const,
      valueChannel: "interactionMode",
      buttons: [
        { id: "pins", label: "PINS", value: "pin", icon: "pin" as const },
        { id: "paths", label: "PATHS", value: "trace", icon: "route" as const },
        { id: "zones", label: "ZONES", value: "area", icon: "polygon" as const, disabledChannel: "areasDisabled" },
      ],
    }),
    []
  );
  const resolvedConfig = useMemo(
    () => (isButtonGroupWidgetConfig(config) ? config : fallbackConfig),
    [config, fallbackConfig]
  );
  const runtimeValue = usePortConsumer("shell_mode_switch", "mode_in", "pin");
  const interactionLocked = usePortConsumer("shell_mode_switch", "locked_in", false);
  const routeMode = usePortConsumer("shell_mode_switch", "route_mode_in", "direct");
  const routingPending = usePortConsumer("shell_mode_switch", "routing_pending_in", false);
  const routingError = usePortConsumer<string | null>("shell_mode_switch", "routing_error_in", null);
  const publishModeRequest = usePortPublisher("shell_mode_switch", "mode_out");
  const publishRouteModeRequest = usePortPublisher("shell_mode_switch", "route_mode_out");

  const handleSelect = (value: string) => {
    publishModeRequest(value);
  };

  return (
    <BaseWidget {...WIDGET_GLASS}
      title=""
      identityVisibility="settings-only"
      className="pointer-events-auto isolate overflow-hidden"
      contentPaddingClassName="p-1.5"
      draggable={draggable}
      onDragHandlePointerDown={onDragHandlePointerDown}
    >
      <div className="grid grid-cols-3 gap-1">
        {resolvedConfig.buttons.map((button) => {
          const Icon = resolveButtonGroupIcon(button);
          const isDisabled = interactionLocked;
          const isActive = normalizeInteractionMode(runtimeValue) === button.value;

          return (
            <button
              key={button.id}
              type="button"
              disabled={isDisabled}
              onClick={() => handleSelect(button.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                isDisabled
                  ? "cursor-not-allowed text-neutral-300 opacity-60"
                  : isActive
                    ? getButtonGroupActiveClasses(button.value)
                    : "text-neutral-500 hover:bg-white/30 hover:text-neutral-800"
              }`}
              aria-pressed={isActive}
            >
              <Icon className="h-4 w-4" /> {button.label}
            </button>
          );
        })}
      </div>
      {normalizeInteractionMode(runtimeValue) === "trace" ? (
        <div className="mt-1.5 border-t border-black/8 px-1 pt-1.5">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/[0.04] p-1">
            {[
              { value: "direct", label: "Straight", icon: MoveRight },
              { value: "pedestrian", label: "Streets", icon: Footprints },
            ].map((option) => {
              const Icon = option.icon;
              const active = routeMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={interactionLocked || routingPending}
                  onClick={() => publishRouteModeRequest(option.value)}
                  aria-pressed={active}
                  className={`flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-500 hover:bg-white/50 hover:text-neutral-800"
                  } disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  {routingPending && active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  {option.label}
                </button>
              );
            })}
          </div>
          {routingError ? (
            <p className="px-2 pb-1 pt-2 text-[11px] leading-4 text-[#b7102a]">
              {routingError}
            </p>
          ) : null}
        </div>
      ) : null}
    </BaseWidget>
  );
};
