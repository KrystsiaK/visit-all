import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EntityNearbyPinsWidgetCard } from "@/components/widgets/EntityNearbyPinsWidgetCard";
import { ActiveFeatureProvider } from "@/components/widgets/ActiveFeatureContext";
import type { WidgetInstanceRecord } from "@/lib/widgets";

const widget: WidgetInstanceRecord = {
  id: "widget-entity-nearby-pins",
  definitionId: "definition-entity-nearby-pins",
  slug: "entity_nearby_pins",
  name: "Nearby Pins",
  layer: "entity",
  entityType: "pin",
  entityId: "entity-1",
  componentKey: "entity_nearby_pins",
  position: 50,
  config: {},
  state: {},
  status: "placed",
};

const entity = {
  id: "entity-1",
  type: "pin",
  title: "Palacio do Marquez",
  subtitle: null,
  description: null,
  imageUrl: null,
  collection: null,
  geometryKind: "point",
  metadata: {},
} as const;

describe("EntityNearbyPinsWidgetCard", () => {
  it("renders an empty state when there are no nearby pins", () => {
    render(
      <ActiveFeatureProvider>
        <EntityNearbyPinsWidgetCard
          widget={widget}
          entity={entity}
          nearbyPins={[]}
          onRemove={vi.fn()}
        />
      </ActiveFeatureProvider>
    );

    expect(screen.getByText(/No nearby related pins yet/i)).toBeInTheDocument();
  });

  it("renders nearby pin cards with rating and distance badges", () => {
    render(
      <ActiveFeatureProvider>
        <EntityNearbyPinsWidgetCard
          widget={widget}
          entity={entity}
          nearbyPins={[
            {
              id: "nearby-1",
              containerId: "container-nearby-1",
              title: "Factory Courtyard",
              collectionId: "collection-1",
              collectionName: "Industrial Heritage",
              collectionColor: "#ff0000",
              imageUrl: null,
              rating: 5,
              distanceMeters: 420,
              coordinates: { lng: -9.16, lat: 38.7 },
            },
            {
              id: "nearby-2",
              containerId: "container-nearby-2",
              title: "Bell Gate",
              collectionId: "collection-1",
              collectionName: "Industrial Heritage",
              collectionColor: "#ffff00",
              imageUrl: null,
              rating: null,
              distanceMeters: 1250,
              coordinates: { lng: -9.17, lat: 38.71 },
            },
          ]}
        />
      </ActiveFeatureProvider>
    );

    expect(screen.getByText("Factory Courtyard")).toBeInTheDocument();
    expect(screen.getByText("Bell Gate")).toBeInTheDocument();
    expect(screen.getByText("420 m")).toBeInTheDocument();
    expect(screen.getByText("1.3 km")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();
    expect(screen.getByText("Unrated")).toBeInTheDocument();
  });

  it("opens a nearby pin from the action card", async () => {
    const user = userEvent.setup();
    const handleOpenNearbyPin = vi.fn();

    render(
      <ActiveFeatureProvider>
        <EntityNearbyPinsWidgetCard
          widget={widget}
          entity={entity}
          nearbyPins={[
            {
              id: "nearby-1",
              containerId: "container-nearby-1",
              title: "Factory Courtyard",
              collectionId: "collection-1",
              collectionName: "Industrial Heritage",
              collectionColor: "#ff0000",
              imageUrl: null,
              rating: 5,
              distanceMeters: 420,
              coordinates: { lng: -9.16, lat: 38.7 },
            },
          ]}
          onOpenNearbyPin={handleOpenNearbyPin}
        />
      </ActiveFeatureProvider>
    );

    await user.click(screen.getByRole("button", { name: /Factory Courtyard/i }));

    expect(handleOpenNearbyPin).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "nearby-1",
        title: "Factory Courtyard",
      })
    );
  });
});
