"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface WidgetHostOption {
  value: string;
  label: string;
}

export interface WidgetContextValue {
  currentHost?: string;
  hostOptions?: WidgetHostOption[];
  hostSelectionDisabled?: boolean;
  onHostChange?: (host: string) => void;
}

const FrameworkWidgetContext = createContext<WidgetContextValue | null>(null);

interface WidgetProviderProps {
  children: ReactNode;
  currentHost?: string;
  hostOptions?: WidgetHostOption[];
  hostSelectionDisabled?: boolean;
  onHostChange?: (host: string) => void;
}

export const WidgetProvider = ({
  children,
  currentHost,
  hostOptions,
  hostSelectionDisabled,
  onHostChange,
}: WidgetProviderProps) => (
  <FrameworkWidgetContext.Provider
    value={{
      currentHost,
      hostOptions,
      hostSelectionDisabled,
      onHostChange,
    }}
  >
    {children}
  </FrameworkWidgetContext.Provider>
);

export const useWidgetContext = () => useContext(FrameworkWidgetContext);
