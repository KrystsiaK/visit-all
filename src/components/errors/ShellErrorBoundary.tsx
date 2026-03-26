"use client";

import type { ReactNode } from "react";
import { SurfaceErrorBoundary } from "@/components/errors/SurfaceErrorBoundary";

interface ShellErrorBoundaryProps {
  children: ReactNode;
  title?: string;
}

export const ShellErrorBoundary = ({
  children,
  title = "Shell Fault",
}: ShellErrorBoundaryProps) => (
  <SurfaceErrorBoundary
    kind="shell"
    title={title}
    body="This shell failed locally. The rest of the interface should continue working."
    className="w-[min(360px,calc(100vw-2rem))] md:w-[var(--shell-fallback-width,360px)]"
  >
    {children}
  </SurfaceErrorBoundary>
);
