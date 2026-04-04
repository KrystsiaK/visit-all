"use client";

import Link from "next/link";
import { CheckCircle2, MailCheck } from "lucide-react";
import { useActionState } from "react";

import {
  resendPendingVerification,
  type ResendPendingVerificationState,
} from "../actions";

const initialResendState: ResendPendingVerificationState = {
  ok: false,
  message: null,
  verificationUrl: null,
};

export function RegisterSuccessClient({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    resendPendingVerification,
    initialResendState
  );

  const effectiveVerificationUrl = state.verificationUrl ?? verificationUrl;

  return (
    <div className="w-full max-w-2xl rounded-[32px] border border-black/10 bg-white p-10 shadow-[0px_24px_80px_rgba(0,0,0,0.1)]">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#15803d]/10 text-[#15803d]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
            Visit Auth
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-neutral-950">
            Check Your Email
          </h1>
          <p className="mt-4 text-base leading-7 text-neutral-600">
            Your account was created for <span className="font-bold text-neutral-950">{email}</span>.
            Verify that email before signing in to the app.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-black/8 bg-[#f7f7f7] p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
          Next step
        </p>
        <p className="mt-2 text-sm leading-6 text-neutral-800">
          Open your inbox, click the verification link, then come back here and sign in.
        </p>
      </div>

      <form action={formAction} className="mt-6">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-900"
        >
          <MailCheck className="h-4 w-4" />
          {pending ? "Sending..." : "Resend Verification"}
        </button>
      </form>

      {state.message ? (
        <p className={`mt-4 text-sm ${state.ok ? "text-[#00327d]" : "text-[#b7102a]"}`}>
          {state.message}
        </p>
      ) : null}

      {effectiveVerificationUrl ? (
        <div className="mt-6 rounded-2xl border border-[#ffdf00]/60 bg-[#fffceb] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
            Local development
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-800">
            Email delivery is not configured here yet, so you can verify directly from this link.
          </p>
          <a
            href={effectiveVerificationUrl}
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#00327d] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white"
          >
            Verify Email Now
          </a>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-2xl bg-[#00327d] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white"
        >
          Go to Login
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-900"
        >
          Register Again
        </Link>
      </div>
    </div>
  );
}
