export interface PathPoint {
  lng: number;
  lat: number;
}

export function removePathPoint(path: PathPoint[], pointIndex: number) {
  if (pointIndex < 0 || pointIndex >= path.length) {
    return path;
  }

  return path.filter((_, index) => index !== pointIndex);
}
