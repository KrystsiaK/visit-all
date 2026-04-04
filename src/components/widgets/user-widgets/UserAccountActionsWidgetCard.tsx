"use client";

import { CheckCircle2, LogOut, MailCheck } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useMemo, useState } from "react";

import { PasswordInput, INPUT_PLACEHOLDERS } from "@/components/inputs/FieldChrome";
import { WidgetChrome } from "@/components/widgets/WidgetChrome";
import {
  getConfirmPasswordErrors,
  getPasswordFieldErrors,
  getRequiredPasswordErrors,
} from "@/lib/auth/form-policy";
import type { WidgetInstanceRecord } from "@/lib/widgets";
import type { UserProfileViewModel } from "./UserProfileWidgetCard";

interface UserAccountActionsWidgetCardProps {
  widget: WidgetInstanceRecord;
  profile: UserProfileViewModel;
  resendPending: boolean;
  resetPending: boolean;
  passwordChangePending: boolean;
  onResendVerification: () => Promise<void>;
  onRequestPasswordReset: () => Promise<void>;
  onChangePassword: (input: {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }) => Promise<{ ok: boolean; message: string; fieldErrors?: Partial<Record<"currentPassword" | "nextPassword" | "confirmPassword", string>> }>;
}

export function UserAccountActionsWidgetCard({
  widget,
  profile,
  resendPending,
  resetPending,
  passwordChangePending,
  onResendVerification,
  onRequestPasswordReset,
  onChangePassword,
}: UserAccountActionsWidgetCardProps) {
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
    ? [
        ...confirmPasswordErrors,
        ...(passwordErrors.confirmPassword ? [passwordErrors.confirmPassword] : []),
      ]
    : [];

  return (
    <WidgetChrome
      eyebrow="Account"
      title={widget.name}
      subtitle="Session actions and verification status."
      identityVisibility="settings-only"
    >
      <div className="space-y-4 rounded-[24px] bg-white/55 p-5">
        <div className="rounded-2xl border border-black/8 bg-white/60 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
            Email
          </p>
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
          <button
            type="button"
            onClick={() => void onResendVerification()}
            disabled={resendPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            <MailCheck className="h-4 w-4" />
            {resendPending ? "Sending..." : "Resend Verification"}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => void onRequestPasswordReset()}
          disabled={resetPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-60"
        >
          <MailCheck className="h-4 w-4" />
          {resetPending ? "Sending..." : "Email Password Reset"}
        </button>

        <div className="rounded-2xl border border-black/8 bg-white/60 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
            Change Password
          </p>

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
                    <p key={error} className="mt-2 text-xs text-[#b7102a]">
                      {error}
                    </p>
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
                    <p key={error} className="mt-2 text-xs text-[#b7102a]">
                      {error}
                    </p>
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
                    <p key={error} className="mt-2 text-xs text-[#b7102a]">
                      {error}
                    </p>
                  ))
                : null}
            </div>
          </div>

          {passwordMessage ? (
            <p className={`mt-3 text-xs ${passwordOk ? "text-[#00327d]" : "text-[#b7102a]"}`}>
              {passwordMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={async () => {
              setSubmittedOnce(true);

              if (
                currentPasswordErrors.length > 0 ||
                nextPasswordErrors.length > 0 ||
                confirmPasswordErrors.length > 0
              ) {
                setPasswordOk(false);
                setPasswordMessage("Please fix the highlighted fields.");
                return;
              }

              const result = await onChangePassword({
                currentPassword,
                nextPassword,
                confirmPassword,
              });

              setPasswordOk(result.ok);
              setPasswordMessage(result.message);
              setPasswordErrors(result.fieldErrors ?? {});

              if (result.ok) {
                setSubmittedOnce(false);
                setCurrentPassword("");
                setNextPassword("");
                setConfirmPassword("");
              }
            }}
            disabled={passwordChangePending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            <MailCheck className="h-4 w-4" />
            {passwordChangePending ? "Updating..." : "Update Password"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-black"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>

        <Link
          href="/forgot-password"
          className="block text-center text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500"
        >
          Open reset page
        </Link>
      </div>
    </WidgetChrome>
  );
}
