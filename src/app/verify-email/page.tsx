import Link from "next/link";

import { AuthButton, AuthEyebrow, AuthPanel } from "@/components/auth/AuthChrome";
import { consumeEmailVerificationToken } from "@/lib/auth/email-verification";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token;
  const result = token ? await consumeEmailVerificationToken(token) : { ok: false as const };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-6">
      <AuthPanel>
        <AuthEyebrow>Visit Auth</AuthEyebrow>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-neutral-950">
          {result.ok ? "Email Verified" : "Verification Failed"}
        </h1>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          {result.ok
            ? "Your account is active now. You can sign in and start using your private shells."
            : "This verification link is invalid or expired. Request a fresh verification email from your account shell or register again."}
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/login">
            <AuthButton>Go to Login</AuthButton>
          </Link>
          <Link href="/register">
            <AuthButton variant="secondary">Register Again</AuthButton>
          </Link>
        </div>
      </AuthPanel>
    </div>
  );
}
