import { MapPin, Star } from "lucide-react";

import type { EntityNearbyPinRecord } from "@/app/actions";
import { useActiveFeature } from "@/components/widgets/ActiveFeatureContext";
import { BaseWidget } from "@synarava/shell-kit";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";

interface EntityNearbyPinsWidgetCardProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  nearbyPins: EntityNearbyPinRecord[];
  canRemove?: boolean;
  removing?: boolean;
  onOpenNearbyPin?: (nearbyPin: EntityNearbyPinRecord) => void;
  onBackgroundStyleChange?: (widgetId: string, backgroundStyle: string) => void;
  onRemove?: () => void;
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

export const EntityNearbyPinsWidgetCard = ({
  widget,
  entity,
  nearbyPins,
  canRemove = false,
  removing = false,
  onOpenNearbyPin,
  onBackgroundStyleChange,
  onRemove,
}: EntityNearbyPinsWidgetCardProps) => {
  const { triggerFlyTo } = useActiveFeature();

  return (
    <BaseWidget
    dataTestId="entity-nearby-pins-widget"
    eyebrow="Nearby Pins"
    title={widget.name}
    subtitle={`Related places near this ${entity.type}, with preference for already rated pins.`}
    backgroundStyle={
      typeof widget.config.chromeBackgroundStyle === "string"
        ? widget.config.chromeBackgroundStyle
        : "default"
    }
    onBackgroundStyleChange={
      onBackgroundStyleChange
        ? (backgroundStyle) => onBackgroundStyleChange(widget.id, backgroundStyle)
        : undefined
    }
    settingsContent={
      canRemove && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#c61f1f]/15 bg-[#fff6f6] px-4 text-sm font-medium text-[#a11a1a] transition-colors hover:bg-[#ffefef] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {removing ? "Removing..." : "Remove Widget"}
        </button>
      ) : null
    }
    accent={
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2f62ff] text-white">
        <MapPin className="h-4 w-4" />
      </div>
    }
  >
    {nearbyPins.length === 0 ? (
      <div className="mt-1 rounded-xl border border-dashed border-black/10 bg-white/35 px-5 py-6">
        <p className="text-sm leading-7 text-neutral-500">
          No nearby related pins yet. This widget will automatically surface close places once the map around this pin fills in.
        </p>
      </div>
    ) : (
      <div className="mt-1 space-y-3">
        {nearbyPins.map((nearbyPin) => (
          <article
            key={nearbyPin.id}
            className="overflow-hidden rounded-[24px] border border-black/10 bg-white/66 shadow-[0px_10px_24px_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="flex h-2">
              <div
                className="flex-1"
                style={{ backgroundColor: nearbyPin.collectionColor || "#2f62ff" }}
              />
              <div className="flex-1 bg-[#ffff00]" />
              <div className="flex-1 bg-[#0000ff]" />
            </div>

            <button
              type="button"
              onClick={() => {
                triggerFlyTo(nearbyPin.coordinates.lng, nearbyPin.coordinates.lat, 15);
                onOpenNearbyPin?.(nearbyPin);
              }}
              className="flex w-full gap-4 p-4 text-left"
            >
              <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[20px] border border-black/8 bg-[#eef4ff]">
                {nearbyPin.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={nearbyPin.imageUrl}
                    alt={nearbyPin.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#2f62ff]">
                    <MapPin className="h-7 w-7" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black tracking-tight text-neutral-950">
                      {nearbyPin.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      {nearbyPin.collectionName || "Related pin"}
                    </p>
                  </div>
                  <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                    {formatDistance(nearbyPin.distanceMeters)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-[#525252]">
                    <MapPin className="h-3.5 w-3.5" />
                    PIN
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-[#525252]">
                    <Star className="h-3.5 w-3.5 text-[#111111]" />
                    {nearbyPin.rating ? `${nearbyPin.rating}/5` : "Unrated"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-[#2f62ff] px-3 py-1 text-xs font-medium text-white">
                    Open
                  </span>
                </div>
              </div>
            </button>
          </article>
        ))}
      </div>
    )}
  </BaseWidget>
  );
};
