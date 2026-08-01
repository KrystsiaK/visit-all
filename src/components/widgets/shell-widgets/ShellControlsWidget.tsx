import { WIDGET_GLASS } from "@/modules/shell/constants";
import { Layers3, Mountain, Waves } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import { ToggleSwitch } from "@synarava/ui-kit";
import { useMapControls } from "@/contexts/map-controls-context";
import { MAP_STYLE_GROUPS, type MapStyleId } from "@/modules/map/config";

export const ShellControlsWidget = () => {
  const { mapStyleId, setMapStyleId, terrain3D, setTerrain3D, curveMode, setCurveMode, disabled } = useMapControls();

  return (
    <BaseWidget {...WIDGET_GLASS}
      className="pointer-events-auto"
      bodyClassName="space-y-3"
      title="Map Controls"
      identityVisibility="settings-only"
    >
      <label className={`block ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}>
        <span className="mb-2 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200/60">
            <Layers3 className="h-4 w-4 text-neutral-700" />
          </span>
          <span className="text-sm font-medium uppercase text-neutral-900">Map Style</span>
        </span>
        <select
          value={mapStyleId}
          disabled={disabled}
          onChange={(e) => setMapStyleId(e.target.value as MapStyleId)}
          className="h-10 w-full appearance-none rounded-md border border-black/12 bg-white/70 px-3 text-sm font-semibold text-neutral-900 outline-none transition-colors focus:border-[#0000ff]/50 disabled:cursor-not-allowed"
          aria-label="Map style"
        >
          {MAP_STYLE_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.styles.map((style) => (
                <option key={style.id} value={style.id}>{style.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {[
        { label: "3D Terrain", Icon: Mountain, checked: terrain3D, onChange: () => setTerrain3D(!terrain3D) },
        { label: "Smooth Curves", Icon: Waves, checked: curveMode, onChange: () => setCurveMode(!curveMode) },
      ].map((item) => (
        <div
          key={item.label}
          className={`group flex items-center justify-between ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
          onClick={disabled ? undefined : item.onChange}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${disabled ? "bg-neutral-200/40" : "bg-neutral-200/60 group-hover:bg-neutral-300/60"}`}>
              <item.Icon className="h-4 w-4 text-neutral-700" />
            </div>
            <span className="text-sm font-medium uppercase text-neutral-900">{item.label}</span>
          </div>
          <ToggleSwitch checked={item.checked} onChange={item.onChange} disabled={disabled} />
        </div>
      ))}
    </BaseWidget>
  );
};
