"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState, type ChangeEvent } from "react";

import {
  FieldFeedback,
  FieldLabel,
  PasswordInput,
  INPUT_PLACEHOLDERS,
  getFieldInputClassName,
} from "@/components/inputs/FieldChrome";
import {
  getPasswordPolicyErrors,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth/password-policy";
import {
  EMAIL_LOCAL_PART_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
} from "@/lib/auth/email-policy";
import { getConfirmPasswordErrors, getEmailFieldErrors } from "@/lib/auth/form-policy";
import {
  registerWithCredentials,
  type RegisterFormState,
} from "./actions";

const initialRegisterFormState: RegisterFormState = {
  ok: false,
  message: null,
  verificationUrl: null,
  fieldErrors: {},
};

type RegisterFields = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterClientErrors = {
  displayName?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
};

const emptyFields: RegisterFields = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const fieldHelpText: Record<keyof RegisterFields, string> = {
  displayName: "Optional public name shown in your account shell.",
  email: `Use a real address you can access. Max ${EMAIL_MAX_LENGTH} characters total and ${EMAIL_LOCAL_PART_MAX_LENGTH} before '@'.`,
  password: `Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters, including lowercase, uppercase, and a number.`,
  confirmPassword: "Repeat the password exactly to confirm it.",
};

function validateRegisterFields(fields: RegisterFields): RegisterClientErrors {
  const errors: RegisterClientErrors = {};

  const emailErrors = getEmailFieldErrors(fields.email);
  if (emailErrors.length > 0) {
    errors.email = emailErrors;
  }

  const passwordErrors = getPasswordPolicyErrors(fields.password);

  if (passwordErrors.length > 0) {
    errors.password = passwordErrors;
  }

  const confirmPasswordErrors = getConfirmPasswordErrors(fields.password, fields.confirmPassword);
  if (confirmPasswordErrors.length > 0) {
    errors.confirmPassword = confirmPasswordErrors;
  }

  return errors;
}

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    registerWithCredentials,
    initialRegisterFormState
  );
  const router = useRouter();
  const [fields, setFields] = useState<RegisterFields>(emptyFields);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = useState<RegisterFields>(emptyFields);
  const fieldErrors = state?.fieldErrors ?? {};
  const formMessage = state?.message ?? null;
  const formOk = state?.ok ?? false;
  const verificationUrl = state?.verificationUrl ?? null;
  const clientErrors = useMemo(() => validateRegisterFields(fields), [fields]);

  useEffect(() => {
    if (!formOk) {
      return;
    }

    const nextParams = new URLSearchParams({
      email: fields.email,
    });

    if (verificationUrl) {
      nextParams.set("verificationUrl", verificationUrl);
    }

    router.replace(`/register/success?${nextParams.toString()}`);
  }, [fields.email, formOk, router, verificationUrl]);

  const staleServerFieldError = (field: keyof RegisterFields) =>
    submittedSnapshot[field] !== fields[field];

  const mergedErrors: RegisterClientErrors = {
    displayName: submittedOnce
      ? [
          ...(clientErrors.displayName ?? []),
          ...(fieldErrors.displayName && !staleServerFieldError("displayName")
            ? [fieldErrors.displayName]
            : []),
        ]
      : [],
    email: submittedOnce
      ? [
          ...(clientErrors.email ?? []),
          ...(fieldErrors.email && !staleServerFieldError("email") ? [fieldErrors.email] : []),
        ]
      : [],
    password: submittedOnce
      ? [
          ...(clientErrors.password ?? []),
          ...(fieldErrors.password && !staleServerFieldError("password")
            ? [fieldErrors.password]
            : []),
        ]
      : [],
    confirmPassword: submittedOnce
      ? [
          ...(clientErrors.confirmPassword ?? []),
          ...(fieldErrors.confirmPassword && !staleServerFieldError("confirmPassword")
            ? [fieldErrors.confirmPassword]
            : []),
        ]
      : [],
  };

  const handleFieldChange =
    (field: keyof RegisterFields) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFields((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const handleClientValidationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setSubmittedOnce(true);
    setSubmittedSnapshot(fields);

    const nextErrors = validateRegisterFields(fields);
    const hasErrors = Object.values(nextErrors).some((messages) => (messages?.length ?? 0) > 0);

    if (hasErrors) {
      event.preventDefault();
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col md:flex-row font-sans">
      <div className="flex-1 bg-[#b7102a] flex flex-col justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00327d] -mr-16 -mt-16 mix-blend-multiply opacity-90" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ffdf00] -ml-24 -mb-24 mix-blend-multiply opacity-90" />

        <div className="relative z-10 max-w-xl border-l-[12px] border-white pl-8">
          <h1 className="text-6xl md:text-7xl lg:text-[7rem] font-bold tracking-tighter uppercase leading-[0.85] text-[#f9f9f9]">
            CREATE
            <br />
            ACCOUNT
          </h1>
          <p className="mt-8 text-xl lg:text-2xl font-medium text-white/90 tracking-wide max-w-md">
            Build your own cartographic archive with a private account and persistent shells.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white flex flex-col justify-center p-12 lg:p-24 relative shadow-[-20px_0_40px_rgba(0,0,0,0.05)] border-l border-gray-200">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
              Register
            </h2>
            <div className="h-1.5 w-16 bg-[#00327d] mt-6"></div>
          </div>

          {formOk ? (
            <div className="rounded-[28px] border border-[#00327d]/10 bg-[#f3f7ff] p-8">
              <p className="text-sm text-[#00327d]">Preparing your verification screen...</p>
            </div>
          ) : (
            <form className="space-y-6" action={formAction} onSubmit={handleClientValidationSubmit} noValidate>
              <div>
              <FieldLabel
                info={fieldHelpText.displayName}
                invalid={(mergedErrors.displayName?.length ?? 0) > 0}
              >
                Display Name
              </FieldLabel>
                <input
                  name="displayName"
                  type="text"
                  value={fields.displayName}
                  onChange={handleFieldChange("displayName")}
                className={getFieldInputClassName({
                    attempted: submittedOnce,
                    hasError: (mergedErrors.displayName?.length ?? 0) > 0,
                    isValid: submittedOnce,
                    baseClassName:
                      "w-full px-4 py-3.5 text-gray-900 border-b-[3px] focus:bg-white transition-all rounded-none outline-none font-medium",
                  })}
                  placeholder={INPUT_PLACEHOLDERS.displayName}
                />
                <FieldFeedback
                  attempted={submittedOnce}
                  errors={mergedErrors.displayName ?? []}
                  successLabel="Looks good."
                />
              </div>

              <div>
                <FieldLabel info={fieldHelpText.email} invalid={(mergedErrors.email?.length ?? 0) > 0}>
                  Email
                </FieldLabel>
                <input
                  name="email"
                  type="email"
                  required
                  value={fields.email}
                  onChange={handleFieldChange("email")}
                  className={getFieldInputClassName({
                    attempted: submittedOnce,
                    hasError: (mergedErrors.email?.length ?? 0) > 0,
                    isValid:
                      submittedOnce && (mergedErrors.email?.length ?? 0) === 0 && fields.email.trim().length > 0,
                    baseClassName:
                      "w-full px-4 py-3.5 text-gray-900 border-b-[3px] focus:bg-white transition-all rounded-none outline-none font-medium",
                  })}
                  placeholder={INPUT_PLACEHOLDERS.email}
                />
                <FieldFeedback
                  attempted={submittedOnce}
                  errors={mergedErrors.email ?? []}
                  successLabel="Email looks valid."
                />
              </div>

              <div>
                <FieldLabel
                  info={fieldHelpText.password}
                  invalid={(mergedErrors.password?.length ?? 0) > 0}
                >
                  Password
                </FieldLabel>
                <PasswordInput
                  name="password"
                  required
                  value={fields.password}
                  onChange={handleFieldChange("password")}
                  attempted={submittedOnce}
                  hasError={(mergedErrors.password?.length ?? 0) > 0}
                  isValid={submittedOnce && (mergedErrors.password?.length ?? 0) === 0 && fields.password.length > 0}
                  className="w-full px-4 py-3.5 text-gray-900 border-b-[3px] transition-all rounded-none outline-none font-medium"
                  placeholder={INPUT_PLACEHOLDERS.password}
                />
                <FieldFeedback
                  attempted={submittedOnce}
                  errors={mergedErrors.password ?? []}
                  successLabel="Password meets the requirements."
                />
              </div>

              <div>
                <FieldLabel
                  info={fieldHelpText.confirmPassword}
                  invalid={(mergedErrors.confirmPassword?.length ?? 0) > 0}
                >
                  Confirm Password
                </FieldLabel>
                <PasswordInput
                  name="confirmPassword"
                  required
                  value={fields.confirmPassword}
                  onChange={handleFieldChange("confirmPassword")}
                  attempted={submittedOnce}
                  hasError={(mergedErrors.confirmPassword?.length ?? 0) > 0}
                  isValid={
                    submittedOnce &&
                    (mergedErrors.confirmPassword?.length ?? 0) === 0 &&
                    fields.confirmPassword.length > 0
                  }
                  className="w-full px-4 py-3.5 text-gray-900 border-b-[3px] focus:bg-white transition-all rounded-none outline-none font-medium"
                  placeholder={INPUT_PLACEHOLDERS.confirmPassword}
                />
                <FieldFeedback
                  attempted={submittedOnce}
                  errors={mergedErrors.confirmPassword ?? []}
                  successLabel="Passwords match."
                />
              </div>

              {formMessage ? (
                <p className={`text-sm ${formOk ? "text-[#00327d]" : "text-[#b7102a]"}`}>
                  {formMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="w-full py-4 text-sm font-bold text-white bg-[#00327d] hover:bg-[#001f4d] uppercase tracking-[0.2em] rounded-none transition-colors outline-none"
              >
                {pending ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          <p className="mt-8 text-sm text-gray-500">
            {formOk ? "After verifying your email, return to " : "Already have access? "}
            <Link href="/login" className="font-semibold text-[#00327d]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
