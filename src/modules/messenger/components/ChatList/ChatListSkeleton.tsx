"use client";

export function ChatListSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-2 py-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-2xl">
          <div className="w-11 h-11 rounded-2xl bg-black/8 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3 bg-black/8 rounded-full w-3/4" />
            <div className="h-2.5 bg-black/5 rounded-full w-1/2" />
          </div>
          <div className="shrink-0 space-y-1.5 items-end flex flex-col">
            <div className="h-2 bg-black/5 rounded-full w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}
