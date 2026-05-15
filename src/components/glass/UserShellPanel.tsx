"use client";

import { removeShellWidgetPlacement } from "@/app/actions";
import { ShellSlot } from "@synarava/shell-kit";
import { UserShell } from "@/components/shells/UserShell";
import { UserAccountActionsWidgetCard } from "@/components/widgets/user-widgets/UserAccountActionsWidgetCard";
import {
  UserProfileWidgetCard,
  type UserProfileViewModel,
} from "@/components/widgets/user-widgets/UserProfileWidgetCard";
import { ShellNotesWidget } from "@/components/widgets/shell-widgets/ShellNotesWidget";
import { ShellClockWidget } from "@/components/widgets/shell-widgets/ShellClockWidget";
import type { WidgetInstanceRecord, WidgetPlacementRecord } from "@/lib/widgets";

export function UserShellPanel({
  isOpen,
  onClose,
  widgets,
  onWidgetsChange,
  profile,
  loading,
  savingProfile,
  resendPending,
  resetPending,
  passwordChangePending,
  onSaveProfile,
  onResendVerification,
  onRequestPasswordReset,
  onChangePassword,
}: {
  isOpen: boolean;
  onClose: () => void;
  widgets: Array<WidgetPlacementRecord & WidgetInstanceRecord>;
  onWidgetsChange?: (nextWidgets: Array<WidgetPlacementRecord & WidgetInstanceRecord>) => void;
  profile: UserProfileViewModel | null;
  loading: boolean;
  savingProfile: boolean;
  resendPending: boolean;
  resetPending: boolean;
  passwordChangePending: boolean;
  onSaveProfile: (input: { displayName: string; avatarStyle: string }) => Promise<void>;
  onResendVerification: () => Promise<void>;
  onRequestPasswordReset: () => Promise<void>;
  onChangePassword: (input: {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }) => Promise<{ ok: boolean; message: string; fieldErrors?: Partial<Record<"currentPassword" | "nextPassword" | "confirmPassword", string>> }>;
}) {
  const handleRemoveShellWidget = async (widgetId: string) => {
    try {
      await removeShellWidgetPlacement(widgetId, "user_shell");
      onWidgetsChange?.(widgets.filter((widget) => widget.id !== widgetId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <UserShell isOpen={isOpen} onClose={onClose}>
      {loading ? (
        <>
          <div className="h-[220px] rounded-[28px] border border-black/8 bg-white/55 shadow-[0px_8px_32px_rgba(0,0,0,0.05)]" />
          <div className="h-[280px] rounded-[28px] border border-black/8 bg-white/55 shadow-[0px_8px_32px_rgba(0,0,0,0.05)]" />
        </>
      ) : null}

      {widgets.map((widget) => {
        if (!profile) {
          return null;
        }

        let content = null;

        if (widget.componentKey === "user_profile") {
          content = (
            <UserProfileWidgetCard
              key={`${widget.id}:${profile.displayName ?? ""}:${profile.avatarStyle ?? ""}:${profile.emailVerifiedAt ?? ""}`}
              widget={widget}
              profile={profile}
              saving={savingProfile}
              onSave={onSaveProfile}
            />
          );
        } else if (widget.componentKey === "user_account_actions") {
          content = (
            <UserAccountActionsWidgetCard
              widget={widget}
              profile={profile}
              resendPending={resendPending}
              resetPending={resetPending}
              passwordChangePending={passwordChangePending}
              onResendVerification={onResendVerification}
              onRequestPasswordReset={onRequestPasswordReset}
              onChangePassword={onChangePassword}
            />
          );
        } else if (widget.componentKey === "shell_notes") {
          content = (
            <ShellNotesWidget
              widget={widget}
              onDelete={() => void handleRemoveShellWidget(widget.id)}
            />
          );
        } else if (widget.componentKey === "shell_clock") {
          content = (
            <ShellClockWidget
              widget={widget}
              onDelete={() => void handleRemoveShellWidget(widget.id)}
            />
          );
        }

        if (!content) {
          return null;
        }

        return <ShellSlot key={widget.id}>{content}</ShellSlot>;
      })}
    </UserShell>
  );
}
