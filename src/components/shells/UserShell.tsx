"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { UserRound, X } from "lucide-react";

import { ShellRuntimeProvider, useShellRuntimeActions, type ShellRuntimeState, DockedShell, WidgetProvider } from "@synarava/shell-kit";
import { ShellHeroCard } from "@/components/shells/ShellHeroCard";
import { Tooltip } from "@/components/ui/Tooltip";
import { getWidgetHostOptions } from "@/lib/widget-hosts";

const UserShellRuntimeBridge = ({ runtimeState }: { runtimeState: ShellRuntimeState }) => {
  const { patchState } = useShellRuntimeActions();
  useEffect(() => { patchState(runtimeState); }, [patchState, runtimeState]);
  return null;
};

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
  const { registerScrollContainer } = useShellRuntimeActions();
  const hero = (
    <ShellHeroCard
      dataTestId="user-shell-hero"
      eyebrow="Account"
      title={title}
      subtitle={subtitle}
      accent={<div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#111111] text-white"><UserRound className="h-6 w-6" /></div>}
      trailing={
        <Tooltip label="Close Account">
          <button type="button" onClick={onClose} className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white" aria-label="Close account shell">
            <X className="h-5 w-5" />
          </button>
        </Tooltip>
      }
    />
  );

  return (
    <>
      <UserShellRuntimeBridge runtimeState={{ title, subtitle }} />
      <DockedShell
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        closeLabel="Close account shell"
        showHeader={false}
        mobileHandle={false}
        placement="right"
        width={376}
        fullWidthOnMobile
        swipeToClose
        zIndexClassName="z-[90]"
        scrollContainerRef={registerScrollContainer}
        scrollContainerDataId="user_shell"
        pinnedContent={hero}
        backdropClassName="fixed inset-0 z-[88] bg-black/14 backdrop-blur-[1px]"
        showBackdrop={true}
      >
        <WidgetProvider currentHost="user_shell" hostOptions={getWidgetHostOptions(["user_shell"])} hostSelectionDisabled>
          {children}
        </WidgetProvider>
      </DockedShell>
    </>
  );
};

export function UserShell({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode; }) {
  const initialState = useMemo(() => ({ title: "Account", subtitle: "Your identity, verification, and session controls." }), []);

  return (
    <ShellRuntimeProvider shellId="user_shell" initialState={initialState}>
      <UserShellInner isOpen={isOpen} onClose={onClose} title={initialState.title} subtitle={initialState.subtitle}>
        {children}
      </UserShellInner>
    </ShellRuntimeProvider>
  );
}
