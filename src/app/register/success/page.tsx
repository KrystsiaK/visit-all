import { RegisterSuccessClient } from "./RegisterSuccessClient";

interface RegisterSuccessPageProps {
  searchParams: Promise<{
    email?: string | string[];
    verificationUrl?: string | string[];
  }>;
}

export default async function RegisterSuccessPage({
  searchParams,
}: RegisterSuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const email = Array.isArray(resolvedSearchParams.email)
    ? resolvedSearchParams.email[0]
    : resolvedSearchParams.email;
  const verificationUrl = Array.isArray(resolvedSearchParams.verificationUrl)
    ? resolvedSearchParams.verificationUrl[0]
    : resolvedSearchParams.verificationUrl;

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-6">
      <RegisterSuccessClient
        email={email ?? "your email"}
        verificationUrl={verificationUrl ?? null}
      />
    </div>
  );
}
