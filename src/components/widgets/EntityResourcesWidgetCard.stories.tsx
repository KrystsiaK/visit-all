"use client";

import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { type EntityResourceLinkRecord } from "@/app/actions";
import { EntityResourcesWidgetCard } from "@/components/widgets/EntityResourcesWidgetCard";
import type { WidgetInstanceRecord } from "@/lib/widgets";

const widget: WidgetInstanceRecord = {
  id: "widget-entity-resources",
  definitionId: "definition-entity-resources",
  slug: "entity_resources",
  name: "Entity Sources",
  layer: "entity",
  entityType: "pin",
  entityId: "entity-1",
  componentKey: "entity_resources",
  position: 20,
  config: {},
  state: {},
  status: "placed",
};

const entity = {
  id: "entity-1",
  type: "pin",
  title: "Casa da Praia",
  subtitle: null,
  description: null,
  imageUrl: null,
  collection: null,
  geometryKind: "point",
  metadata: {},
} as const;

function ResourcesStory({
  initialResources,
}: {
  initialResources: EntityResourceLinkRecord[];
}): ReactElement {
  const [resources, setResources] = useState(initialResources);

  return (
    <div className="w-[520px]">
      <EntityResourcesWidgetCard
        widget={widget}
        entity={entity}
        resources={resources}
        onAddResource={async () => {
          setResources((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              label: "",
              url: "",
              position: current.length * 10,
              preview: null,
            },
          ]);
        }}
        onRemoveResource={async (resourceId) => {
          setResources((current) => current.filter((resource) => resource.id !== resourceId));
        }}
        onCommitResource={async (resourceId, params) => {
          setResources((current) =>
            current.map((resource) =>
              resource.id === resourceId
                ? {
                    ...resource,
                    label: params.label ?? null,
                    url: params.url,
                    preview: {
                      resolvedUrl: params.url,
                      hostname: new URL(params.url).hostname.replace(/^www\./, ""),
                      siteName: new URL(params.url).hostname.replace(/^www\./, ""),
                      title: params.label ?? new URL(params.url).hostname.replace(/^www\./, ""),
                      description: "Preview metadata would be fetched on the server and cached alongside the resource link.",
                      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
                      faviconUrl: `${new URL(params.url).origin}/favicon.ico`,
                      status: "ready",
                      errorMessage: null,
                      fetchedAt: new Date().toISOString(),
                    },
                  }
                : resource
            )
          );
        }}
      />
    </div>
  );
}

const meta = {
  title: "Widgets/EntityResourcesWidgetCard",
  component: ResourcesStory,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Linked sources manager for entity enrichments. The widget owns local drafts and validation, but persistence still happens outside through commit handlers.",
      },
    },
  },
  args: {
    initialResources: [],
  },
} satisfies Meta<typeof ResourcesStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithLinks: Story = {
  args: {
    initialResources: [
      {
        id: "resource-1",
        label: "Official website",
        url: "https://visitall.test/casa-da-praia",
        position: 0,
        preview: {
          resolvedUrl: "https://visitall.test/casa-da-praia",
          hostname: "visitall.test",
          siteName: "Visit All",
          title: "Palacio do Marquez",
          description: "Official municipality guide for the palace grounds, opening context, and visitor notes.",
          imageUrl: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
          faviconUrl: "https://visitall.test/favicon.ico",
          status: "ready",
          errorMessage: null,
          fetchedAt: new Date().toISOString(),
        },
      },
      {
        id: "resource-2",
        label: "Booking page",
        url: "https://booking.example.com/casa-da-praia",
        position: 10,
        preview: {
          resolvedUrl: "https://booking.example.com/casa-da-praia",
          hostname: "booking.example.com",
          siteName: "Booking",
          title: "Reserve tickets",
          description: "Ticketing and reservation flow for the experience.",
          imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
          faviconUrl: "https://booking.example.com/favicon.ico",
          status: "ready",
          errorMessage: null,
          fetchedAt: new Date().toISOString(),
        },
      },
    ],
  },
};
