import { ResetPasswordForm } from "./ResetPasswordForm";
import { AuthEyebrow, AuthPanel } from "@/components/auth/AuthChrome";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token ?? null;

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-6">
      <AuthPanel>
        <AuthEyebrow>Visit Auth</AuthEyebrow>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-neutral-950">
          Set New Password
        </h1>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          {token
            ? "Choose a fresh password for your account."
            : "This reset link is missing or invalid. Request a new password reset email."}
        </p>

        <ResetPasswordForm token={token} />
      </AuthPanel>
    </div>
  );
}
