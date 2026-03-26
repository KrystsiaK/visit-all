"use client";

import { MapPin, Sparkles } from "lucide-react";

import { WidgetChrome } from "@/components/widgets/WidgetChrome";
import type { WidgetInstanceRecord } from "@/lib/widgets";

interface GlobalOverviewWidgetCardProps {
  widget: WidgetInstanceRecord;
}

export const GlobalOverviewWidgetCard = ({
  widget,
}: GlobalOverviewWidgetCardProps) => (
  <WidgetChrome
    title={widget.name}
    subtitle="Shared system overview for the active map workspace."
    accent={
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1122ff] text-white">
        <MapPin className="h-4 w-4" />
      </div>
    }
  >
    <div className="rounded-2xl bg-white/45 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
        Global Signal
      </p>
      <p className="mt-3 text-sm leading-6 text-neutral-700">
        This widget is framework-native and lives in the widget center shell. It is the baseline
        pattern for global widgets that can observe shared app surfaces.
      </p>
    </div>

    <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/45 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffe94d] text-black">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium text-neutral-700">Global widget active</span>
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
        Live
      </span>
    </div>
  </WidgetChrome>
);
