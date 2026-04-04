"use client";

import { ShellWidgetSlot } from "@/components/shells/ShellWidgetSlot";
import { UserShell } from "@/components/shells/UserShell";
import { UserAccountActionsWidgetCard } from "@/components/widgets/user-widgets/UserAccountActionsWidgetCard";
import {
  UserProfileWidgetCard,
  type UserProfileViewModel,
} from "@/components/widgets/user-widgets/UserProfileWidgetCard";
import type { WidgetInstanceRecord } from "@/lib/widgets";

export function UserShellPanel({
  isOpen,
  onClose,
  widgets,
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
  widgets: WidgetInstanceRecord[];
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
        }

        if (!content) {
          return null;
        }

        return <ShellWidgetSlot key={widget.id}>{content}</ShellWidgetSlot>;
      })}
    </UserShell>
  );
}
