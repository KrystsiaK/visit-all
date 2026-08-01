"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { getHomeShellSnapshot, bootstrapHomeShellState } from "@/app/actions";
import type { LeftSidebarShellInstance } from "@/modules/shell/types";
import type { WidgetInstanceRecord, WidgetPlacementRecord } from "@/lib/widgets";
import type { UserProfileViewModel } from "@/components/widgets/user-widgets/UserProfileWidgetCard";

interface ShellBootstrapContextValue {
  shellId: string;
  leftSidebarWidgets: Array<WidgetPlacementRecord & WidgetInstanceRecord>;
  setLeftSidebarWidgets: Dispatch<SetStateAction<Array<WidgetPlacementRecord & WidgetInstanceRecord>>>;
  userProfile: UserProfileViewModel | null;
  setUserProfile: (profile: UserProfileViewModel | null) => void;
  refresh: () => void;
}

const ShellBootstrapContext = createContext<ShellBootstrapContextValue | null>(null);

export function useShellBootstrap(): ShellBootstrapContextValue {
  const ctx = useContext(ShellBootstrapContext);
  if (!ctx) throw new Error("useShellBootstrap must be within ShellBootstrapProvider");
  return ctx;
}

interface ShellBootstrapProviderProps {
  children: ReactNode;
  refreshKey?: number;
}

export function ShellBootstrapProvider({ children, refreshKey = 0 }: ShellBootstrapProviderProps) {
  const [leftSidebarShell, setLeftSidebarShell] = useState<LeftSidebarShellInstance | null>(null);
  const [leftSidebarWidgets, setLeftSidebarWidgets] = useState<Array<WidgetPlacementRecord & WidgetInstanceRecord>>([]);
  const [userProfile, setUserProfile] = useState<UserProfileViewModel | null>(null);
  const [internalTick, setInternalTick] = useState(0);

  const combinedKey = refreshKey + internalTick;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        let snapshot = await getHomeShellSnapshot();
        if (snapshot.bootstrapRequired) {
          await bootstrapHomeShellState();
          snapshot = await getHomeShellSnapshot();
        }
        if (cancelled) return;
        setLeftSidebarShell(snapshot.leftSidebarShell);
        setLeftSidebarWidgets(snapshot.leftSidebarWidgets);
        setUserProfile(snapshot.userProfile);
      } catch (error) {
        console.error("Failed to load shell", error);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedKey]);

  const refresh = useCallback(() => setInternalTick((v) => v + 1), []);
  const shellId = leftSidebarShell?.id ?? "left_sidebar";

  return (
    <ShellBootstrapContext.Provider
      value={{ shellId, leftSidebarWidgets, setLeftSidebarWidgets, userProfile, setUserProfile, refresh }}
    >
      {children}
    </ShellBootstrapContext.Provider>
  );
}