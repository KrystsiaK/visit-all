"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EntityNearbyPinsWidgetCard } from "@/components/widgets/EntityNearbyPinsWidgetCard";
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

const meta = {
  title: "Widgets/EntityNearbyPinsWidgetCard",
  component: EntityNearbyPinsWidgetCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Computed discovery widget for pins. It ranks nearby active pins by rating first and distance second, then surfaces the best matches as related places.",
      },
    },
  },
  args: {
    widget,
    entity,
    nearbyPins: [],
  },
} satisfies Meta<typeof EntityNearbyPinsWidgetCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithNearbyPins: Story = {
  args: {
    nearbyPins: [
      {
        id: "nearby-1",
        containerId: "container-nearby-1",
        title: "Factory Courtyard",
        collectionId: "collection-1",
        collectionName: "Industrial Heritage",
        collectionColor: "#ff0000",
        imageUrl:
          "https://images.unsplash.com/photo-1520637836862-4d197d17c38a?auto=format&fit=crop&w=600&q=80",
        rating: 5,
        distanceMeters: 380,
        coordinates: { lng: -9.1592, lat: 38.7081 },
      },
      {
        id: "nearby-2",
        containerId: "container-nearby-2",
        title: "Bell Gate",
        collectionId: "collection-1",
        collectionName: "Industrial Heritage",
        collectionColor: "#ffff00",
        imageUrl: null,
        rating: 4,
        distanceMeters: 760,
        coordinates: { lng: -9.1609, lat: 38.7091 },
      },
      {
        id: "nearby-3",
        containerId: "container-nearby-3",
        title: "Garden Axis",
        collectionId: "collection-2",
        collectionName: "Morning Walk",
        collectionColor: "#2f62ff",
        imageUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
        rating: null,
        distanceMeters: 1200,
        coordinates: { lng: -9.1628, lat: 38.7104 },
      },
    ],
  },
};
