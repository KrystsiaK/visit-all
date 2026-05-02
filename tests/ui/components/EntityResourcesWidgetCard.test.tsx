import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

describe("EntityResourcesWidgetCard", () => {
  it("renders the empty state and add action", () => {
    render(
      <EntityResourcesWidgetCard
        widget={widget}
        entity={entity}
        resources={[]}
        onAddResource={vi.fn()}
        onRemoveResource={vi.fn()}
        onCommitResource={vi.fn()}
      />
    );

    expect(screen.getByText("No resources yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Link" })).toBeInTheDocument();
  });

  it("commits a normalized https URL on blur", async () => {
    const user = userEvent.setup();
    const handleCommitResource = vi.fn().mockResolvedValue(undefined);

    render(
      <EntityResourcesWidgetCard
        widget={widget}
        entity={entity}
        resources={[
          {
            id: "resource-1",
            label: null,
            url: "",
            position: 0,
            preview: null,
          },
        ]}
        onAddResource={vi.fn()}
        onRemoveResource={vi.fn()}
        onCommitResource={handleCommitResource}
      />
    );

    const urlInput = screen.getByLabelText("URL");
    await user.type(urlInput, "example.com/guide");
    fireEvent.blur(urlInput);

    await waitFor(() =>
      expect(handleCommitResource).toHaveBeenCalledWith("resource-1", {
        label: null,
        url: "https://example.com/guide",
      })
    );
  });

  it("shows validation and does not commit an unsupported URL scheme", async () => {
    const user = userEvent.setup();
    const handleCommitResource = vi.fn().mockResolvedValue(undefined);

    render(
      <EntityResourcesWidgetCard
        widget={widget}
        entity={entity}
        resources={[
          {
            id: "resource-1",
            label: null,
            url: "",
            position: 0,
            preview: null,
          },
        ]}
        onAddResource={vi.fn()}
        onRemoveResource={vi.fn()}
        onCommitResource={handleCommitResource}
      />
    );

    const urlInput = screen.getByLabelText("URL");
    await user.type(urlInput, "ftp://example.com");
    fireEvent.blur(urlInput);

    expect(await screen.findByText("Use a valid http or https URL.")).toBeInTheDocument();
    expect(handleCommitResource).not.toHaveBeenCalled();
  });

  it("renders preview image when metadata contains one", () => {
    render(
      <EntityResourcesWidgetCard
        widget={widget}
        entity={entity}
        resources={[
          {
            id: "resource-1",
            label: "Wikipedia",
            url: "https://pt.wikipedia.org/wiki/Pal%C3%A1cio_do_Marqu%C3%AAs_de_Pombal",
            position: 0,
            preview: {
              resolvedUrl: "https://pt.wikipedia.org/wiki/Pal%C3%A1cio_do_Marqu%C3%AAs_de_Pombal",
              hostname: "pt.wikipedia.org",
              siteName: "Wikipedia",
              title: "Palácio do Marquês de Pombal – Wikipédia, a enciclopédia livre",
              description: "Article preview",
              imageUrl: "https://upload.wikimedia.org/example-preview.jpg",
              faviconUrl: "https://pt.wikipedia.org/favicon.ico",
              status: "ready",
              errorMessage: null,
              fetchedAt: "2026-04-09T12:00:00.000Z",
            },
          },
        ]}
        onAddResource={vi.fn()}
        onRemoveResource={vi.fn()}
        onCommitResource={vi.fn()}
      />
    );

    expect(
      screen.getByRole("img", {
        name: "Palácio do Marquês de Pombal – Wikipédia, a enciclopédia livre preview",
      })
    ).toBeInTheDocument();
  });
});
