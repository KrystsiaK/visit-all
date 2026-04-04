"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";
import { signIn } from "next-auth/react";

import {
  FieldFeedback,
  FieldLabel,
  PasswordInput,
  INPUT_PLACEHOLDERS,
  getFieldInputClassName,
} from "@/components/inputs/FieldChrome";
import { EMAIL_LOCAL_PART_MAX_LENGTH, EMAIL_MAX_LENGTH } from "@/lib/auth/email-policy";
import { getEmailFieldErrors, getRequiredPasswordErrors } from "@/lib/auth/form-policy";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const emailErrors = useMemo(() => getEmailFieldErrors(email), [email]);
  const passwordErrors = useMemo(() => getRequiredPasswordErrors(password), [password]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);
    setServerError(null);

    if (emailErrors.length > 0 || passwordErrors.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        if (res.error.includes("EMAIL_NOT_VERIFIED")) {
          setServerError("Verify your email before signing in.");
        } else if (res.error.includes("ACCOUNT_DISABLED")) {
          setServerError("This account is disabled.");
        } else {
          setServerError("Invalid credentials. Try again.");
        }
      } 
      else { window.location.href = "/"; }
    } catch { setServerError("System Authentication Node Offline."); } 
    finally { setLoading(false); }
  };

  const handleFieldChange =
    (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
      setServerError(null);
    };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col md:flex-row font-sans">
      
      {/* Bauhaus Architectural Left Panel */}
      <div className="flex-1 bg-[#00327d] flex flex-col justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#b7102a] -mr-16 -mt-16 mix-blend-multiply opacity-90" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ffdf9b] -ml-24 -mb-24 mix-blend-multiply opacity-90" />
        
        <div className="relative z-10 max-w-xl border-l-[12px] border-white pl-8">
          <h1 className="text-6xl md:text-7xl lg:text-[7rem] font-bold tracking-tighter uppercase font-display leading-[0.85] text-[#f9f9f9]">
            DIGITAL<br />CURATOR
          </h1>
          <p className="mt-8 text-xl lg:text-2xl font-medium text-white/90 font-sans tracking-wide max-w-md">
            A modernist exhibition space for your geographic memories and trajectories.
          </p>
        </div>
      </div>

      {/* Structured Right Panel */}
      <div className="flex-1 bg-white flex flex-col justify-center p-12 lg:p-24 relative shadow-[-20px_0_40px_rgba(0,0,0,0.05)] border-l border-gray-200">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 font-display uppercase tracking-tight">Access Gallery</h2>
            <div className="h-1.5 w-16 bg-[#b7102a] mt-6"></div>
          </div>

          <form className="space-y-8" onSubmit={handleAuth} noValidate>
            <div className="group relative">
              <FieldLabel
                info={`Use a real address you can access. Max ${EMAIL_MAX_LENGTH} characters total and ${EMAIL_LOCAL_PART_MAX_LENGTH} before '@'.`}
                invalid={submittedOnce && emailErrors.length > 0}
              >
                Email
              </FieldLabel>
              <input
                name="email" type="email" required value={email} onChange={handleFieldChange(setEmail)}
                className={getFieldInputClassName({
                  attempted: submittedOnce,
                  hasError: emailErrors.length > 0,
                  isValid: submittedOnce && emailErrors.length === 0,
                  baseClassName:
                    "w-full px-4 py-3.5 bg-[#f3f3f3] text-gray-900 border-b-[3px] focus:bg-white transition-all rounded-none outline-none font-medium placeholder-gray-400",
                })}
                placeholder={INPUT_PLACEHOLDERS.email}
              />
              <FieldFeedback
                attempted={submittedOnce}
                errors={emailErrors}
                successLabel="Email looks valid."
              />
            </div>

            <div className="group relative">
              <FieldLabel
                info="Enter the password for your account."
                invalid={submittedOnce && passwordErrors.length > 0}
              >
                Password
              </FieldLabel>
              <PasswordInput
                name="password"
                attempted={submittedOnce}
                hasError={passwordErrors.length > 0}
                isValid={submittedOnce && passwordErrors.length === 0}
                value={password}
                onChange={handleFieldChange(setPassword)}
                className="w-full px-4 py-3.5 bg-[#f3f3f3] text-gray-900 border-b-[3px] focus:bg-white transition-all rounded-none outline-none font-black placeholder-gray-400 text-lg tracking-widest"
                placeholder={INPUT_PLACEHOLDERS.password}
                required
              />
              <FieldFeedback
                attempted={submittedOnce}
                errors={passwordErrors}
                successLabel="Password looks good."
              />
            </div>

            {serverError ? (
              <p className="text-sm text-[#b7102a]">{serverError}</p>
            ) : null}

            <button
              type="submit" disabled={loading}
              className="w-full py-4 text-sm font-bold text-white bg-[#00327d] hover:bg-[#001f4d] uppercase tracking-[0.2em] rounded-none transition-colors outline-none flex justify-center items-center gap-3 mt-4"
            >
              {loading ? "Authenticating..." : "Enter Exhibition"}
            </button>
          </form>

          <p className="mt-8 text-sm text-gray-500">
            Need an account?{" "}
            <Link href="/register" className="font-semibold text-[#00327d]">
              Create one
            </Link>
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Forgot your password?{" "}
            <Link href="/forgot-password" className="font-semibold text-[#00327d]">
              Reset it
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
