"use client";

import { type KeyboardEvent } from "react";

import { cn } from "@/components/ui/utils";

interface InlineEditableTextProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  readOnlyClassName?: string;
  emptyFallback?: string;
  editable?: boolean;
  onChange: (value: string) => void;
  onCommit?: () => Promise<void> | void;
}

export function InlineEditableText({
  value,
  placeholder,
  disabled = false,
  autoFocus = false,
  className,
  inputClassName,
  readOnlyClassName,
  emptyFallback,
  editable = true,
  onChange,
  onCommit,
}: InlineEditableTextProps) {
  const commit = () => {
    void onCommit?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    event.currentTarget.blur();
  };

  if (!editable) {
    return (
      <div className={cn(className, readOnlyClassName)}>
        {value || emptyFallback || placeholder || ""}
      </div>
    );
  }

  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      className={cn(className, inputClassName)}
    />
  );
}
