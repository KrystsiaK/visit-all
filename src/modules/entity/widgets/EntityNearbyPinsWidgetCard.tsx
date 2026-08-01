import { WIDGET_GLASS } from "@/modules/shell/constants";
import { memo } from "react";
import { MapPin, Star } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import { ColorStripe, EmptySection, PillTag, RemoveWidgetButton } from "@synarava/ui-kit";
import { normalizeWidgetBackgroundStyle } from "@/modules/shell/widget-background-style";
import { usePortPublisher } from "@synarava/wiring-engine";
import {
  useCurrentWidget,
  useEntityMeta,
  useEntityData,
  useEntityWriteState,
  useEntityActions,
} from "@/modules/entity/EntityContext";

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

export const EntityNearbyPinsWidgetCard = memo(function EntityNearbyPinsWidgetCard() {
  const widget = useCurrentWidget();
  const { normalizedEntity: entity } = useEntityMeta();
  const { nearbyPins } = useEntityData();
  const { removingWidgetId } = useEntityWriteState();
  const { handleOpenNearbyPin, handleUpdateWidgetBackground, handleRemoveWidget } = useEntityActions();
  const publishFlyTo = usePortPublisher("entity_nearby_pins", "fly_to_out");

  const canRemove = widget ? widget.slug !== "entity_info" : false;
  const removing = removingWidgetId === widget?.id;

  return (
    <BaseWidget {...WIDGET_GLASS}
      dataTestId="entity-nearby-pins-widget"
      eyebrow="Nearby Pins"
      title={widget?.name ?? "Nearby"}
      subtitle={`Related places near this ${entity.type}, with preference for already rated pins.`}
      backgroundStyle={widget ? (normalizeWidgetBackgroundStyle(widget.config.chromeBackgroundStyle) ?? "default") : "default"}
      onBackgroundStyleChange={widget ? (style) => void handleUpdateWidgetBackground(widget.id, style) : undefined}
      settingsContent={canRemove && widget ? <RemoveWidgetButton onRemove={() => void handleRemoveWidget(widget.id)} removing={removing} /> : null}
      accent={
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2f62ff] text-white">
          <MapPin className="h-4 w-4" />
        </div>
      }
    >
      {nearbyPins.length === 0 ? (
        <EmptySection className="mt-1">
          No nearby related pins yet. This widget will automatically surface close places once the map around this pin fills in.
        </EmptySection>
      ) : (
        <div className="mt-1 space-y-3">
          {nearbyPins.map((nearbyPin) => (
            <article
              key={nearbyPin.id}
              className="overflow-hidden rounded-[24px] border border-black/10 bg-white/66 shadow-[0px_10px_24px_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <ColorStripe colors={[nearbyPin.collectionColor || "#2f62ff", "#ffff00", "#0000ff"]} />
              <button
                type="button"
                onClick={() => {
                  publishFlyTo({ lng: nearbyPin.coordinates.lng, lat: nearbyPin.coordinates.lat, zoom: 15 });
                  handleOpenNearbyPin(nearbyPin);
                }}
                className="flex w-full gap-4 p-4 text-left"
              >
                <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[20px] border border-black/8 bg-[#eef4ff]">
                  {nearbyPin.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={nearbyPin.imageUrl} alt={nearbyPin.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#2f62ff]">
                      <MapPin className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black tracking-tight text-neutral-950">{nearbyPin.title}</h3>
                      <p className="mt-1 text-sm text-neutral-500">{nearbyPin.collectionName || "Related pin"}</p>
                    </div>
                    <PillTag>{formatDistance(nearbyPin.distanceMeters)}</PillTag>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <PillTag><MapPin className="h-3.5 w-3.5" /> PIN</PillTag>
                    <PillTag><Star className="h-3.5 w-3.5 text-[#111111]" />{nearbyPin.rating ? `${nearbyPin.rating}/5` : "Unrated"}</PillTag>
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-[#2f62ff] px-3 py-1 text-xs font-medium text-white">Open</span>
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>
      )}
    </BaseWidget>
  );
});
