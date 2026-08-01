"use client";

import { X } from "lucide-react";
import { BaseShell } from "@synarava/shell-kit";
import { WIDGET_BUILDER_SHELL_GLASS } from "@/modules/shell/constants";
import { useWidgetBuilderSession } from "./useWidgetBuilderSession";
import { WidgetBuilderChat } from "./WidgetBuilderChat";
import { WidgetPreviewSandbox } from "./WidgetPreviewSandbox";
import type { GenerationResult } from "@synarava/widget-generator";

interface WidgetBuilderShellProps {
  isOpen: boolean;
  onClose: () => void;
  onWidgetAccepted: (result: GenerationResult) => Promise<void>;
}

export function WidgetBuilderShell({
  isOpen,
  onClose,
  onWidgetAccepted,
}: WidgetBuilderShellProps) {
  const session = useWidgetBuilderSession(async (result) => {
    await onWidgetAccepted(result);
    onClose();
  });

  const handleClose = () => {
    session.reset();
    onClose();
  };

  return (
    <BaseShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Widget Builder"
      closeLabel="Close widget builder"
      showHeader={false}
      mobileHandle={false}
      placement="top"
      {...WIDGET_BUILDER_SHELL_GLASS}
      shellClassName="fixed inset-0 z-[115] flex flex-col"
      surfaceClassName="relative isolate flex h-full w-full flex-col [contain:paint]"
      contentContainerClassName="flex h-full flex-col overflow-hidden"
      bodyClassName="flex min-h-0 flex-1 flex-col"
      scrollBodyClassName="flex min-h-0 flex-1 flex-col"
      scrollContentClassName="flex min-h-0 flex-1 flex-col"
      childrenClassName="flex min-h-0 flex-1 flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/8 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1122ff] text-white">
            <span className="text-base font-black">✦</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400">
              Synarava
            </p>
            <h2 className="text-base font-black tracking-tight text-neutral-950">
              Widget Builder
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white"
          aria-label="Close widget builder"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Split layout */}
      <div className="flex min-h-0 flex-1 divide-x divide-black/8">
        {/* Left: Chat */}
        <div className="flex w-full flex-col md:w-[42%]">
          <WidgetBuilderChat
            messages={session.messages}
            generating={session.generating}
            error={session.error}
            onSend={(msg) => void session.send(msg)}
          />
        </div>

        {/* Right: Preview (hidden on mobile) */}
        <div className="hidden flex-1 flex-col md:flex">
          <div className="border-b border-black/8 px-5 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400">
              Live Preview
            </p>
          </div>
          <WidgetPreviewSandbox
            result={session.result}
            generating={session.generating}
            accepting={session.accepting}
            onAccept={session.accept}
            onRefine={() => {/* focus chat input */}}
          />
        </div>
      </div>
    </BaseShell>
  );
}
