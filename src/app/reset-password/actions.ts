"use server";

import { assertRateLimit } from "@/lib/rate-limit";
import { resetPasswordWithToken } from "@/lib/auth/password-reset";

export type ResetPasswordFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: {
    password?: string;
    confirmPassword?: string;
    token?: string;
  };
};

export async function completePasswordReset(
  _prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: ResetPasswordFormState["fieldErrors"] = {};

  if (!token) {
    fieldErrors.token = "Reset token is missing.";
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords must match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  await assertRateLimit({
    scope: "auth_password_reset_confirm",
    identifier: `password-reset-confirm|${token.slice(0, 12)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });

  const result = await resetPasswordWithToken(token, password);

  if (!result.ok) {
    return {
      ok: false,
      message: result.message,
      fieldErrors: result.code === "invalid_password" ? { password: result.message } : { token: result.message },
    };
  }

  return {
    ok: true,
    message: "Password updated. You can sign in now.",
    fieldErrors: {},
  };
}
