"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { GeneratedWidgetRecord } from "@/app/actions";

interface GeneratedWidgetRuntimeValue {
  widget: GeneratedWidgetRecord;
  onArchive: () => void;
}

const GeneratedWidgetRuntimeContext = createContext<GeneratedWidgetRuntimeValue | null>(null);

export function GeneratedWidgetRuntimeProvider({
  widget,
  onArchive,
  children,
}: GeneratedWidgetRuntimeValue & { children: ReactNode }) {
  return (
    <GeneratedWidgetRuntimeContext.Provider value={{ widget, onArchive }}>
      {children}
    </GeneratedWidgetRuntimeContext.Provider>
  );
}

export function useGeneratedWidgetRuntime(): GeneratedWidgetRuntimeValue | null {
  return useContext(GeneratedWidgetRuntimeContext);
}