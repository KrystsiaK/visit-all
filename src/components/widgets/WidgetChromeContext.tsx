"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { WidgetHost, WidgetHostOption } from "@/lib/widget-hosts";

export interface WidgetChromeContextValue {
  currentHost?: WidgetHost;
  hostOptions?: WidgetHostOption[];
  hostSelectionDisabled?: boolean;
  onHostChange?: (host: WidgetHost) => void;
}

const WidgetChromeContext = createContext<WidgetChromeContextValue | null>(null);

interface WidgetChromeProviderProps {
  children: ReactNode;
  currentHost?: WidgetHost;
  hostOptions?: WidgetHostOption[];
  hostSelectionDisabled?: boolean;
  onHostChange?: (host: WidgetHost) => void;
}

export const WidgetChromeProvider = ({
  children,
  currentHost,
  hostOptions,
  hostSelectionDisabled,
  onHostChange,
}: WidgetChromeProviderProps) => (
  <WidgetChromeContext.Provider
    value={{
      currentHost,
      hostOptions,
      hostSelectionDisabled,
      onHostChange,
    }}
  >
    {children}
  </WidgetChromeContext.Provider>
);

export const useWidgetChromeContext = () => useContext(WidgetChromeContext);
