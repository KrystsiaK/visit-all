import { ShellCollectionsEmptyWidget } from "@/components/widgets/shell-widgets/ShellCollectionsEmptyWidget";

export const LoadingRows = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-2 pt-0.5 pr-1">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="h-[66px] rounded-xl border border-black/5 bg-white" />
    ))}
  </div>
);

export const EmptyCollectionsState = () => (
  <div className="flex min-h-0 flex-1">
    <ShellCollectionsEmptyWidget />
  </div>
);

export const EmptySearchState = () => (
  <div className="flex min-h-0 flex-1 items-start">
    <div className="w-full rounded-2xl border border-dashed border-black/10 bg-[#f8f6f1]/78 px-4 py-5 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
        Collections
      </p>
      <p className="mt-3 text-sm font-medium text-neutral-800">
        No collections match this search.
      </p>
    </div>
  </div>
);
