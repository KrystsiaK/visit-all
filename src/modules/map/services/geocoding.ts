import type { GeographicSearchResult } from "@/modules/map/types";

const PHOTON_API_URL =
  process.env.NEXT_PUBLIC_PHOTON_API_URL?.trim() || "https://photon.komoot.io/api/";

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

function formatSubtitle(properties: NonNullable<PhotonFeature["properties"]>) {
  const street = [properties.street, properties.housenumber].filter(Boolean).join(" ");
  return [street, properties.city, properties.state, properties.country]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(", ");
}

export async function searchGeography(
  query: string,
  options: { signal?: AbortSignal; language?: string; limit?: number } = {}
): Promise<GeographicSearchResult[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 3) return [];

  const url = new URL(PHOTON_API_URL);
  url.searchParams.set("q", normalizedQuery);
  url.searchParams.set("limit", String(options.limit ?? 5));
  url.searchParams.set("lang", options.language ?? "default");

  const response = await fetch(url, {
    signal: options.signal,
    headers: { Accept: "application/geo+json, application/json" },
  });

  if (!response.ok) {
    throw new Error(`Photon search failed with status ${response.status}`);
  }

  const payload = (await response.json()) as PhotonResponse;

  return (payload.features ?? []).flatMap((feature, index) => {
    const coordinates = feature.geometry?.coordinates;
    const properties = feature.properties;
    if (!coordinates || !properties) return [];

    const [lng, lat] = coordinates;
    const title = properties.name || properties.street || properties.city;
    if (!title || !Number.isFinite(lng) || !Number.isFinite(lat)) return [];

    return [{
      id: `${properties.osm_type ?? "feature"}-${properties.osm_id ?? index}`,
      title,
      subtitle: formatSubtitle(properties),
      lng,
      lat,
    }];
  });
}
