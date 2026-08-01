"use client";

import * as React from "react";
import * as ShellKit from "@synarava/shell-kit";
import * as SynaravaUI from "@synarava/ui-kit";
import * as WiringEngine from "@synarava/wiring-engine";
import * as LucideReact from "lucide-react";
import type { BaseWidgetProps } from "@synarava/shell-kit";
import type { ExecutorModules } from "@synarava/widget-generator/executor";

import { WIDGET_GLASS } from "@/modules/shell/constants";
import { useGeneratedWidgetRuntime } from "@/modules/widget-runtime/GeneratedWidgetRuntimeContext";
import { DeleteButton } from "@synarava/ui-kit";

const UI_KIT_MODULE = SynaravaUI as unknown as Record<string, unknown>;

function AppBaseWidget(props: BaseWidgetProps) {
  const runtime = useGeneratedWidgetRuntime();

  const settingsContent = runtime ? (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400">
        AI Widget
      </p>
      {runtime.widget.description && (
        <p className="text-xs text-neutral-600">{runtime.widget.description}</p>
      )}
      <DeleteButton
        eyebrow="Remove Widget"
        title={runtime.widget.name}
        description="This will remove the widget from this shell. You can re-add it from the library."
        confirmLabel="Remove"
        onConfirm={runtime.onArchive}
        className="w-full rounded-xl border border-[#b7102a]/20 bg-[#fff4f4] px-3 py-2 text-left text-xs font-semibold text-[#b7102a] transition-colors hover:bg-[#ffe4e4]"
      >
        Remove widget
      </DeleteButton>
    </div>
  ) : undefined;

  return (
    <ShellKit.BaseWidget
      {...WIDGET_GLASS}
      settingsContent={settingsContent}
      {...props}
    />
  );
}

export const WIDGET_SANDBOX_MODULES: ExecutorModules = {
  react: React as unknown as Record<string, unknown>,
  "@synarava/shell-kit": {
    ...ShellKit,
    BaseWidget: AppBaseWidget,
  },
  "@synarava/ui-kit": UI_KIT_MODULE,
  // Generated widget source is persisted. Keep the retired module id readable
  // while all new generation targets @synarava/ui-kit.
  "@synarava/ui": UI_KIT_MODULE,
  "@synarava/wiring-engine": WiringEngine as unknown as Record<string, unknown>,
  "lucide-react": LucideReact as unknown as Record<string, unknown>,
};
