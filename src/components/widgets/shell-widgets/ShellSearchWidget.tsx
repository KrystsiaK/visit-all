import { WIDGET_GLASS } from "@/modules/shell/constants";
import { useState, type PointerEvent } from "react";
import { BaseWidget } from "@synarava/shell-kit";
import { usePortEmitter } from "@synarava/wiring-engine";
import { SearchInput } from "@synarava/ui-kit";

interface ShellSearchWidgetProps {
  draggable?: boolean;
  onDragHandlePointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
}

export const ShellSearchWidget = ({
  draggable = false,
  onDragHandlePointerDown,
}: ShellSearchWidgetProps) => {
  const [collectionQuery, setCollectionQuery] = useState("");
  usePortEmitter("shell_search", "query_out", collectionQuery);

  return (
    <BaseWidget {...WIDGET_GLASS}
      dataTestId="shell-search-widget"
      className="pointer-events-auto"
      bodyClassName="relative flex items-center gap-3"
      contentPaddingClassName="px-4 py-3"
      draggable={draggable}
      onDragHandlePointerDown={onDragHandlePointerDown}
    >
      <SearchInput
        value={collectionQuery}
        onChange={setCollectionQuery}
        placeholder="Search collections..."
      />
    </BaseWidget>
  );
};
