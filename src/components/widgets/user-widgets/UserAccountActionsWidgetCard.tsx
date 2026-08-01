"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";

import { CheckCircle2, LogOut, MailCheck } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useMemo, useState } from "react";

import { PasswordInput, INPUT_PLACEHOLDERS, OutlineButton, PrimaryButton, EyebrowLabel } from "@synarava/ui-kit";
import { BaseWidget } from "@synarava/shell-kit";
import {
  getConfirmPasswordErrors,
  getPasswordFieldErrors,
  getRequiredPasswordErrors,
} from "@/lib/auth/form-policy";
import { useCurrentWidget } from "@/modules/entity/EntityContext";
import { useUserShellData, useUserShellWriteState, useUserShellActions } from "@/contexts/user-shell-context";

export function UserAccountActionsWidgetCard() {
  const widget = useCurrentWidget();
  const { profile } = useUserShellData();
  const { resendPending, resetPending, passwordChangePending } = useUserShellWriteState();
  const { handleResendVerification, handleRequestPasswordReset, handleChangePassword } = useUserShellActions();

  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordOk, setPasswordOk] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<"currentPassword" | "nextPassword" | "confirmPassword", string>>>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const currentPasswordErrors = useMemo(
    () => getRequiredPasswordErrors(currentPassword, "current password"),
    [currentPassword]
  );
  const nextPasswordErrors = useMemo(() => getPasswordFieldErrors(nextPassword), [nextPassword]);
  const confirmPasswordErrors = useMemo(
    () => getConfirmPasswordErrors(nextPassword, confirmPassword),
    [nextPassword, confirmPassword]
  );

  const mergedCurrentPasswordErrors = submittedOnce
    ? [...currentPasswordErrors, ...(passwordErrors.currentPassword ? [passwordErrors.currentPassword] : [])]
    : [];
  const mergedNextPasswordErrors = submittedOnce
    ? [...nextPasswordErrors, ...(passwordErrors.nextPassword ? [passwordErrors.nextPassword] : [])]
    : [];
  const mergedConfirmPasswordErrors = submittedOnce
    ? [...confirmPasswordErrors, ...(passwordErrors.confirmPassword ? [passwordErrors.confirmPassword] : [])]
    : [];

  if (!profile) return null;

  return (
    <BaseWidget {...WIDGET_GLASS}
      eyebrow="Account"
      title={widget?.name ?? "Account Actions"}
      subtitle="Session actions and verification status."
      identityVisibility="settings-only"
    >
      <div className="space-y-4 rounded-[24px] bg-white/55 p-5">
        <div className="rounded-2xl border border-black/8 bg-white/60 p-4">
          <EyebrowLabel>Email</EyebrowLabel>
          <p className="mt-2 text-sm font-medium text-neutral-900">{profile.email}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
            {profile.emailVerifiedAt ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-[#00327d]" />
                <span>Verified and ready.</span>
              </>
            ) : (
              <>
                <MailCheck className="h-4 w-4 text-[#b7102a]" />
                <span>Verification still required.</span>
              </>
            )}
          </div>
        </div>

        {!profile.emailVerifiedAt ? (
          <OutlineButton onClick={() => void handleResendVerification()} disabled={resendPending}>
            <MailCheck className="h-4 w-4" />
            {resendPending ? "Sending..." : "Resend Verification"}
          </OutlineButton>
        ) : null}

        <OutlineButton onClick={() => void handleRequestPasswordReset()} disabled={resetPending}>
          <MailCheck className="h-4 w-4" />
          {resetPending ? "Sending..." : "Email Password Reset"}
        </OutlineButton>

        <div className="rounded-2xl border border-black/8 bg-white/60 p-4">
          <EyebrowLabel>Change Password</EyebrowLabel>

          <div className="mt-3 space-y-3">
            <div>
              <PasswordInput
                attempted={submittedOnce}
                hasError={mergedCurrentPasswordErrors.length > 0}
                isValid={submittedOnce && mergedCurrentPasswordErrors.length === 0}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none"
                placeholder={INPUT_PLACEHOLDERS.currentPassword}
              />
              {submittedOnce
                ? mergedCurrentPasswordErrors.map((error) => (
                    <p key={error} className="mt-2 text-xs text-[#b7102a]">{error}</p>
                  ))
                : null}
            </div>
            <div>
              <PasswordInput
                attempted={submittedOnce}
                hasError={mergedNextPasswordErrors.length > 0}
                isValid={submittedOnce && mergedNextPasswordErrors.length === 0}
                value={nextPassword}
                onChange={(event) => setNextPassword(event.target.value)}
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none"
                placeholder={INPUT_PLACEHOLDERS.newPassword}
              />
              {submittedOnce
                ? mergedNextPasswordErrors.map((error) => (
                    <p key={error} className="mt-2 text-xs text-[#b7102a]">{error}</p>
                  ))
                : null}
            </div>
            <div>
              <PasswordInput
                attempted={submittedOnce}
                hasError={mergedConfirmPasswordErrors.length > 0}
                isValid={submittedOnce && mergedConfirmPasswordErrors.length === 0}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none"
                placeholder={INPUT_PLACEHOLDERS.confirmPassword}
              />
              {submittedOnce
                ? mergedConfirmPasswordErrors.map((error) => (
                    <p key={error} className="mt-2 text-xs text-[#b7102a]">{error}</p>
                  ))
                : null}
            </div>
          </div>

          {passwordMessage ? (
            <p className={`mt-3 text-xs ${passwordOk ? "text-[#00327d]" : "text-[#b7102a]"}`}>
              {passwordMessage}
            </p>
          ) : null}

          <OutlineButton
            disabled={passwordChangePending}
            className="mt-4"
            onClick={() => {
              void (async () => {
                setSubmittedOnce(true);
                if (currentPasswordErrors.length > 0 || nextPasswordErrors.length > 0 || confirmPasswordErrors.length > 0) {
                  setPasswordOk(false);
                  setPasswordMessage("Please fix the highlighted fields.");
                  return;
                }
                const result = await handleChangePassword({ currentPassword, nextPassword, confirmPassword });
                setPasswordOk(result.ok);
                setPasswordMessage(result.message);
                setPasswordErrors(result.fieldErrors ?? {});
                if (result.ok) {
                  setSubmittedOnce(false);
                  setCurrentPassword("");
                  setNextPassword("");
                  setConfirmPassword("");
                }
              })();
            }}
          >
            <MailCheck className="h-4 w-4" />
            {passwordChangePending ? "Updating..." : "Update Password"}
          </OutlineButton>
        </div>

        <PrimaryButton onClick={() => void signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </PrimaryButton>

        <Link
          href="/forgot-password"
          className="block text-center text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500"
        >
          Open reset page
        </Link>
      </div>
    </BaseWidget>
  );
}