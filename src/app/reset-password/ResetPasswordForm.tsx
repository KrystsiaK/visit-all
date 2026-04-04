"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState, type ChangeEvent } from "react";

import { AuthButton } from "@/components/auth/AuthChrome";
import {
  FieldFeedback,
  FieldLabel,
  PasswordInput,
  INPUT_PLACEHOLDERS,
} from "@/components/inputs/FieldChrome";
import { getConfirmPasswordErrors, getPasswordFieldErrors } from "@/lib/auth/form-policy";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/auth/password-policy";
import {
  completePasswordReset,
  type ResetPasswordFormState,
} from "./actions";

const initialResetPasswordFormState: ResetPasswordFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [state, formAction, pending] = useActionState(
    completePasswordReset,
    initialResetPasswordFormState
  );
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = useState({
    password: "",
    confirmPassword: "",
  });
  const fieldErrors = state?.fieldErrors ?? {};
  const formMessage = state?.message ?? null;
  const formOk = state?.ok ?? false;
  const passwordErrors = useMemo(() => getPasswordFieldErrors(password), [password]);
  const confirmPasswordErrors = useMemo(
    () => getConfirmPasswordErrors(password, confirmPassword),
    [password, confirmPassword]
  );

  const mergedPasswordErrors = submittedOnce
    ? [
        ...passwordErrors,
        ...(fieldErrors.password && submittedSnapshot.password === password ? [fieldErrors.password] : []),
      ]
    : [];
  const mergedConfirmPasswordErrors = submittedOnce
    ? [
        ...confirmPasswordErrors,
        ...(fieldErrors.confirmPassword && submittedSnapshot.confirmPassword === confirmPassword
          ? [fieldErrors.confirmPassword]
          : []),
      ]
    : [];

  useEffect(() => {
    if (!formOk) {
      return;
    }

    router.replace("/reset-password/success");
  }, [formOk, router]);

  const handleFieldChange =
    (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
    };

  const handleClientValidationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setSubmittedOnce(true);
    setSubmittedSnapshot({
      password,
      confirmPassword,
    });

    if (passwordErrors.length > 0 || confirmPasswordErrors.length > 0) {
      event.preventDefault();
    }
  };

  return (
    <>
      {formOk ? (
        <div className="mt-8 rounded-[28px] border border-[#00327d]/10 bg-[#f3f7ff] p-8">
          <p className="text-sm text-[#00327d]">Finalizing password update...</p>
        </div>
      ) : (
        <form action={formAction} className="mt-8 space-y-5" onSubmit={handleClientValidationSubmit} noValidate>
          <input type="hidden" name="token" value={token ?? ""} />

          <div>
            <FieldLabel
              info={`Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters, including lowercase, uppercase, and a number.`}
              invalid={mergedPasswordErrors.length > 0}
            >
              New Password
            </FieldLabel>
            <PasswordInput
              name="password"
              required
              value={password}
              onChange={handleFieldChange(setPassword)}
              attempted={submittedOnce}
              hasError={mergedPasswordErrors.length > 0}
              isValid={submittedOnce && mergedPasswordErrors.length === 0}
              className="w-full rounded-2xl border bg-[#f3f3f3] px-4 py-3.5 text-sm font-medium text-neutral-900 outline-none"
              placeholder={INPUT_PLACEHOLDERS.newPassword}
            />
            <FieldFeedback
              attempted={submittedOnce}
              errors={mergedPasswordErrors}
              successLabel="Password meets the requirements."
            />
          </div>

          <div>
            <FieldLabel
              info="Repeat the password exactly to confirm it."
              invalid={mergedConfirmPasswordErrors.length > 0}
            >
              Confirm Password
            </FieldLabel>
            <PasswordInput
              name="confirmPassword"
              required
              value={confirmPassword}
              onChange={handleFieldChange(setConfirmPassword)}
              attempted={submittedOnce}
              hasError={mergedConfirmPasswordErrors.length > 0}
              isValid={submittedOnce && mergedConfirmPasswordErrors.length === 0}
              className="w-full rounded-2xl border bg-[#f3f3f3] px-4 py-3.5 text-sm font-medium text-neutral-900 outline-none"
              placeholder={INPUT_PLACEHOLDERS.confirmPassword}
            />
            <FieldFeedback
              attempted={submittedOnce}
              errors={mergedConfirmPasswordErrors}
              successLabel="Passwords match."
            />
          </div>

          {formMessage ? (
            <p className={`text-sm ${formOk ? "text-[#00327d]" : "text-[#b7102a]"}`}>
              {formMessage}
            </p>
          ) : null}

          <AuthButton type="submit" disabled={pending || !token} className="w-full">
            {pending ? "Updating..." : "Set New Password"}
          </AuthButton>

          <div className="flex gap-3">
            <Link href="/login">
              <AuthButton variant="secondary">Back to Login</AuthButton>
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
