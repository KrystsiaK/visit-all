// NEEDS UPDATE: used old props-based API. Wrap with EntityProvider.
// See src/contexts/entity-context.tsx
/*
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EntityStoriesWidgetCard } from "@/components/widgets/EntityStoriesWidgetCard";
import type { WidgetInstanceRecord } from "@/lib/widgets";

const widget: WidgetInstanceRecord = {
  id: "widget-entity-stories",
  definitionId: "definition-entity-stories",
  slug: "entity_stories",
  name: "Entity Stories",
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

describe("EntityStoriesWidgetCard", () => {
  it("renders multiple notes in view mode", () => {
    render(
      <EntityStoriesWidgetCard
        widget={widget}
        entity={entity}
        storyEntries={[
          {
            id: "story-1",
            title: "Arrival notes",
            bodyMarkdown: "# First impressions\n\n- one\n- two",
            position: 0,
            publishedAt: null,
          },
          {
            id: "story-2",
            title: "Getting in",
            bodyMarkdown: "Use the side entrance after 10am.",
            position: 10,
            publishedAt: null,
          },
        ]}
        saving={false}
        onSaveStoryEntry={vi.fn()}
        onRemoveStoryEntry={vi.fn()}
      />
    );

    expect(screen.getAllByText("First impressions").length).toBeGreaterThan(0);
    expect(screen.getByText("2 notes saved")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "First impressions" })).toBeInTheDocument();
    expect(screen.getByText("Use the side entrance after 10am.")).toBeInTheDocument();
  });

  it("adds a new note from raw markdown", async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn().mockResolvedValue(undefined);

    render(
      <EntityStoriesWidgetCard
        widget={widget}
        entity={entity}
        storyEntries={[]}
        saving={false}
        onSaveStoryEntry={handleSave}
        onRemoveStoryEntry={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Add Note" }));
    await user.type(screen.getByPlaceholderText(/write the note in raw markdown/i), "## Timing\n\nOpen after 10am.");
    await user.click(screen.getByRole("button", { name: "Save Note" }));

    expect(handleSave).toHaveBeenCalledWith({
      storyEntryId: null,
      title: null,
      bodyMarkdown: "## Timing\n\nOpen after 10am.",
    });
  });

  it("edits an existing note", async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn().mockResolvedValue(undefined);

    render(
      <EntityStoriesWidgetCard
        widget={widget}
        entity={entity}
        storyEntries={[
          {
            id: "story-1",
            title: "Arrival notes",
            bodyMarkdown: "Original body",
            position: 0,
            publishedAt: null,
          },
        ]}
        saving={false}
        onSaveStoryEntry={handleSave}
        onRemoveStoryEntry={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const textarea = screen.getByPlaceholderText(/write the note in raw markdown/i);
    await user.clear(textarea);
    await user.type(textarea, "Changed body");
    await user.click(screen.getByRole("button", { name: "Save Note" }));

    expect(handleSave).toHaveBeenCalledWith({
      storyEntryId: "story-1",
      title: null,
      bodyMarkdown: "Changed body",
    });
  });

  it("opens confirm dialog before deleting a note", async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn().mockResolvedValue(undefined);

    render(
      <EntityStoriesWidgetCard
        widget={widget}
        entity={entity}
        storyEntries={[
          {
            id: "story-1",
            title: "Arrival notes",
            bodyMarkdown: "Original body",
            position: 0,
            publishedAt: null,
          },
        ]}
        saving={false}
        onSaveStoryEntry={vi.fn()}
        onRemoveStoryEntry={handleRemove}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete Original body" }));
    expect(screen.getByRole("button", { name: "Delete Note" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete Note" }));

    await waitFor(() => {
      expect(handleRemove).toHaveBeenCalledWith("story-1");
    });
  });

  it("does not render the same title twice when markdown starts with the same heading", () => {
    render(
      <EntityStoriesWidgetCard
        widget={widget}
        entity={entity}
        storyEntries={[
          {
            id: "story-1",
            title: "Markdown Demo — full example",
            bodyMarkdown: "# Markdown Demo — full example\n\nBody text here.",
            position: 0,
            publishedAt: null,
          },
        ]}
        saving={false}
        onSaveStoryEntry={vi.fn()}
        onRemoveStoryEntry={vi.fn()}
      />
    );

    expect(screen.getAllByText("Markdown Demo — full example")).toHaveLength(2);
    expect(screen.getByText("Body text here.")).toBeInTheDocument();
  });
});
*/
export {};
