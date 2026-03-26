import { WidgetFrame } from "@/components/widgets/WidgetFrame";

export const ShellCollectionsEmptyWidget = () => (
  <WidgetFrame className="pointer-events-auto" bodyClassName="space-y-3">
    <div className="rounded-2xl border border-dashed border-black/10 bg-[#f8f6f1]/78 px-4 py-5 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
        Layer Stack
      </p>
      <p className="mt-3 text-sm font-medium text-neutral-800">
        No layers yet.
      </p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">
        Create a layer and this shell will keep its shape without jumping.
      </p>
    </div>
  </WidgetFrame>
);
