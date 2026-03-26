"use client";

import type { ReactNode } from "react";

import { cn } from "@/components/ui/utils";

interface ShellStackProps {
  children: ReactNode;
  className?: string;
}

export const ShellStack = ({
  children,
  className,
}: ShellStackProps) => (
  <div className={cn("flex w-full flex-col gap-3", className)}>{children}</div>
);
