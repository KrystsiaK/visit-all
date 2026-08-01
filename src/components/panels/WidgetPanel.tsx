"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";

import { useEffect, useMemo, useState } from "react";
import { Blocks, Search, X } from "lucide-react";

import {
  BaseWidget,
  BaseShell,
  ShellRuntimeProvider,
  useShellRuntimeActions,
  WidgetProvider,
  ShellSlot,
} from "@synarava/shell-kit";
import { Tooltip } from "@synarava/ui-kit";
import { GlobalWidgetLibraryCard } from "@/components/widgets/global-widgets/GlobalWidgetLibraryCard";
import { saveGeneratedWidget } from "@/app/actions";
import {
  GlobalWidgetCenterEmptyState,
} from "@/components/widgets/global-widgets/GlobalWidgetStates";
import { useGlobalWidgetBindings } from "@/components/widgets/global-widgets/useGlobalWidgetBindings";
import { getWidgetHostOptions } from "@/modules/shell/widget-hosts";
import { GLOBAL_WIDGET_REGISTRY } from "@/modules/shell/widget-manifest";
import { SHELL_GLASS } from "@/modules/shell/constants";
import { SHELL_PANEL_CONTENT_LAYOUT, SHELL_PANEL_STYLE } from "@/modules/shell/constants";
import { WidgetErrorBoundary } from "@/components/errors/WidgetErrorBoundary";
import { CurrentWidgetProvider } from "@/modules/entity/EntityContext";
import { WidgetBuilderShell } from "@/modules/widget-builder/WidgetBuilderShell";
import { GeneratedWidgetLibraryCard } from "@/components/widgets/global-widgets/GeneratedWidgetLibraryCard";
import { GeneratedWidgetSlot } from "@/modules/widget-runtime/GeneratedWidgetSlot";
import type { WidgetEntityType } from "@/lib/widgets";
import type { GenerationResult } from "@synarava/widget-generator";
import { useWidgetLibrary } from "@/modules/widget-library/WidgetLibraryContext";

interface WidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLibraryMutation?: () => void;
  entityType?: WidgetEntityType;
  entityId?: string;
}

const CENTER_TITLE = "Widget Center";
const LIBRARY_TITLE = "Widget Library";
const LIBRARY_SUBTITLE = "Choose widgets and connect them to shells";

