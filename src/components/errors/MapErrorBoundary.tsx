"use client";

import type { ReactNode } from "react";
import { SurfaceErrorBoundary } from "@/components/errors/SurfaceErrorBoundary";

interface MapErrorBoundaryProps {
  children: ReactNode;
}

export const MapErrorBoundary = ({
  children,
}: MapErrorBoundaryProps) => (
  <SurfaceErrorBoundary
    kind="map"
    title="Map Fault"
    body="The map failed, but shells and widgets should still remain alive."
    className="absolute inset-0 m-6"
  >
    {children}
  </SurfaceErrorBoundary>
);
