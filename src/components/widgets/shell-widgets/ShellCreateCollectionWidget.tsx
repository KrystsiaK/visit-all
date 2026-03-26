import { Plus } from "lucide-react";
import { WidgetChrome } from "@/components/widgets/WidgetChrome";
import { WidgetActionBody } from "@/components/widgets/WidgetActionBody";

interface ShellCreateCollectionWidgetProps {
  onCreateCollection: () => void;
  saving: boolean;
}

export const ShellCreateCollectionWidget = ({
  onCreateCollection,
  saving,
}: ShellCreateCollectionWidgetProps) => (
  <WidgetChrome
    eyebrow="Create"
    title="New Layer"
    identityVisibility="settings-only"
    className="pointer-events-auto border-black/20 bg-[#f8f6f1]/92 shadow-[0px_10px_28px_rgba(0,0,0,0.14)]"
    bodyClassName="p-0"
    contentPaddingClassName="p-0"
  >
    <WidgetActionBody
      title="New Layer"
      icon={<Plus className="h-6 w-6 text-black" />}
      colorBars={
        <div className="flex h-full flex-col">
          <div className="flex-1 bg-[#ff0000]" />
          <div className="flex-1 bg-[#0000ff]" />
        </div>
      }
      iconPaneClassName="bg-[#ffff00]"
      disabled={saving}
      onClick={onCreateCollection}
    />
  </WidgetChrome>
);
