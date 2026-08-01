import type { MapCoordinate } from "@/modules/map/types";

interface RouteResponse {
  coordinates?: MapCoordinate[];
}

export async function routeTraceSegment(
  start: MapCoordinate,
  end: MapCoordinate,
  options: { signal?: AbortSignal } = {}
): Promise<MapCoordinate[]> {
  try {
    const response = await fetch("/api/map/route", {
      method: "POST",
      signal: options.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ start, end, profile: "pedestrian" }),
    });
    if (!response.ok) {
      throw new Error(`Routing request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as RouteResponse;
    if (!payload.coordinates || payload.coordinates.length < 2) {
      throw new Error("Routing response did not include a usable path");
    }

    return payload.coordinates.map((coordinate, index, coordinates) => {
      if (index === 0) return start;
      if (index === coordinates.length - 1) return end;
      return coordinate;
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw error;
  }
}
