"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getUserShellWidgets,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  resendCurrentUserVerificationEmail,
  requestCurrentUserPasswordReset,
  changeCurrentUserPassword,
  removeShellWidgetPlacement,
} from "@/app/actions";
import { useShellWidgetReorder } from "@synarava/shell-kit";
import type { WidgetPlacementRecord, WidgetInstanceRecord } from "@/lib/widgets";
import type { UserProfileViewModel } from "./UserProfileWidgetCard";

type UserShellWidget = WidgetPlacementRecord & WidgetInstanceRecord;

interface UseUserShellBindingsProps {
  isOpen: boolean;
  onProfileChange?: (profile: UserProfileViewModel) => void;
}

export function useUserShellBindings({ isOpen, onProfileChange }: UseUserShellBindingsProps) {
  const [widgets, setWidgets] = useState<UserShellWidget[]>([]);
  const [profile, setProfile] = useState<UserProfileViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const [passwordChangePending, setPasswordChangePending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const [shellWidgets, userProfile] = await Promise.all([
          getUserShellWidgets(),
          getCurrentUserProfile(),
        ]);

        if (!cancelled) {
          setWidgets(shellWidgets);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const sorted = useMemo(
    () => [...widgets].sort((a, b) => a.position - b.position),
    [widgets]
  );

  const { draggedWidgetId, previewWidgets, handleSlotPointerDown } = useShellWidgetReorder({
    shellId: "user_shell",
    widgets: sorted,
    onReorder: setWidgets,
  });

  const handleRemoveWidget = async (widgetId: string) => {
    try {
      await removeShellWidgetPlacement(widgetId, "user_shell");
      setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveProfile = async (input: { displayName: string; avatarStyle: string }) => {
    setSavingProfile(true);
    try {
      const nextProfile = await updateCurrentUserProfile(input);
      setProfile(nextProfile);
      onProfileChange?.(nextProfile);
    } catch (error) {
      console.error("Failed to update user profile", error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResendVerification = async () => {
    setResendPending(true);
    try {
      await resendCurrentUserVerificationEmail();
    } catch (error) {
      console.error("Failed to resend verification email", error);
    } finally {
      setResendPending(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    setResetPending(true);
    try {
      await requestCurrentUserPasswordReset();
    } catch (error) {
      console.error("Failed to request password reset", error);
    } finally {
      setResetPending(false);
    }
  };

  const handleChangePassword = async (input: {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }) => {
    setPasswordChangePending(true);
    try {
      return await changeCurrentUserPassword(input);
    } catch (error) {
      console.error("Failed to change password", error);
      return { ok: false as const, message: "Could not update password.", fieldErrors: {} };
    } finally {
      setPasswordChangePending(false);
    }
  };

  return {
    profile,
    loading,
    previewWidgets,
    draggedWidgetId,
    handleSlotPointerDown,
    savingProfile,
    resendPending,
    resetPending,
    passwordChangePending,
    handleRemoveWidget,
    handleSaveProfile,
    handleResendVerification,
    handleRequestPasswordReset,
    handleChangePassword,
  };
}