import { Plus } from "lucide-react";
import { ShellActionCtaWidget, shellActionPaneGlassOverlay } from "@/components/widgets/shell-widgets/ShellActionCtaWidget";

interface ShellCreateCollectionWidgetProps {
  onCreateCollection: () => void;
  saving: boolean;
}

export const ShellCreateCollectionWidget = ({
  onCreateCollection,
  saving,
}: ShellCreateCollectionWidgetProps) => {
  return (
    <ShellActionCtaWidget
      tone="cream"
      icon={<Plus className="h-7 w-7 text-black" strokeWidth={2.5} />}
      colorPaneWidthClassName="w-[34px]"
      iconPaneWidthClassName="w-[34px]"
      iconPaneClassName="bg-[linear-gradient(180deg,#fff05a,#f2d51a)]"
      titlePaneClassName="px-4"
      title={
        <span className="block max-w-full truncate whitespace-nowrap text-[15px] font-black uppercase leading-none tracking-[-0.03em] text-neutral-950">
          New Layer
        </span>
      }
      colorBars={
        <div className="grid h-full grid-rows-2">
          <div className="relative bg-[linear-gradient(135deg,#ff2a1f,#cc0d00)]">
            <div className="absolute inset-0" style={{ background: shellActionPaneGlassOverlay }} />
          </div>
          <div className="relative bg-[linear-gradient(135deg,#2544ff,#111cc6)]">
            <div className="absolute inset-0" style={{ background: shellActionPaneGlassOverlay }} />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/10" />
        </div>
      }
      disabled={saving}
      onClick={onCreateCollection}
    />
  );
};
