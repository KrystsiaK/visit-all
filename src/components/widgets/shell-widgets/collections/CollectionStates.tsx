import { ShellCollectionsEmptyWidget } from "@/components/widgets/shell-widgets/ShellCollectionsEmptyWidget";

export const LoadingRows = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-2 pt-0.5 pr-1">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="h-[66px] rounded-xl border border-black/5 bg-white overflow-hidden"
        style={{
          animation: `pulse 1.5s ease-in-out ${index * 0.1}s infinite`
        }}
      >
        <div className="flex items-center gap-3 p-3 h-full">
          {/* Icon skeleton */}
          <div className="h-10 w-10 rounded-lg bg-black/4" />

          {/* Text content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded-full bg-black/6" />
            <div className="h-2.5 w-16 rounded-full bg-black/4" />
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-1">
            <div className="h-6 w-6 rounded-md bg-black/4" />
            <div className="h-6 w-6 rounded-md bg-black/4" />
          </div>
        </div>
      </div>
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
