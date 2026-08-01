"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserProfileViewModel } from "@/components/widgets/user-widgets/UserProfileWidgetCard";
import type { WidgetInstanceRecord } from "@/lib/widgets";

// ── UserShellDataContext ─────────────────────────────────────────────────────
// Changes when profile loads or user saves profile.
export interface UserShellDataContextValue {
  profile: UserProfileViewModel | null;
  loading: boolean;
  previewWidgets: WidgetInstanceRecord[];
  draggedWidgetId: string | null;
  handleSlotPointerDown: (event: React.PointerEvent<HTMLDivElement>, widgetId: string) => void;
}

const UserShellDataContext = createContext<UserShellDataContextValue | null>(null);

export function useUserShellData(): UserShellDataContextValue {
  const ctx = useContext(UserShellDataContext);
  if (!ctx) throw new Error("useUserShellData must be inside UserShellProvider");
  return ctx;
}

// ── UserShellWriteContext ────────────────────────────────────────────────────
// Isolated so pending spinners don't re-render the whole shell.
export interface UserShellWriteContextValue {
  savingProfile: boolean;
  resendPending: boolean;
  resetPending: boolean;
  passwordChangePending: boolean;
}

const UserShellWriteContext = createContext<UserShellWriteContextValue | null>(null);

export function useUserShellWriteState(): UserShellWriteContextValue {
  const ctx = useContext(UserShellWriteContext);
  if (!ctx) throw new Error("useUserShellWriteState must be inside UserShellProvider");
  return ctx;
}

// ── UserShellActionsContext ──────────────────────────────────────────────────
// Stable: all handlers are useCallback'd in useUserShellBindings.
export interface UserShellActionsContextValue {
  handleSaveProfile: (input: { displayName: string; avatarStyle: string }) => Promise<void>;
  handleResendVerification: () => Promise<void>;
  handleRequestPasswordReset: () => Promise<void>;
  handleChangePassword: (input: {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }) => Promise<{ ok: boolean; message: string; fieldErrors?: Partial<Record<"currentPassword" | "nextPassword" | "confirmPassword", string>> }>;
  handleRemoveWidget: (widgetId: string) => Promise<void>;
}

const UserShellActionsContext = createContext<UserShellActionsContextValue | null>(null);

export function useUserShellActions(): UserShellActionsContextValue {
  const ctx = useContext(UserShellActionsContext);
  if (!ctx) throw new Error("useUserShellActions must be inside UserShellProvider");
  return ctx;
}

// Safe version — returns null outside UserShellProvider (used by shell_notes / shell_clock).
export function useUserShellActionsIfAvailable(): UserShellActionsContextValue | null {
  return useContext(UserShellActionsContext);
}

// ── UserShellProvider ────────────────────────────────────────────────────────
interface UserShellProviderProps
  extends UserShellDataContextValue,
    UserShellWriteContextValue,
    UserShellActionsContextValue {
  children: ReactNode;
}

export function UserShellProvider({
  children,
  profile,
  loading,
  previewWidgets,
  draggedWidgetId,
  handleSlotPointerDown,
  savingProfile,
  resendPending,
  resetPending,
  passwordChangePending,
  handleSaveProfile,
  handleResendVerification,
  handleRequestPasswordReset,
  handleChangePassword,
  handleRemoveWidget,
}: UserShellProviderProps) {
  return (
    <UserShellDataContext.Provider
      value={{ profile, loading, previewWidgets, draggedWidgetId, handleSlotPointerDown }}
    >
      <UserShellWriteContext.Provider
        value={{ savingProfile, resendPending, resetPending, passwordChangePending }}
      >
        <UserShellActionsContext.Provider
          value={{
            handleSaveProfile,
            handleResendVerification,
            handleRequestPasswordReset,
            handleChangePassword,
            handleRemoveWidget,
          }}
        >
          {children}
        </UserShellActionsContext.Provider>
      </UserShellWriteContext.Provider>
    </UserShellDataContext.Provider>
  );
}
