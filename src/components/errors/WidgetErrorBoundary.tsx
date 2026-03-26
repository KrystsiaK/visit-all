"use client";

import type { ReactNode } from "react";
import { SurfaceErrorBoundary } from "@/components/errors/SurfaceErrorBoundary";

interface WidgetErrorBoundaryProps {
  children: ReactNode;
}

export const WidgetErrorBoundary = ({
  children,
}: WidgetErrorBoundaryProps) => (
  <SurfaceErrorBoundary
    kind="widget"
    compact
    title="Widget Fault"
    body="This widget crashed and was isolated from the rest of the shell."
  >
    {children}
  </SurfaceErrorBoundary>
);
