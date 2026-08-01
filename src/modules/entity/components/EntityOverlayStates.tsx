"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";

import { BaseWidget } from "@synarava/shell-kit";

export const EntityOverlaySkeletonCard = ({
  emphasis = "default",
}: {
  emphasis?: "default" | "hero";
}) => (
  <BaseWidget {...WIDGET_GLASS}>
    <div className="animate-pulse">
      <div className="h-8 w-8 rounded-xl bg-black/8" />
      {emphasis === "hero" ? <div className="mt-4 h-32 rounded-xl bg-black/6" /> : null}
      <div className="mt-4 h-4 w-32 rounded-full bg-black/8" />
      <div className="mt-3 h-3 w-24 rounded-full bg-black/6" />
      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="h-24 rounded-xl bg-black/6" />
        <div className="h-24 rounded-xl bg-black/6" />
      </div>
      <div className="mt-4 h-28 rounded-xl bg-black/6" />
    </div>
  </BaseWidget>
);

export const EntityOverlayEmptyState = () => (
  <BaseWidget {...WIDGET_GLASS} eyebrow="Widgets Ready" title="Panel loaded cleanly">
    <p className="text-sm leading-6 text-neutral-600">
      This entity has no active cards yet, so the panel stays stable instead of popping in empty sections.
    </p>
  </BaseWidget>
);