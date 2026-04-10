"use client";

import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { EntityStoryEntryRecord } from "@/app/actions";
import { EntityStoriesWidgetCard } from "@/components/widgets/EntityStoriesWidgetCard";
import type { WidgetInstanceRecord } from "@/lib/widgets";

const widget: WidgetInstanceRecord = {
  id: "widget-entity-stories",
  definitionId: "definition-entity-stories",
  slug: "entity_stories",
  name: "Entity Notes",
  layer: "entity",
  entityType: "pin",
  entityId: "entity-1",
  componentKey: "entity_stories",
  position: 30,
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

function StoriesStory({
  initialEntries,
}: {
  initialEntries: EntityStoryEntryRecord[];
}): ReactElement {
  const [entries, setEntries] = useState(initialEntries);

  return (
    <div className="w-[680px]">
      <EntityStoriesWidgetCard
        widget={widget}
        entity={entity}
        storyEntries={entries}
        saving={false}
        onSaveStoryEntry={async ({ storyEntryId, title, bodyMarkdown }) => {
          if (storyEntryId) {
            setEntries((current) =>
              current.map((entry) =>
                entry.id === storyEntryId ? { ...entry, title: title ?? null, bodyMarkdown } : entry
              )
            );
            return;
          }

          setEntries((current) => [
            {
              id: crypto.randomUUID(),
              title: title ?? null,
              bodyMarkdown,
              position: current.length * 10,
              publishedAt: null,
            },
            ...current,
          ]);
        }}
        onRemoveStoryEntry={async (storyEntryId) => {
          setEntries((current) => current.filter((entry) => entry.id !== storyEntryId));
        }}
      />
    </div>
  );
}

const meta = {
  title: "Widgets/EntityStoriesWidgetCard",
  component: StoriesStory,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Notes manager widget over the canonical entity_story_entries enrichment layer. Users can add, edit, delete, and render markdown notes while the widget remains a pure UI surface over independent persistence.",
      },
    },
  },
  args: {
    initialEntries: [],
  },
} satisfies Meta<typeof StoriesStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithNotes: Story = {
  args: {
    initialEntries: [
      {
        id: "story-1",
        title: "Arrival notes",
        bodyMarkdown:
          "# First impressions\n\nA quiet palace compound with beautiful yellow facades.\n\n- Best before noon\n- Good for photos\n- Bring water",
        position: 0,
        publishedAt: null,
      },
      {
        id: "story-2",
        title: "Research lead",
        bodyMarkdown:
          "The factory gate deserves a second visit.\n\n[Official source](https://example.com)\n\n> Good candidate for a cultural-history thread.",
        position: 10,
        publishedAt: null,
      },
    ],
  },
};