function WidgetCenterContent({
  isOpen,
  onClose,
  subtitle,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { registerScrollContainer } = useShellRuntimeActions();

  const hero = (
    <BaseWidget {...WIDGET_GLASS}
      dataTestId="widget-center-hero"
      eyebrow="Widgets"
      title={CENTER_TITLE}
      subtitle={subtitle}
      identityVisibility="settings-only"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#00327d] text-white">
          <Blocks className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">Widgets</p>
          <h2 className="mt-1 truncate text-[16px] font-black tracking-tight text-neutral-950">{CENTER_TITLE}</h2>
          <p className="mt-1 truncate text-sm leading-5 text-[#737373]">{subtitle}</p>
        </div>
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
      </div>
    </BaseWidget>
  );

  return (
    <BaseShell
      isOpen={isOpen}
      onClose={onClose}
      title={CENTER_TITLE}
      subtitle={subtitle}
      closeLabel="Close widgets"
      showHeader={false}
      mobileHandle={false}
      placement="right"
      swipeToClose
      {...SHELL_GLASS}
      shellClassName="fixed bottom-3 left-3 right-3 top-3 z-[90] flex max-w-[calc(100vw-1.5rem)] flex-col md:left-auto md:w-[var(--shell-panel-width)]"
      shellStyle={SHELL_PANEL_STYLE}
      {...SHELL_PANEL_CONTENT_LAYOUT}
      scrollContainerRef={registerScrollContainer}
      scrollContainerDataId="widget_center_shell"
      pinnedContent={hero}
    >
      <WidgetProvider
        currentHost="widget_center"
        hostOptions={getWidgetHostOptions(["widget_center"])}
        hostSelectionDisabled
      >
        {children}
      </WidgetProvider>
    </BaseShell>
  );
}

function WidgetLibraryContent({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { registerScrollContainer, getScrollContainer } = useShellRuntimeActions();

  useEffect(() => {
    if (!isOpen) return;
    getScrollContainer()?.scrollTo({ top: 0 });
  }, [getScrollContainer, isOpen]);

  return (
    <BaseShell
      isOpen={isOpen}
      onClose={onClose}
      title="Add Widgets"
      subtitle="Choose a widget from the shared library and decide where it should live."
      closeLabel="Close widget library"
      {...SHELL_GLASS}
      shellClassName="fixed inset-3 z-[97] md:inset-6"
      scrollContainerRef={registerScrollContainer}
      scrollContainerDataId="widget_library_shell"
    >
      {isOpen ? children : null}
    </BaseShell>
  );
}

export const WidgetPanel = ({
  isOpen,
  onClose,
  onLibraryMutation,
  entityType,
  entityId,
}: WidgetPanelProps) => {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const { generatedWidgets, refresh: refreshWidgetLibrary, notifyChanged } = useWidgetLibrary();

  const {
    widgets,
    definitions,
    loading,
    libraryOpen,
    addingSlug,
    draggedWidgetId,
    handleSlotPointerDown,
    setLibraryOpen,
    handleAddWidgetFromLibrary,
  } = useGlobalWidgetBindings({ isOpen, entityType, entityId });

  const handleWidgetAccepted = async (result: GenerationResult) => {
    const targetHosts = result.meta.targetHost ? [result.meta.targetHost] : [];
    await saveGeneratedWidget({
      widgetKey: result.meta.key,
      name: result.meta.name,
      description: result.meta.description,
      componentCode: result.componentCode,
      ports: result.meta.ports,
      targetHosts,
      chatHistory: [],
    });
    await refreshWidgetLibrary();
    notifyChanged();
    onLibraryMutation?.();
  };

  const normalizedQuery = libraryQuery.trim().toLocaleLowerCase();
  const filteredDefinitions = useMemo(() => {
    if (!normalizedQuery) return definitions;
    return definitions.filter((definition) =>
      [
        definition.name,
        definition.slug,
        definition.componentKey,
        definition.layer,
        definition.placementSummary,
        definition.supportedEntityTypes.join(" "),
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    );
  }, [definitions, normalizedQuery]);
  const filteredGeneratedWidgets = useMemo(() => {
    if (!normalizedQuery) return generatedWidgets;
    return generatedWidgets.filter((widget) =>
      [widget.name, widget.widgetKey, widget.description ?? "", ...widget.ports.map((port) => port.label)]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    );
  }, [generatedWidgets, normalizedQuery]);

  const centerInitialState = useMemo(() => ({ title: CENTER_TITLE, subtitle: "" }), []);
  const libraryInitialState = useMemo(() => ({ title: LIBRARY_TITLE, subtitle: LIBRARY_SUBTITLE }), []);
  const subtitle = loading ? "Loading widgets..." : `${widgets.length} active widgets`;

  return (
    <>
      <ShellRuntimeProvider shellId="widget_center_shell" initialState={centerInitialState}>
        <WidgetCenterContent isOpen={isOpen} onClose={onClose} subtitle={subtitle}>
          {/* Primary: Create Widget with AI */}
          <BaseWidget {...WIDGET_GLASS}>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setBuilderOpen(true)}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#1122ff] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0011ee]"
              >
                <span className="text-base">✦</span>
                <span>Create Widget with AI</span>
              </button>
              <button
                type="button"
                onClick={() => setLibraryOpen(true)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/60 px-5 text-sm font-medium text-neutral-700 transition-colors hover:bg-white"
              >
                Add from Library
              </button>
            </div>
          </BaseWidget>

          {widgets.length === 0 && generatedWidgets.length === 0 && !loading ? <GlobalWidgetCenterEmptyState /> : null}

          {widgets.map((widget) => {
            const Component = GLOBAL_WIDGET_REGISTRY[widget.componentKey];
            if (!Component) return null;

            return (
              <ShellSlot
                key={widget.id}
                widgetId={widget.id}
                isDragging={draggedWidgetId === widget.id}
                onHandlePointerDown={(event) => handleSlotPointerDown(event, widget.id)}
              >
                <WidgetErrorBoundary>
                  <CurrentWidgetProvider value={widget}>
                    <Component />
                  </CurrentWidgetProvider>
                </WidgetErrorBoundary>
              </ShellSlot>
            );
          })}

          {generatedWidgets.slice(0, 5).map((widget) => (
            <GeneratedWidgetSlot
              key={widget.id}
              widget={widget}
              host="widget_center"
              isDragging={draggedWidgetId === widget.id}
              onHandlePointerDown={(event) => handleSlotPointerDown(event, widget.id)}
              onRemoved={() => { void refreshWidgetLibrary(); notifyChanged(); }}
            />
          ))}
        </WidgetCenterContent>
      </ShellRuntimeProvider>

      <WidgetBuilderShell
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onWidgetAccepted={handleWidgetAccepted}
      />

      <ShellRuntimeProvider shellId="widget_library_shell" initialState={libraryInitialState}>
        <WidgetLibraryContent isOpen={isOpen && libraryOpen} onClose={() => setLibraryOpen(false)}>
          <div className="sticky top-0 z-40 mb-5 rounded-[24px] border border-black/10 bg-white/82 p-3 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white/75 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                value={libraryQuery}
                onChange={(event) => setLibraryQuery(event.target.value)}
                placeholder="Search widgets by name, purpose, shell, or signal..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
                aria-label="Search widget library"
              />
              {libraryQuery ? (
                <button
                  type="button"
                  onClick={() => setLibraryQuery("")}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-800"
                  aria-label="Clear widget search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <p className="mt-2 px-1 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
              {filteredDefinitions.length + filteredGeneratedWidgets.length} widgets · live interactive previews
            </p>
          </div>

          <div className="grid items-start gap-x-5 gap-y-7 lg:grid-cols-2">
            {filteredGeneratedWidgets.map((widget) => (
              <GeneratedWidgetLibraryCard
                key={widget.id}
                widget={widget}
                onPlaced={() => { void refreshWidgetLibrary(); notifyChanged(); }}
              />
            ))}
            {filteredDefinitions.map((definition) => (
              <GlobalWidgetLibraryCard
                key={definition.id}
                definition={definition}
                onAdd={(slug, hosts) => void handleAddWidgetFromLibrary(slug, hosts, onLibraryMutation)}
                adding={addingSlug === definition.slug}
              />
            ))}
          </div>
          {filteredDefinitions.length === 0 && filteredGeneratedWidgets.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-center">
              <div>
                <p className="text-base font-semibold text-neutral-900">No widgets found</p>
                <p className="mt-1 text-sm text-neutral-500">Try a capability, shell, signal, or widget name.</p>
              </div>
            </div>
          ) : null}
        </WidgetLibraryContent>
      </ShellRuntimeProvider>
    </>
  );
};
