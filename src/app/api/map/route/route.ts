import { auth } from "@/auth";
import type { MapCoordinate } from "@/modules/map/types";

const DEFAULT_VALHALLA_URL = "https://valhalla1.openstreetmap.de";

interface RouteRequestBody {
  start?: MapCoordinate;
  end?: MapCoordinate;
  profile?: "pedestrian";
}

interface ValhallaResponse {
  code?: string;
  routes?: Array<{
    geometry?: { coordinates?: [number, number][] };
  }>;
}

const isCoordinate = (value: unknown): value is MapCoordinate => {
  if (!value || typeof value !== "object") return false;
  const coordinate = value as Partial<MapCoordinate>;
  return (
    typeof coordinate.lng === "number" &&
    Number.isFinite(coordinate.lng) &&
    coordinate.lng >= -180 &&
    coordinate.lng <= 180 &&
    typeof coordinate.lat === "number" &&
    Number.isFinite(coordinate.lat) &&
    coordinate.lat >= -90 &&
    coordinate.lat <= 90
  );
};

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RouteRequestBody;
  try {
    body = (await request.json()) as RouteRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isCoordinate(body.start) || !isCoordinate(body.end)) {
    return Response.json({ error: "Valid start and end coordinates are required" }, { status: 400 });
  }

  const baseUrl = process.env.VALHALLA_BASE_URL?.trim() || DEFAULT_VALHALLA_URL;
  const url = new URL("/route", baseUrl);
  url.searchParams.set(
    "json",
    JSON.stringify({
      locations: [
        { lat: body.start.lat, lon: body.start.lng },
        { lat: body.end.lat, lon: body.end.lng },
      ],
      costing: body.profile || "pedestrian",
      format: "osrm",
      shape_format: "geojson",
      directions_options: { units: "kilometers" },
    })
  );

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      return Response.json({ error: "Routing provider unavailable" }, { status: 502 });
    }

    const payload = (await response.json()) as ValhallaResponse;
    const coordinates = payload.routes?.[0]?.geometry?.coordinates;
    if (payload.code !== "Ok" || !coordinates || coordinates.length < 2) {
      return Response.json({ error: "No pedestrian route found" }, { status: 422 });
    }

    return Response.json({
      provider: "valhalla",
      profile: "pedestrian",
      coordinates: coordinates.map(([lng, lat]) => ({ lng, lat })),
    });
  } catch {
    return Response.json({ error: "Routing request failed" }, { status: 502 });
  }
}
