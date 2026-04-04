"use client";

import type { ReactNode } from "react";

type AuthPanelProps = {
  children: ReactNode;
  maxWidthClassName?: string;
};

type AuthEyebrowProps = {
  children: ReactNode;
};

type AuthButtonProps = {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "dark";
};

export function AuthPanel({
  children,
  maxWidthClassName = "max-w-xl",
}: AuthPanelProps) {
  return (
    <div className={`relative w-full ${maxWidthClassName} overflow-hidden rounded-[32px] border border-black/10 bg-white p-10 shadow-[0px_24px_80px_rgba(0,0,0,0.1)]`}>
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-20 w-[6px] bg-[#b7102a]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[6px] w-24 bg-[#00327d]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-24 top-0 h-[6px] w-12 bg-[#ffdf00]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-10 top-10 grid h-8 w-8 grid-cols-2 grid-rows-2 overflow-hidden rounded-[8px] border border-black/8 bg-white/70"
      >
        <span className="border-r border-b border-black/8 bg-[#b7102a]" />
        <span className="border-b border-black/8 bg-white" />
        <span className="border-r border-black/8 bg-[#00327d]" />
        <span className="bg-[#ffdf00]" />
      </span>
      {children}
    </div>
  );
}

export function AuthEyebrow({ children }: AuthEyebrowProps) {
  return (
    <div className="inline-flex items-center gap-3">
      <span
        aria-hidden
        className="grid h-4 w-4 grid-cols-2 grid-rows-2 overflow-hidden rounded-[4px] border border-black/10 bg-white"
      >
        <span className="border-r border-b border-black/10 bg-[#b7102a]" />
        <span className="border-b border-black/10 bg-white" />
        <span className="border-r border-black/10 bg-[#00327d]" />
        <span className="bg-[#ffdf00]" />
      </span>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
        {children}
      </p>
    </div>
  );
}

export function AuthButton({
  children,
  className = "",
  type = "button",
  disabled = false,
  onClick,
  variant = "primary",
}: AuthButtonProps) {
  const variantClassName =
    variant === "primary"
      ? "bg-[#00327d] text-white hover:bg-[#001f4d]"
      : variant === "dark"
        ? "bg-[#111111] text-white hover:bg-black"
        : "border border-black/10 bg-white text-neutral-900 hover:bg-neutral-50";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-[0.18em] transition-colors disabled:opacity-60 ${variantClassName} ${className}`}
    >
      <span
        aria-hidden
        className={`absolute left-0 top-0 h-full w-[4px] ${
          variant === "secondary" ? "bg-[#00327d]" : "bg-[#ffdf00]"
        }`}
      />
      <span
        aria-hidden
        className={`absolute left-[4px] top-0 h-[4px] w-[10px] ${
          variant === "dark" ? "bg-[#b7102a]" : "bg-[#b7102a]"
        }`}
      />
      <span
        aria-hidden
        className={`absolute bottom-0 left-[14px] h-[4px] w-[8px] ${
          variant === "primary" ? "bg-white/80" : "bg-[#ffdf00]"
        }`}
      />
      <span className="relative z-[1]">{children}</span>
    </button>
  );
}
