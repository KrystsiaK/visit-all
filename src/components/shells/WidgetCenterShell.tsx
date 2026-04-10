"use client";

import { useMemo, type ReactNode } from "react";
import { Blocks, X } from "lucide-react";

import { ShellHeroCard } from "@/components/shells/ShellHeroCard";
import { type ShellRuntimeState } from "@synarava/shell-kit";
import { SideDockShell } from "@/components/shells/SideDockShell";
import { Tooltip } from "@/components/ui/Tooltip";

interface WidgetCenterShellInnerProps {
  shellId: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  runtimeState?: ShellRuntimeState;
  children: ReactNode;
}

const WidgetCenterShellInner = ({
  shellId,
  isOpen,
  onClose,
  title,
  subtitle,
  runtimeState,
  children,
}: WidgetCenterShellInnerProps) => {
  return (
    <SideDockShell
      shellId={shellId}
      initialState={runtimeState ?? { title, subtitle }}
      runtimeState={{ title, subtitle, ...(runtimeState ?? {}) }}
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      width={376}
      title={title}
      subtitle={subtitle}
      closeLabel="Close widgets"
      closeTooltip="Close Widgets"
      currentHost="widget_center"
      zIndexClassName="z-[90]"
      showHeader={false}
      backdropMode="always"
      pinnedChildren={
        <ShellHeroCard
          dataTestId="widget-center-hero"
          eyebrow="Widgets"
          title={title}
          subtitle={subtitle}
          accent={
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#00327d] text-white">
              <Blocks className="h-6 w-6" />
            </div>
          }
          trailing={
            <Tooltip label="Close Widgets">
              <button
                type="button"
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white"
                aria-label="Close widgets"
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

interface WidgetCenterShellProps {
  shellId: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  runtimeState?: ShellRuntimeState;
  children: ReactNode;
}

export const WidgetCenterShell = ({
  shellId,
  isOpen,
  onClose,
  title,
  subtitle,
  runtimeState,
  children,
}: WidgetCenterShellProps) => {
  const initialState = useMemo(() => runtimeState ?? {}, [runtimeState]);

  return (
      <WidgetCenterShellInner
        shellId={shellId}
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        runtimeState={initialState}
      >
        {children}
      </WidgetCenterShellInner>
  );
};
