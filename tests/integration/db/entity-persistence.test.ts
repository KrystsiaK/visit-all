import { randomUUID } from "node:crypto";

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
  auth: authMock,
}));

import {
  addEntityMediaItem,
  addEntityResourceLink,
  addEntityStoryEntry,
  deleteEntity,
  getEntityMediaItems,
  getNearbyPinsForEntity,
  getEntityResourceLinks,
  getEntityRating,
  getEntityStoryEntries,
  getEntityWidgetPayload,
  getEntityWidgets,
  getPins,
  removeEntityMediaItem,
  removeEntityResourceLink,
  removeEntityStoryEntry,
  saveArea,
  savePin,
  saveTrace,
  updateEntityRating,
  updateEntityStoryEntry,
  updateEntityTitle,
  updateEntityInfo,
  updateEntityResourceLink,
} from "@/app/actions";
import { pool } from "@/lib/db";

type TestContext = {
  userId: string;
  collectionId: string;
};

let context: TestContext;

async function createTestUser() {
  const email = `db-tests+${Date.now()}-${randomUUID()}@visitall.test`;
  const { rows } = await pool.query<{ id: string }>(
    `
      INSERT INTO users (
        email,
        password,
        password_hash,
        password_algorithm,
        display_name,
        avatar_style,
        status,
        email_verified_at,
        updated_at
      )
      VALUES ($1, 'db-test-password', 'db-test-password', 'bcrypt', 'DB Test User', 'mondrian-primary', 'active', NOW(), NOW())
      RETURNING id
    `,
    [email]
  );

  return rows[0].id;
}

async function createPinCollection(userId: string) {
  const { rows } = await pool.query<{ id: string }>(
    `
      INSERT INTO collections (name, color, icon, type, user_id)
      VALUES ($1, '#2563eb', 'P', 'pin', $2)
      RETURNING id
    `,
    [`DB Test Pins ${Date.now()}`, userId]
  );

  return rows[0].id;
}

