import { Search, X } from "lucide-react";
import { WidgetFrame } from "@/components/widgets/WidgetFrame";
import { useShellRuntimeActions, useShellRuntimeValue } from "@/components/shells/ShellRuntimeProvider";

export const ShellSearchWidget = () => {
  const collectionQuery = useShellRuntimeValue("collectionQuery", "");
  const { setValue } = useShellRuntimeActions();
  const hasQuery = collectionQuery.trim().length > 0;

  return (
    <WidgetFrame
      className="pointer-events-auto border-black/10 bg-[#f8f6f1]/80"
      bodyClassName="relative flex items-center gap-3"
      title="Search Collections"
      identityVisibility="settings-only"
    >
      <Search className="ml-1 h-4 w-4 text-neutral-400" />
      <input
        type="text"
        value={collectionQuery}
        onChange={(event) => setValue("collectionQuery", event.target.value)}
        placeholder="Search collections..."
        className="min-w-0 flex-1 bg-transparent text-sm font-medium placeholder-neutral-400 outline-none"
      />
      <div className="flex w-10 shrink-0 justify-end">
        {hasQuery ? (
          <button
            type="button"
            onClick={() => setValue("collectionQuery", "")}
            className="flex h-7 min-w-9 items-center justify-center rounded-full border border-black/8 bg-white/65 px-2 text-neutral-500 transition-colors hover:border-black/12 hover:bg-white/85 hover:text-neutral-800"
            aria-label="Clear collection search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </WidgetFrame>
  );
};
