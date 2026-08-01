"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { updateLeftSidebarShellState } from "@/app/actions";

interface ViewportContextValue {
  isMobileViewport: boolean;
  mobileSidebarOpen: boolean;
  desktopSidebarVisible: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleDesktopSidebar: () => void;
}

const ViewportContext = createContext<ViewportContextValue | null>(null);

export function useViewport(): ViewportContextValue {
  const ctx = useContext(ViewportContext);
  if (!ctx) throw new Error("useViewport must be within ViewportProvider");
  return ctx;
}

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarVisible, setDesktopSidebarVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = (e?: MediaQueryListEvent) => {
      const mobile = e?.matches ?? mq.matches;
      setIsMobileViewport(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const toggleDesktopSidebar = useCallback(() => {
    setDesktopSidebarVisible((prev) => {
      const next = !prev;
      void updateLeftSidebarShellState({ hidden: !next }).catch(console.error);
      return next;
    });
  }, []);

  return (
    <ViewportContext.Provider
      value={{ isMobileViewport, mobileSidebarOpen, desktopSidebarVisible, setMobileSidebarOpen, toggleDesktopSidebar }}
    >
      {children}
    </ViewportContext.Provider>
  );
}