async function cleanupUserData(userId: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM entity_resource_links WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM entity_story_entries WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM entity_media_items WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM entity_details WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM pins WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM traces WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM areas WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM entity_containers WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM collections WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

describe("DB integration: entity persistence", () => {
  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for DB integration tests.");
    }

    const userId = await createTestUser();
    const collectionId = await createPinCollection(userId);
    context = { userId, collectionId };
  });

  beforeEach(() => {
    authMock.mockReset();
    authMock.mockResolvedValue({
      user: {
        id: context.userId,
      },
    });
  });

  afterEach(async () => {
    await pool.query(`DELETE FROM entity_resource_links WHERE user_id = $1`, [context.userId]);
    await pool.query(`DELETE FROM entity_story_entries WHERE user_id = $1`, [context.userId]);
    await pool.query(`DELETE FROM entity_media_items WHERE user_id = $1`, [context.userId]);
    await pool.query(`DELETE FROM entity_details WHERE user_id = $1`, [context.userId]);
    await pool.query(`DELETE FROM pins WHERE user_id = $1`, [context.userId]);
    await pool.query(`DELETE FROM entity_containers WHERE user_id = $1`, [context.userId]);
  });

  afterAll(async () => {
    if (context) {
      await cleanupUserData(context.userId);
    }
    await pool.end();
  });

  it("seeds canonical entity container and details when saving a pin", async () => {
    const savedPin = await savePin(-9.1406, 38.7223, context.collectionId, "Lisbon");

    const pinResult = await pool.query<{
      id: string;
      container_id: string;
      name: string | null;
      lng: number;
      lat: number;
    }>(
      `
        SELECT id,
               container_id,
               name,
               ST_X(location) AS lng,
               ST_Y(location) AS lat
        FROM pins
        WHERE id = $1::uuid
      `,
      [savedPin.id]
    );

    const containerResult = await pool.query<{
      entity_type: string;
      geometry_kind: string;
      collection_id: string | null;
      source_payload: {
        source: string;
        geometry: { type: string; coordinates: [number, number] };
        coordinates: { lng: number; lat: number };
        initialTitle: string | null;
      };
    }>(
      `
        SELECT entity_type, geometry_kind, collection_id, source_payload
        FROM entity_containers
        WHERE id = $1::uuid
      `,
      [savedPin.container_id]
    );

    const detailsResult = await pool.query<{
      title: string | null;
      description: string;
    }>(
      `
        SELECT title, description
        FROM entity_details
        WHERE entity_container_id = $1::uuid
      `,
      [savedPin.container_id]
    );

    expect(pinResult.rows[0]).toMatchObject({
      id: savedPin.id,
      container_id: savedPin.container_id,
      name: "Lisbon",
      lng: -9.1406,
      lat: 38.7223,
    });
    expect(containerResult.rows[0]).toMatchObject({
      entity_type: "pin",
      geometry_kind: "point",
      collection_id: context.collectionId,
      source_payload: {
        source: "map_click",
        geometry: {
          type: "Point",
          coordinates: [-9.1406, 38.7223],
        },
        coordinates: {
          lng: -9.1406,
          lat: 38.7223,
        },
        initialTitle: "Lisbon",
      },
    });
    expect(detailsResult.rows[0]).toEqual({
      title: "Lisbon",
      description: "",
    });
  });

  it("seeds the full default entity widget stack for a new pin", async () => {
    const savedPin = await savePin(-9.1406, 38.7223, context.collectionId, "Lisbon");

    const widgets = await getEntityWidgets("pin", savedPin.id);
    const widgetSlugs = widgets.map((widget) => widget.slug);

    expect(widgetSlugs).toEqual([
      "entity_info",
      "entity_rating",
      "entity_resources",
      "entity_stories",
      "entity_gallery",
      "entity_nearby_pins",
      "entity_delete",
    ]);
    expect(widgets[0]?.slot).toBe("pinned");
    expect(widgets.slice(1).every((widget) => widget.slot === "main")).toBe(true);
  });

  it("updates canonical details and keeps legacy pin fields synchronized", async () => {
    const savedPin = await savePin(-9.135, 38.71, context.collectionId, "Untitled Marker");

    const updated = await updateEntityInfo(
      "pin",
      savedPin.id,
      "Miradouro de Santa Luzia",
      "Best at sunset.",
      "https://legacy.test/pins/hero.jpg"
    );

    const detailsResult = await pool.query<{
      title: string | null;
      description: string;
    }>(
      `
        SELECT title, description
        FROM entity_details
        WHERE entity_container_id = $1::uuid
      `,
      [savedPin.container_id]
    );

    const legacyPinResult = await pool.query<{
      name: string | null;
      note: string | null;
      image_url: string | null;
    }>(
      `
        SELECT name, note, image_url
        FROM pins
        WHERE id = $1::uuid
      `,
      [savedPin.id]
    );

    const pins = await getPins();
    const readModelPin = pins.find((pin) => pin.id === savedPin.id);

    expect(updated).toMatchObject({
      id: savedPin.id,
      title: "Miradouro de Santa Luzia",
      description: "Best at sunset.",
      imageUrl: "https://legacy.test/pins/hero.jpg",
      containerId: savedPin.container_id,
    });
    expect(detailsResult.rows[0]).toEqual({
      title: "Miradouro de Santa Luzia",
      description: "Best at sunset.",
    });
    expect(legacyPinResult.rows[0]).toEqual({
      name: "Miradouro de Santa Luzia",
      note: "Best at sunset.",
      image_url: "https://legacy.test/pins/hero.jpg",
    });
    expect(readModelPin).toMatchObject({
      id: savedPin.id,
      name: "Miradouro de Santa Luzia",
      note: "Best at sunset.",
      image_url: "https://legacy.test/pins/hero.jpg",
    });
  });

  it("ranks nearby pins by rating first and then distance", async () => {
    const targetPin = await savePin(-9.1406, 38.7223, context.collectionId, "Target");
    const closeUnrated = await savePin(-9.14075, 38.72245, context.collectionId, "Close Unrated");
    const midRated = await savePin(-9.1414, 38.7231, context.collectionId, "Rated Four");
    const farRated = await savePin(-9.1455, 38.7268, context.collectionId, "Rated Five");

    await updateEntityRating(midRated.container_id, 4);
    await updateEntityRating(farRated.container_id, 5);

    const nearbyPins = await getNearbyPinsForEntity(targetPin.id, {
      limit: 3,
      minRating: null,
      radiusMeters: 10000,
    });

    expect(nearbyPins.map((pin) => pin.id)).toEqual([
      farRated.id,
      midRated.id,
      closeUnrated.id,
    ]);
    expect(nearbyPins[0]).toMatchObject({
      title: "Rated Five",
      rating: 5,
    });
    expect(nearbyPins[1]).toMatchObject({
      title: "Rated Four",
      rating: 4,
    });
    expect(nearbyPins[2]).toMatchObject({
      title: "Close Unrated",
      rating: null,
    });
    expect(nearbyPins.every((pin) => pin.distanceMeters > 0)).toBe(true);
  });

  it("archives a pin entity through the generic delete route", async () => {
    const savedPin = await savePin(-9.135, 38.71, context.collectionId, "Delete Me");

    await deleteEntity("pin", savedPin.id);

    const containerResult = await pool.query<{
      status: string;
      archived_at: Date | null;
      purge_after: Date | null;
    }>(
      `
        SELECT status, archived_at, purge_after
        FROM entity_containers
        WHERE id = $1::uuid
      `,
      [savedPin.container_id]
    );

    expect(containerResult.rows[0].status).toBe("archived");
    expect(containerResult.rows[0].archived_at).toBeTruthy();
    expect(containerResult.rows[0].purge_after).toBeTruthy();
  });

  it("archives a trace entity through the generic delete route", async () => {
    const savedTrace = await saveTrace(
      [
        [-9.15, 38.72],
        [-9.14, 38.73],
      ],
      "#f97316"
    );

    await deleteEntity("trace", savedTrace.id);

    const containerResult = await pool.query<{
      status: string;
      archived_at: Date | null;
      purge_after: Date | null;
    }>(
      `
        SELECT status, archived_at, purge_after
        FROM entity_containers
        WHERE id = $1::uuid
      `,
      [savedTrace.container_id]
    );

    expect(containerResult.rows[0].status).toBe("archived");
    expect(containerResult.rows[0].archived_at).toBeTruthy();
    expect(containerResult.rows[0].purge_after).toBeTruthy();
  });

  it("archives an area entity through the generic delete route", async () => {
    const savedArea = await saveArea(
      [
        [-9.15, 38.72],
        [-9.14, 38.72],
        [-9.145, 38.73],
      ],
      "#2563eb"
    );

    await deleteEntity("area", savedArea.id);

    const containerResult = await pool.query<{
      status: string;
      archived_at: Date | null;
      purge_after: Date | null;
    }>(
      `
        SELECT status, archived_at, purge_after
        FROM entity_containers
        WHERE id = $1::uuid
      `,
      [savedArea.container_id]
    );

    expect(containerResult.rows[0].status).toBe("archived");
    expect(containerResult.rows[0].archived_at).toBeTruthy();
    expect(containerResult.rows[0].purge_after).toBeTruthy();
  });

  it("persists pin rating in the canonical entity_ratings enrichment table", async () => {
    const savedPin = await savePin(-9.135, 38.71, context.collectionId, "Rate Me");

    const nextValue = await updateEntityRating(savedPin.container_id, 4);
    const storedValue = await getEntityRating(savedPin.container_id);

    const ratingRow = await pool.query<{ value: number }>(
      `
        SELECT value
        FROM entity_ratings
        WHERE entity_container_id = $1::uuid
          AND user_id = $2
      `,
      [savedPin.container_id, context.userId]
    );

    expect(nextValue).toBe(4);
    expect(storedValue).toBe(4);
    expect(ratingRow.rows[0]?.value).toBe(4);
  });

  it("updates entity title through canonical details without requiring the full info payload", async () => {
    const savedPin = await savePin(-9.12, 38.7, context.collectionId, "Untitled Marker");

    const updated = await updateEntityTitle("pin", savedPin.id, "Alfama Viewpoint");

    const detailsResult = await pool.query<{
      title: string | null;
      description: string;
    }>(
      `
        SELECT title, description
        FROM entity_details
        WHERE entity_container_id = $1::uuid
      `,
      [savedPin.container_id]
    );

    const legacyPinResult = await pool.query<{
      name: string | null;
    }>(
      `
        SELECT name
        FROM pins
        WHERE id = $1::uuid
      `,
      [savedPin.id]
    );

    const payload = await getEntityWidgetPayload("pin", savedPin.id);

    expect(updated).toMatchObject({
      id: savedPin.id,
      title: "Alfama Viewpoint",
      containerId: savedPin.container_id,
    });
    expect(detailsResult.rows[0]).toEqual({
      title: "Alfama Viewpoint",
      description: "",
    });
    expect(legacyPinResult.rows[0]).toEqual({
      name: "Alfama Viewpoint",
    });
    expect(payload.title).toBe("Alfama Viewpoint");
  });

  it("stores media canonically and prefers canonical media over legacy image fallbacks", async () => {
    const savedPin = await savePin(-9.12, 38.7, context.collectionId, "Gallery Pin");

    await updateEntityInfo(
      "pin",
      savedPin.id,
      "Gallery Pin",
      "",
      "https://legacy.test/pins/fallback.jpg"
    );

    const heroMedia = await addEntityMediaItem("pin", savedPin.id, {
      storageKey: "media/hero",
      publicUrl: "https://cdn.test/media/hero.jpg",
      caption: "Hero image",
    });
    const secondaryMedia = await addEntityMediaItem("pin", savedPin.id, {
      storageKey: "media/secondary",
      publicUrl: "https://cdn.test/media/secondary.jpg",
      caption: "Secondary image",
    });

    const mediaItems = await getEntityMediaItems("pin", savedPin.id);
    const payload = await getEntityWidgetPayload("pin", savedPin.id);

    expect(mediaItems).toHaveLength(2);
    expect(mediaItems).toMatchObject([
      {
        id: heroMedia.id,
        storageKey: "media/hero",
        publicUrl: "https://cdn.test/media/hero.jpg",
        caption: "Hero image",
        position: 0,
      },
      {
        id: secondaryMedia.id,
        storageKey: "media/secondary",
        publicUrl: "https://cdn.test/media/secondary.jpg",
        caption: "Secondary image",
        position: 10,
      },
    ]);
    expect(payload.imageUrl).toBe("https://cdn.test/media/hero.jpg");

    await removeEntityMediaItem("pin", savedPin.id, heroMedia.id);

    const remainingMedia = await getEntityMediaItems("pin", savedPin.id);
    const legacyPinResult = await pool.query<{ image_url: string | null }>(
      `
        SELECT image_url
        FROM pins
        WHERE id = $1::uuid
      `,
      [savedPin.id]
    );

    expect(remainingMedia).toHaveLength(1);
    expect(remainingMedia[0]).toMatchObject({
      id: secondaryMedia.id,
      publicUrl: "https://cdn.test/media/secondary.jpg",
    });
    expect(legacyPinResult.rows[0]?.image_url).toBe("https://cdn.test/media/secondary.jpg");
  });

  it("supports resource-link placeholders, validation, updates, and removal", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        `
          <html>
            <head>
              <title>Official website</title>
              <meta name="description" content="Municipal guide for the palace." />
              <meta property="og:site_name" content="Oeiras" />
              <link rel="icon" href="/favicon.ico" />
            </head>
          </html>
        `,
        {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
        }
      )
    );

    const savedPin = await savePin(-9.11, 38.69, context.collectionId, "Resources Pin");

    const createdLink = await addEntityResourceLink("pin", savedPin.id, {
      label: "Official website",
    });

    expect(createdLink).toMatchObject({
      label: "Official website",
      url: "",
      position: 0,
    });

    await expect(
      updateEntityResourceLink("pin", savedPin.id, createdLink.id, {
        label: "Official website",
        url: "   ",
      })
    ).rejects.toThrow("Resource URL is required.");

    const updatedLink = await updateEntityResourceLink("pin", savedPin.id, createdLink.id, {
      label: "Official website",
      url: "visitall.test/resource",
    });

    const linksAfterUpdate = await getEntityResourceLinks("pin", savedPin.id);

    expect(updatedLink).toMatchObject({
      id: createdLink.id,
      label: "Official website",
      position: 0,
    });
    expect(updatedLink.url).toBe("https://visitall.test/resource");
    expect(updatedLink.preview).toMatchObject({
      hostname: "visitall.test",
      siteName: "Oeiras",
      title: "Official website",
      description: "Municipal guide for the palace.",
      faviconUrl: "https://visitall.test/favicon.ico",
      status: "ready",
    });
    expect(linksAfterUpdate).toHaveLength(1);
    expect(linksAfterUpdate[0]).toMatchObject({
      id: createdLink.id,
      label: "Official website",
    });
    expect(linksAfterUpdate[0]?.url).toBe("https://visitall.test/resource");
    expect(linksAfterUpdate[0]?.preview?.title).toBe("Official website");

    await removeEntityResourceLink("pin", savedPin.id, createdLink.id);

    expect(await getEntityResourceLinks("pin", savedPin.id)).toEqual([]);
    fetchSpy.mockRestore();
  });

  it("stores, updates, and removes markdown notes in entity_story_entries", async () => {
    const savedPin = await savePin(-9.11, 38.69, context.collectionId, "Story Pin");

    const createdEntry = await addEntityStoryEntry("pin", savedPin.id, {
      title: "Arrival notes",
      bodyMarkdown: "# Hello\n\nThis is **markdown**.",
    });

    const secondEntry = await addEntityStoryEntry("pin", savedPin.id, {
      title: "Second note",
      bodyMarkdown: "Plain text body",
    });

    const updatedEntry = await updateEntityStoryEntry("pin", savedPin.id, createdEntry.id, {
      title: "Arrival notes revised",
      bodyMarkdown: "## Better\n\n- one\n- two",
    });

    await removeEntityStoryEntry("pin", savedPin.id, secondEntry.id);

    const storyEntries = await getEntityStoryEntries("pin", savedPin.id);

    const storyRow = await pool.query<{
      title: string | null;
      body_markdown: string;
      position: number;
    }>(
      `
        SELECT title, body_markdown, position
        FROM entity_story_entries
        WHERE id = $1::uuid
      `,
      [createdEntry.id]
    );

    expect(createdEntry).toMatchObject({
      title: "Arrival notes",
      bodyMarkdown: "# Hello\n\nThis is **markdown**.",
      position: 0,
    });
    expect(secondEntry).toMatchObject({
      title: "Second note",
      bodyMarkdown: "Plain text body",
      position: 10,
    });
    expect(updatedEntry).toMatchObject({
      id: createdEntry.id,
      title: "Arrival notes revised",
      bodyMarkdown: "## Better\n\n- one\n- two",
      position: 0,
    });
    expect(storyEntries).toHaveLength(1);
    expect(storyEntries[0]).toMatchObject({
      id: createdEntry.id,
      title: "Arrival notes revised",
      bodyMarkdown: "## Better\n\n- one\n- two",
    });
    expect(storyRow.rows[0]).toEqual({
      title: "Arrival notes revised",
      body_markdown: "## Better\n\n- one\n- two",
      position: 0,
    });
  });
});
