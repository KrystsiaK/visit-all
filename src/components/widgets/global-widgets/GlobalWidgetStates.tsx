"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";

import { Plus } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";

export const GlobalWidgetCenterAddCard = ({
  onOpenLibrary,
}: {
  onOpenLibrary: () => void;
}) => (
  <BaseWidget {...WIDGET_GLASS}>
    <button
      type="button"
      onClick={onOpenLibrary}
      className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white/60 px-5 text-base font-medium text-[#171717] transition-colors hover:bg-white"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1122ff] text-white">
        <Plus className="h-5 w-5" />
      </span>
      <span>Add Widget</span>
    </button>
  </BaseWidget>
);

export const GlobalWidgetCenterEmptyState = () => (
  <BaseWidget {...WIDGET_GLASS} eyebrow="Shell Status" title="No global widgets yet">
    <p className="text-sm leading-6 text-neutral-600">
      Add a widget from the shared library to make this shell useful.
    </p>
  </BaseWidget>
);