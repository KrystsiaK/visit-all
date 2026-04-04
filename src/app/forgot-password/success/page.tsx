import Link from "next/link";
import { CheckCircle2, MailCheck } from "lucide-react";
import { AuthButton, AuthEyebrow, AuthPanel } from "@/components/auth/AuthChrome";

interface ForgotPasswordSuccessPageProps {
  searchParams: Promise<{
    email?: string | string[];
  }>;
}

export default async function ForgotPasswordSuccessPage({
  searchParams,
}: ForgotPasswordSuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const email = Array.isArray(resolvedSearchParams.email)
    ? resolvedSearchParams.email[0]
    : resolvedSearchParams.email;

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
              Check Your Email
            </h1>
            <p className="mt-4 text-base leading-7 text-neutral-600">
              If an account exists for{" "}
              <span className="font-bold text-neutral-950">{email ?? "that email"}</span>, a secure
              password reset link is on its way now.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-black/8 bg-[#f7f7f7] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
            Next step
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-800">
            Open your inbox, follow the reset link, and choose a fresh password. If you do not see
            the email, check spam or request another one.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/forgot-password">
            <AuthButton variant="secondary">
              <span className="inline-flex items-center gap-2">
                <MailCheck className="h-4 w-4" />
                Send Another Link
              </span>
            </AuthButton>
          </Link>
          <Link href="/login">
            <AuthButton>Go to Login</AuthButton>
          </Link>
        </div>
      </AuthPanel>
    </div>
  );
}
