"use server";

import { issuePasswordReset } from "@/lib/auth/password-reset";
import { getUserForPasswordReset } from "@/lib/auth/users";
import { assertRateLimit } from "@/lib/rate-limit";
import { authDebug } from "@/lib/auth/debug";
import { normalizeEmail, validateEmailPolicy } from "@/lib/auth/email-policy";

export type ForgotPasswordFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: {
    email?: string;
  };
};

export async function requestPasswordReset(
  _prevState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  authDebug("forgot_password.attempt", { email });

  const emailPolicy = validateEmailPolicy(email);
  if (!emailPolicy.ok) {
    return {
      ok: false,
      message: emailPolicy.message ?? "Enter a valid email address.",
      fieldErrors: {
        email: emailPolicy.message ?? "Enter a valid email address.",
      },
    };
  }

  await assertRateLimit({
    scope: "auth_password_reset_request",
    identifier: `password-reset|${email}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });

  const user = await getUserForPasswordReset(email);
  if (user) {
    authDebug("forgot_password.user_found", { email, userId: user.id });
    await issuePasswordReset(user.id, user.email);
  } else {
    authDebug("forgot_password.user_missing", { email });
  }

  return {
    ok: true,
    message: "If that email exists, a reset link has been sent.",
    fieldErrors: {},
  };
}
