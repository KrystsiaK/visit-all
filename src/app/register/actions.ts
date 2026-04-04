"use server";

import { assertRateLimit } from "@/lib/rate-limit";
import { createUserWithPassword, getUserByEmail } from "@/lib/auth/users";
import { validatePasswordPolicy } from "@/lib/auth/passwords";
import { issueEmailVerification } from "@/lib/auth/email-verification";
import { authDebug } from "@/lib/auth/debug";
import { normalizeEmail, validateEmailPolicy } from "@/lib/auth/email-policy";

export type RegisterFormState = {
  ok: boolean;
  message: string | null;
  verificationUrl?: string | null;
  fieldErrors: {
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export type ResendPendingVerificationState = {
  ok: boolean;
  message: string | null;
  verificationUrl?: string | null;
};

export async function registerWithCredentials(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  authDebug("register.attempt", { email, hasDisplayName: Boolean(displayName) });

  const fieldErrors: RegisterFormState["fieldErrors"] = {};

  const emailPolicy = validateEmailPolicy(email);
  if (!emailPolicy.ok) {
    fieldErrors.email = emailPolicy.message ?? "Enter a valid email address.";
  }

  const passwordPolicy = validatePasswordPolicy(password);
  if (!passwordPolicy.ok) {
    fieldErrors.password = passwordPolicy.message ?? "Invalid password.";
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords must match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    authDebug("register.validation_failed", {
      email,
      fields: Object.keys(fieldErrors),
    });
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      verificationUrl: null,
      fieldErrors,
    };
  }

  await assertRateLimit({
    scope: "auth_register",
    identifier: `signup|${email}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    authDebug("register.duplicate_email", { email, userId: existingUser.id });
    return {
      ok: false,
      message: "An account with this email already exists.",
      verificationUrl: null,
      fieldErrors: {
        email: "An account with this email already exists.",
      },
    };
  }

  const user = await createUserWithPassword({
    email,
    password,
    displayName,
  });
  authDebug("register.user_created", { email, userId: user.id });

  const verification = await issueEmailVerification(user.id, user.email);
  authDebug("register.verification_issued", { email, userId: user.id });

  return {
    ok: true,
    message: "Account created. Check your email to verify it before signing in.",
    verificationUrl:
      !process.env.RESEND_API_KEY || !process.env.AUTH_EMAIL_FROM
        ? verification.verificationUrl
        : null,
    fieldErrors: {},
  };
}

export async function resendPendingVerification(
  _prevState: ResendPendingVerificationState,
  formData: FormData
): Promise<ResendPendingVerificationState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  authDebug("register.resend_verification_attempt", { email });

  const emailPolicy = validateEmailPolicy(email);
  if (!emailPolicy.ok) {
    return {
      ok: false,
      message: emailPolicy.message ?? "Enter a valid email address.",
      verificationUrl: null,
    };
  }

  await assertRateLimit({
    scope: "auth_verify_email",
    identifier: `verify|${email}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });

  const user = await getUserByEmail(email);
  if (!user) {
    authDebug("register.resend_verification_missing_user", { email });
    return {
      ok: true,
      message: "If that account exists, a fresh verification link has been sent.",
      verificationUrl: null,
    };
  }

  if (user.email_verified_at) {
    authDebug("register.resend_verification_already_verified", { email, userId: user.id });
    return {
      ok: true,
      message: "This email is already verified. You can sign in now.",
      verificationUrl: null,
    };
  }

  const verification = await issueEmailVerification(user.id, user.email);
  authDebug("register.resend_verification_issued", { email, userId: user.id });

  return {
    ok: true,
    message: "A fresh verification link has been sent.",
    verificationUrl:
      !process.env.RESEND_API_KEY || !process.env.AUTH_EMAIL_FROM
        ? verification.verificationUrl
        : null,
  };
}
