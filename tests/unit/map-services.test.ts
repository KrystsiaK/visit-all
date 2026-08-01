import { afterEach, describe, expect, it, vi } from "vitest";

import { searchGeography } from "@/modules/map/services/geocoding";
import { routeTraceSegment } from "@/modules/map/services/routing";
import {
  DEFAULT_MAP_STYLE_ID,
  MAP_STYLE_GROUPS,
  isMapStyleId,
} from "@/modules/map/config";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("map services", () => {
  it("exposes unique MapTiler style IDs and validates persisted selections", () => {
    const styleIds = MAP_STYLE_GROUPS.flatMap((group) =>
      group.styles.map((style) => style.id)
    );

    expect(styleIds).toHaveLength(39);
    expect(new Set(styleIds).size).toBe(styleIds.length);
    expect(isMapStyleId(DEFAULT_MAP_STYLE_ID)).toBe(true);
    expect(isMapStyleId("deprecated-map-style")).toBe(false);
  });

  it("normalizes Photon features into map search results", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          features: [
            {
              geometry: { coordinates: [27.5615, 53.9023] },
              properties: {
                osm_type: "N",
                osm_id: 42,
                name: "Minsk",
                country: "Belarus",
              },
            },
          ],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchGeography("Minsk")).resolves.toEqual([
      {
        id: "N-42",
        title: "Minsk",
        subtitle: "Belarus",
        lng: 27.5615,
        lat: 53.9023,
      },
    ]);

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("lang=default");
  });

  it("reports an unavailable routing endpoint to the editor fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const start = { lng: 27.56, lat: 53.9 };
    const end = { lng: 27.57, lat: 53.91 };

    await expect(routeTraceSegment(start, end)).rejects.toThrow("offline");
  });

  it("maps normalized pedestrian route coordinates to drawing points", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            coordinates: [
              { lng: 27.56, lat: 53.9 },
              { lng: 27.565, lat: 53.905 },
              { lng: 27.57, lat: 53.91 },
            ],
          }),
          { status: 200 }
        )
      )
    );

    await expect(
      routeTraceSegment({ lng: 27.56, lat: 53.9 }, { lng: 27.57, lat: 53.91 })
    ).resolves.toEqual([
      { lng: 27.56, lat: 53.9 },
      { lng: 27.565, lat: 53.905 },
      { lng: 27.57, lat: 53.91 },
    ]);

    const [requestUrl, requestInit] = vi.mocked(fetch).mock.calls[0];
    expect(requestUrl).toBe("/api/map/route");
    expect(requestInit).toMatchObject({ method: "POST" });
  });
});
