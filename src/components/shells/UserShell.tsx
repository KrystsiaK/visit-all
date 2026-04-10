"use client";

import { useMemo, type ReactNode } from "react";
import { UserRound, X } from "lucide-react";

import { ShellHeroCard } from "@/components/shells/ShellHeroCard";
import { SideDockShell } from "@/components/shells/SideDockShell";
import { Tooltip } from "@/components/ui/Tooltip";

const UserShellInner = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}) => {
  return (
    <SideDockShell
      shellId="user_shell"
      initialState={{ title, subtitle }}
      runtimeState={{ title, subtitle }}
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      width={376}
      title={title}
      subtitle={subtitle}
      closeLabel="Close account shell"
      closeTooltip="Close Account"
      currentHost="user_shell"
      zIndexClassName="z-[90]"
      showHeader={false}
      backdropMode="always"
      pinnedChildren={
        <ShellHeroCard
          dataTestId="user-shell-hero"
          eyebrow="Account"
          title={title}
          subtitle={subtitle}
          accent={
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#111111] text-white">
              <UserRound className="h-6 w-6" />
            </div>
          }
          trailing={
            <Tooltip label="Close Account">
              <button
                type="button"
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white"
                aria-label="Close account shell"
              >
                <X className="h-5 w-5" />
              </button>
            </Tooltip>
          }
        />
      }
    >
      {children}
    </SideDockShell>
  );
};

export function UserShell({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const initialState = useMemo(
    () => ({
      title: "Account",
      subtitle: "Your identity, verification, and session controls.",
    }),
    []
  );

  return (
      <UserShellInner
        isOpen={isOpen}
        onClose={onClose}
        title={initialState.title}
        subtitle={initialState.subtitle}
      >
        {children}
      </UserShellInner>
  );
}
