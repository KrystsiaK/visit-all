import { useMemo } from "react";
import { Layers3, MapPin, Pentagon, Route } from "lucide-react";
import type { ButtonGroupWidgetButtonBinding } from "@/lib/widgets";
import { isButtonGroupWidgetConfig } from "@/lib/widgets";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useShellRuntime, useShellRuntimeActions, useShellRuntimeValue } from "@/components/shells/ShellRuntimeProvider";

interface ShellModeSwitchWidgetProps {
  config?: Record<string, unknown>;
  onValueCommit?: (value: string) => void;
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

export const ShellModeSwitchWidget = ({
  config,
  onValueCommit,
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
  const runtimeValue = useShellRuntimeValue<string>(resolvedConfig.valueChannel, "pin");
  const { state } = useShellRuntime();
  const { setValue } = useShellRuntimeActions();

  const handleSelect = (value: string) => {
    setValue(resolvedConfig.valueChannel, value);
    onValueCommit?.(value);
  };

  return (
    <GlassPanel
      intensity="heavy"
      className="pointer-events-auto isolate overflow-hidden bg-[#f8f6f1]/92 p-1.5 backdrop-blur-xl"
      shadow={false}
    >
      <div className="grid grid-cols-3 gap-1">
        {resolvedConfig.buttons.map((button) => {
          const Icon = resolveButtonGroupIcon(button);
          const isDisabled = button.disabledChannel ? Boolean(state[button.disabledChannel]) : false;
          const isActive = runtimeValue === button.value;

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
    </GlassPanel>
  );
};
