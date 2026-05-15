"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { Blocks, X } from "lucide-react";

import { ShellRuntimeProvider, useShellRuntimeActions, type ShellRuntimeState, DockedShell, WidgetProvider } from "@synarava/shell-kit";
import { ShellHeroCard } from "@/components/shells/ShellHeroCard";
import { Tooltip } from "@/components/ui/Tooltip";
import { getWidgetHostOptions } from "@/lib/widget-hosts";

const WidgetCenterShellRuntimeBridge = ({ runtimeState }: { runtimeState: ShellRuntimeState }) => {
  const { patchState } = useShellRuntimeActions();
  useEffect(() => { patchState(runtimeState); }, [patchState, runtimeState]);
  return null;
};

interface WidgetCenterShellInnerProps {
  shellId: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  runtimeState: ShellRuntimeState;
  children: ReactNode;
}

const WidgetCenterShellInner = ({ shellId, isOpen, onClose, title, subtitle, runtimeState, children }: WidgetCenterShellInnerProps) => {
  const { registerScrollContainer } = useShellRuntimeActions();
  const hero = (
    <ShellHeroCard
      dataTestId="widget-center-hero"
      eyebrow="Widgets"
      title={title}
      subtitle={subtitle}
      accent={<div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#00327d] text-white"><Blocks className="h-6 w-6" /></div>}
      trailing={
        <Tooltip label="Close Widgets">
          <button type="button" onClick={onClose} className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white" aria-label="Close widgets">
            <X className="h-5 w-5" />
          </button>
        </Tooltip>
      }
    />
  );

  return (
    <>
      <WidgetCenterShellRuntimeBridge runtimeState={{ title, subtitle, ...runtimeState }} />
      <DockedShell
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        closeLabel="Close widgets"
        showHeader={false}
        mobileHandle={false}
        placement="right"
        width={376}
        fullWidthOnMobile
        swipeToClose
        zIndexClassName="z-[90]"
        scrollContainerRef={registerScrollContainer}
        scrollContainerDataId={shellId}
        pinnedContent={hero}
        backdropClassName="fixed inset-0 z-[88] bg-black/14 backdrop-blur-[1px]"
        showBackdrop={true}
      >
        <WidgetProvider currentHost="widget_center" hostOptions={getWidgetHostOptions(["widget_center"])} hostSelectionDisabled>
          {children}
        </WidgetProvider>
      </DockedShell>
    </>
  );
};

interface WidgetCenterShellProps {
  shellId: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  runtimeState?: ShellRuntimeState;
  children: ReactNode;
}

export const WidgetCenterShell = ({ shellId, isOpen, onClose, title, subtitle, runtimeState, children }: WidgetCenterShellProps) => {
  const initialState = useMemo(() => runtimeState ?? {}, [runtimeState]);

  return (
    <ShellRuntimeProvider shellId={shellId} initialState={initialState}>
      <WidgetCenterShellInner shellId={shellId} isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} runtimeState={initialState}>
        {children}
      </WidgetCenterShellInner>
    </ShellRuntimeProvider>
  );
};
