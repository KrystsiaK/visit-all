"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";

import { useMemo } from "react";
import { UserRound, X } from "lucide-react";

import {
  BaseWidget,
  BaseShell,
  ShellRuntimeProvider,
  useShellRuntimeActions,
  WidgetProvider,
  ShellSlot,
} from "@synarava/shell-kit";
import { Tooltip } from "@synarava/ui-kit";
import { getWidgetHostOptions } from "@/modules/shell/widget-hosts";
import { SHELL_GLASS } from "@/modules/shell/constants";
import { SHELL_PANEL_CONTENT_LAYOUT, SHELL_PANEL_STYLE } from "@/modules/shell/constants";
import { defaultUserShellConfig } from "@/modules/shell/types";
import {
  USER_WIDGET_MANIFEST,
  USER_WIDGET_REGISTRY,
  WIDGET_MANIFEST,
  WIDGET_REGISTRY,
} from "@/modules/shell/widget-manifest";
import { WidgetErrorBoundary } from "@/components/errors/WidgetErrorBoundary";
import { CurrentWidgetProvider } from "@/modules/entity/EntityContext";
import { UserShellProvider, useUserShellData } from "@/contexts/user-shell-context";
import { useUserShellBindings } from "@/components/widgets/user-widgets/useUserShellBindings";
import { useGeneratedWidgetsForHost } from "@/modules/widget-runtime/useGeneratedWidgetsForHost";
import { GeneratedWidgetSlot } from "@/modules/widget-runtime/GeneratedWidgetSlot";
import { notifyWidgetLibraryChanged } from "@/modules/widget-runtime/notifyWidgetLibraryChanged";
import type { WidgetInstanceRecord } from "@/lib/widgets";
import type { UserProfileViewModel } from "@/components/widgets/user-widgets/UserProfileWidgetCard";

interface UserShellPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileChange?: (profile: UserProfileViewModel) => void;
}

const TITLE = "Account";
const SUBTITLE = "Your identity, verification, and session controls.";

// Reads from UserShellProvider + ShellRuntimeProvider — must be rendered inside both.
function UserShellContent({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { registerScrollContainer } = useShellRuntimeActions();
  const { loading, previewWidgets, draggedWidgetId, handleSlotPointerDown } = useUserShellData();
  const generatedWidgets = useGeneratedWidgetsForHost("user_shell", isOpen);

  const hero = (
    <BaseWidget {...WIDGET_GLASS}
      dataTestId="user-shell-hero"
      eyebrow="Account"
      title={TITLE}
      subtitle={SUBTITLE}
      identityVisibility="settings-only"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#111111] text-white">
          <UserRound className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">Account</p>
          <h2 className="mt-1 truncate text-[16px] font-black tracking-tight text-neutral-950">{TITLE}</h2>
          <p className="mt-1 truncate text-sm leading-5 text-[#737373]">{SUBTITLE}</p>
        </div>
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
      </div>
    </BaseWidget>
  );

  return (
    <BaseShell
      isOpen={isOpen}
      onClose={onClose}
      title={TITLE}
      subtitle={SUBTITLE}
      closeLabel="Close account shell"
      showHeader={false}
      mobileHandle={false}
      placement={defaultUserShellConfig.placement}
      swipeToClose
      {...SHELL_GLASS}
      shellClassName="fixed bottom-3 left-3 right-3 top-3 z-[90] flex max-w-[calc(100vw-1.5rem)] flex-col md:left-auto md:w-[var(--shell-panel-width)]"
      shellStyle={SHELL_PANEL_STYLE}
      {...SHELL_PANEL_CONTENT_LAYOUT}
      scrollContainerRef={registerScrollContainer}
      scrollContainerDataId="user_shell"
      pinnedContent={hero}
    >
      <WidgetProvider
        currentHost="user_shell"
        hostOptions={getWidgetHostOptions(["user_shell"])}
        hostSelectionDisabled
      >
        {loading ? (
          <>
            <BaseWidget {...WIDGET_GLASS}><div className="animate-pulse h-48 rounded-xl bg-black/6" /></BaseWidget>
            <BaseWidget {...WIDGET_GLASS}><div className="animate-pulse h-60 rounded-xl bg-black/6" /></BaseWidget>
          </>
        ) : (
          <>
          {previewWidgets.map((widget: WidgetInstanceRecord) => {
            const Component =
              USER_WIDGET_REGISTRY[widget.componentKey] ??
              WIDGET_REGISTRY[widget.componentKey];

            const manifestEntry =
              USER_WIDGET_MANIFEST[widget.componentKey] ??
              WIDGET_MANIFEST[widget.componentKey];

            if (!Component) return null;

            return (
              <ShellSlot
                key={widget.id}
                widgetId={widget.id}
                isDragging={draggedWidgetId === widget.id}
                hideHandle={manifestEntry?.hideHandle}
                onHandlePointerDown={(e) => handleSlotPointerDown(e, widget.id)}
              >
                <WidgetErrorBoundary>
                  <CurrentWidgetProvider value={widget}>
                    <Component />
                  </CurrentWidgetProvider>
                </WidgetErrorBoundary>
              </ShellSlot>
            );
          })}
          {generatedWidgets.map((widget) => (
            <GeneratedWidgetSlot
              key={widget.id}
              widget={widget}
              host="user_shell"
              onRemoved={notifyWidgetLibraryChanged}
            />
          ))}
          </>
        )}
      </WidgetProvider>
    </BaseShell>
  );
}

export function UserShellPanel({ isOpen, onClose, onProfileChange }: UserShellPanelProps) {
  const bindings = useUserShellBindings({ isOpen, onProfileChange });
  const initialState = useMemo(() => ({ title: TITLE, subtitle: SUBTITLE }), []);

  return (
    <UserShellProvider {...bindings}>
      <ShellRuntimeProvider shellId="user_shell" initialState={initialState}>
        <UserShellContent isOpen={isOpen} onClose={onClose} />
      </ShellRuntimeProvider>
    </UserShellProvider>
  );
}
