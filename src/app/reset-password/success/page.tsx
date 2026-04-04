"use client";

import { CheckCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { AuthButton, AuthEyebrow, AuthPanel } from "@/components/auth/AuthChrome";

export default function ResetPasswordSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-6">
      <AuthPanel maxWidthClassName="max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#15803d]/10 text-[#15803d]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <AuthEyebrow>Visit Auth</AuthEyebrow>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-neutral-950">
              Password Updated
            </h1>
            <p className="mt-4 text-base leading-7 text-neutral-600">
              Your password has been changed successfully. Return to login and sign in with the new
              password.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-black/8 bg-[#f7f7f7] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
            Next step
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-800">
            Use the same email and the fresh password you just set.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <AuthButton type="button" onClick={() => void signOut({ callbackUrl: "/login" })}>
            Go to Login
          </AuthButton>
        </div>
      </AuthPanel>
    </div>
  );
}
