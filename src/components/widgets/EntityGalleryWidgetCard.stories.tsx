"use client";

import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { EntityMediaItemRecord } from "@/app/actions";
import { EntityGalleryWidgetCard } from "@/components/widgets/EntityGalleryWidgetCard";
import type { WidgetInstanceRecord } from "@/lib/widgets";

const widget: WidgetInstanceRecord = {
  id: "widget-entity-gallery",
  definitionId: "definition-entity-gallery",
  slug: "entity_gallery",
  name: "Gallery",
  layer: "entity",
  entityType: "pin",
  entityId: "entity-1",
  componentKey: "entity_gallery",
  position: 40,
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

function GalleryStory({
  initialItems,
  disabled = false,
}: {
  initialItems: EntityMediaItemRecord[];
  disabled?: boolean;
}): ReactElement {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="w-[620px]">
      <EntityGalleryWidgetCard
        widget={widget}
        entity={entity}
        mediaItems={items}
        saving={false}
        disabled={disabled}
        onUpload={async (file) => {
          const objectUrl = URL.createObjectURL(file);
          setItems((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              storageKey: `storybook/${file.name}`,
              publicUrl: objectUrl,
              caption: file.name.replace(/\.[^.]+$/, ""),
              position: current.length,
            },
          ]);
        }}
        onDeleteMediaItem={async (mediaItemId) => {
          setItems((current) => current.filter((item) => item.id !== mediaItemId));
        }}
      />
    </div>
  );
}

const storyMedia: EntityMediaItemRecord[] = [
  {
    id: "media-1",
    storageKey: "preview/1",
    publicUrl:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
    caption: "Palace entrance",
    position: 0,
  },
  {
    id: "media-2",
    storageKey: "preview/2",
    publicUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    caption: "Garden axis",
    position: 1,
  },
  {
    id: "media-3",
    storageKey: "preview/3",
    publicUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    caption: "Facade detail",
    position: 2,
  },
  {
    id: "media-4",
    storageKey: "preview/4",
    publicUrl:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    caption: "Interior room",
    position: 3,
  },
];

const meta = {
  title: "Widgets/EntityGalleryWidgetCard",
  component: GalleryStory,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Entity gallery enrichment widget. The widget renders media in multiple layouts, opens a full-screen lightbox, and delegates persistence to the canonical media layer through upload/delete handlers.",
      },
    },
  },
  args: {
    initialItems: [],
    disabled: false,
  },
} satisfies Meta<typeof GalleryStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithGallery: Story = {
  args: {
    initialItems: storyMedia,
  },
};

export const Disabled: Story = {
  args: {
    initialItems: storyMedia,
    disabled: true,
  },
};
