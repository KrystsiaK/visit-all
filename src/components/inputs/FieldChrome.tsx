"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Tooltip } from "@/components/ui/Tooltip";

export const INPUT_PLACEHOLDERS = {
  displayName: "Display name",
  email: "name@example.com",
  password: "••••••••••••",
  confirmPassword: "••••••••••••",
  currentPassword: "••••••••••••",
  newPassword: "••••••••••••",
} as const;

export function getFieldInputClassName(params: {
  attempted: boolean;
  hasError: boolean;
  isValid: boolean;
  baseClassName: string;
}) {
  const idle = "border-transparent focus:border-[#00327d] focus:ring-0";
  const invalid =
    "border-[#b7102a] bg-[#fff4f4] text-[#7f1d1d] placeholder:text-[#d78a96] focus:border-[#b7102a] focus:ring-0";
  const valid =
    "border-[#15803d] bg-[#f3fff6] text-[#14532d] placeholder:text-[#76a98a] focus:border-[#15803d] focus:ring-0";

  const stateClass = !params.attempted
    ? idle
    : params.hasError
      ? invalid
      : params.isValid
        ? valid
        : idle;

  return `${params.baseClassName} ${stateClass}`;
}

export function FieldLabel({
  children,
  info,
  invalid = false,
}: {
  children: string;
  info: string;
  invalid?: boolean;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <label
        className={`block text-[11px] font-bold uppercase tracking-[0.2em] ${
          invalid ? "text-[#b7102a]" : "text-gray-400"
        }`}
      >
        {children}
      </label>
      <Tooltip label={info}>
        <button
          type="button"
          className={`inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full transition-colors ${
            invalid ? "text-[#b7102a] hover:text-[#8f0e23]" : "text-gray-400 hover:text-[#00327d]"
          }`}
          aria-label={`${children} requirements`}
        >
          <CircleAlert className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
    </div>
  );
}

export function FieldFeedback({
  attempted,
  errors,
  successLabel,
}: {
  attempted: boolean;
  errors: string[];
  successLabel: string;
}) {
  if (!attempted) {
    return null;
  }

  if (errors.length > 0) {
    return (
      <div className="mt-2 space-y-1">
        {errors.map((error) => (
          <p key={error} className="text-sm text-[#b7102a]">
            {error}
          </p>
        ))}
      </div>
    );
  }

  return (
    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#15803d]">
      <CheckCircle2 className="h-4 w-4" />
      {successLabel}
    </p>
  );
}

export function PasswordInput({
  attempted,
  hasError,
  isValid,
  name,
  value,
  onChange,
  placeholder = INPUT_PLACEHOLDERS.password,
  className,
  required = false,
}: {
  attempted: boolean;
  hasError: boolean;
  isValid: boolean;
  name?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const accentClassName = hasError
    ? "from-[#b7102a] via-[#ff7a7a] to-[#b7102a]"
    : isValid
      ? "from-[#15803d] via-[#6ddf8d] to-[#15803d]"
      : "from-[#00327d] via-[#4e7fd9] to-[#00327d]";
  const showAccent = focused || value.length > 0;

  return (
    <div className="group relative mt-2">
      <input
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={getFieldInputClassName({
          attempted,
          hasError,
          isValid,
          baseClassName: `${className} pr-16`,
        })}
        placeholder={placeholder}
      />
      <motion.button
        type="button"
        onClick={() => setVisible((current) => !current)}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute right-3 top-1/2 inline-flex h-9 min-w-9 cursor-pointer -translate-y-1/2 items-center justify-center overflow-hidden rounded-[14px] border border-black/10 bg-white/95 px-2 text-neutral-600 shadow-[0px_6px_18px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-[border-color,color,box-shadow,transform,background-color] hover:border-black/20 hover:bg-white hover:text-neutral-950 hover:shadow-[0px_10px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00327d]/20 group-focus-within:border-[#00327d]/20"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[4px] bg-[#00327d]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-[4px] top-0 h-[4px] w-[10px] bg-[#b7102a]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-[14px] h-[4px] w-[8px] bg-[#ffdf00]"
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={visible ? "hide" : "show"}
            initial={{ opacity: 0, scale: 0.8, rotate: -8, y: 1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.82, rotate: 8, y: -1 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="relative z-[1] inline-flex items-center justify-center pl-1"
          >
            {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <motion.span
        aria-hidden
        initial={false}
        animate={{
          opacity: showAccent ? 1 : 0,
          scaleX: showAccent ? 1 : 0.72,
          y: focused ? 0 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 32,
          mass: 0.65,
        }}
        className={`pointer-events-none absolute bottom-0 left-3 right-3 h-[2px] origin-center rounded-full bg-gradient-to-r ${accentClassName}`}
      />
    </div>
  );
}
