"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState, type ChangeEvent } from "react";

import { AuthButton, AuthEyebrow, AuthPanel } from "@/components/auth/AuthChrome";
import {
  FieldFeedback,
  FieldLabel,
  INPUT_PLACEHOLDERS,
  getFieldInputClassName,
} from "@/components/inputs/FieldChrome";
import { EMAIL_LOCAL_PART_MAX_LENGTH, EMAIL_MAX_LENGTH } from "@/lib/auth/email-policy";
import { getEmailFieldErrors } from "@/lib/auth/form-policy";
import {
  requestPasswordReset,
  type ForgotPasswordFormState,
} from "./actions";

const initialForgotPasswordFormState: ForgotPasswordFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialForgotPasswordFormState
  );
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = useState("");
  const fieldErrors = state?.fieldErrors ?? {};
  const formMessage = state?.message ?? null;
  const formOk = state?.ok ?? false;
  const clientErrors = useMemo(() => getEmailFieldErrors(email), [email]);
  const staleServerFieldError = submittedSnapshot !== email;
  const mergedEmailErrors = submittedOnce
    ? [...clientErrors, ...(fieldErrors.email && !staleServerFieldError ? [fieldErrors.email] : [])]
    : [];

  useEffect(() => {
    if (!formOk) {
      return;
    }

    const nextParams = new URLSearchParams({
      email,
    });

    router.replace(`/forgot-password/success?${nextParams.toString()}`);
  }, [email, formOk, router]);

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleClientValidationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setSubmittedOnce(true);
    setSubmittedSnapshot(email);

    if (clientErrors.length > 0) {
      event.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-6">
      <AuthPanel>
        <AuthEyebrow>Visit Auth</AuthEyebrow>
        {formOk ? (
          <div className="rounded-[28px] border border-[#00327d]/10 bg-[#f3f7ff] p-8">
            <p className="text-sm text-[#00327d]">Preparing your reset instructions...</p>
          </div>
        ) : (
          <>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-neutral-950">
              Reset Password
            </h1>
            <p className="mt-4 text-base leading-7 text-neutral-600">
              Enter your account email and we will send a secure reset link if the account exists.
            </p>

            <form
              action={formAction}
              className="mt-8 space-y-5"
              onSubmit={handleClientValidationSubmit}
              noValidate
            >
              <div>
                <FieldLabel
                  info={`Use a real address you can access. Max ${EMAIL_MAX_LENGTH} characters total and ${EMAIL_LOCAL_PART_MAX_LENGTH} before '@'.`}
                  invalid={mergedEmailErrors.length > 0}
                >
                  Email
                </FieldLabel>
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={handleFieldChange}
                  className={getFieldInputClassName({
                    attempted: submittedOnce,
                    hasError: mergedEmailErrors.length > 0,
                    isValid: submittedOnce && mergedEmailErrors.length === 0,
                    baseClassName:
                      "mt-2 w-full rounded-2xl border bg-[#f3f3f3] px-4 py-3.5 text-sm font-medium text-neutral-900 outline-none",
                  })}
                  placeholder={INPUT_PLACEHOLDERS.email}
                />
                <FieldFeedback
                  attempted={submittedOnce}
                  errors={mergedEmailErrors}
                  successLabel="Email format looks good."
                />
              </div>

              {formMessage ? (
                <p className={`text-sm ${formOk ? "text-[#00327d]" : "text-[#b7102a]"}`}>
                  {formMessage}
                </p>
              ) : null}

              <AuthButton type="submit" disabled={pending} className="w-full">
                {pending ? "Sending..." : "Send Reset Link"}
              </AuthButton>
            </form>

            <div className="mt-8 flex gap-3">
              <Link href="/login">
                <AuthButton variant="secondary">Back to Login</AuthButton>
              </Link>
              <Link href="/register">
                <AuthButton variant="dark">Create Account</AuthButton>
              </Link>
            </div>
          </>
        )}
      </AuthPanel>
    </div>
  );
}
