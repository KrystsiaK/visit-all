import { Plus } from "lucide-react";
import { ShellActionCard } from "@/components/widgets/shell-widgets/actions/ShellActionCard";

interface ShellCreateCollectionWidgetProps {
  onCreateCollection: () => void;
  saving: boolean;
}

export const ShellCreateCollectionWidget = ({
  onCreateCollection,
  saving,
}: ShellCreateCollectionWidgetProps) => (
  <ShellActionCard
    eyebrow="Create"
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
);
