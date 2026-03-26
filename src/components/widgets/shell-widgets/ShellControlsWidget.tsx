import { Globe2, Mountain, Waves } from "lucide-react";
import { WidgetFrame } from "@/components/widgets/WidgetFrame";

interface ShellControlsWidgetProps {
  isSatellite: boolean;
  setIsSatellite: (value: boolean) => void;
  terrain3D: boolean;
  setTerrain3D: (value: boolean) => void;
  curveMode: boolean;
  setCurveMode: (value: boolean) => void;
  disabled?: boolean;
}

export const ShellControlsWidget = ({
  isSatellite,
  setIsSatellite,
  terrain3D,
  setTerrain3D,
  curveMode,
  setCurveMode,
  disabled = false,
}: ShellControlsWidgetProps) => (
  <WidgetFrame
    className="pointer-events-auto"
    bodyClassName="space-y-3"
    title="Map Controls"
    identityVisibility="settings-only"
  >
    {[
      { label: "Sat View", icon: Globe2, value: isSatellite, onToggle: () => setIsSatellite(!isSatellite) },
      { label: "3D Terrain", icon: Mountain, value: terrain3D, onToggle: () => setTerrain3D(!terrain3D) },
      { label: "Smooth Curves", icon: Waves, value: curveMode, onToggle: () => setCurveMode(!curveMode) },
    ].map((item) => {
      const Icon = item.icon;
      return (
        <div
          key={item.label}
          className={`group flex items-center justify-between ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
          onClick={disabled ? undefined : item.onToggle}
          aria-disabled={disabled}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${disabled ? "bg-neutral-200/40" : "bg-neutral-200/60 group-hover:bg-neutral-300/60"}`}>
              <Icon className="h-4 w-4 text-neutral-700" />
            </div>
            <span className="text-sm font-medium uppercase text-neutral-900">{item.label}</span>
          </div>
          <button
            type="button"
            disabled={disabled}
            className={`relative h-7 w-12 rounded-full transition-all duration-200 ${item.value ? "bg-[#0000ff]" : "bg-neutral-300"}`}
          >
            <div className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${item.value ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      );
    })}
  </WidgetFrame>
);
