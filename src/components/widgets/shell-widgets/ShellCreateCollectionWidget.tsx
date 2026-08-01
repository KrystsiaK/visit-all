import { Plus, Upload } from "lucide-react";
import { useRef, useCallback } from "react";
import { ShellActionCtaWidget } from "@/components/widgets/shell-widgets/ShellActionCtaWidget";
import { useCollections } from "@/modules/collections/CollectionsContext";
import { parseCollectionFromJson, parseCollectionFromMd } from "@/modules/collections/export-format";

export const ShellCreateCollectionWidget = () => {
  const { onCreateCollection, onImportCollection, saving } = useCollections();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = file.name.endsWith(".md") ? parseCollectionFromMd(text) : parseCollectionFromJson(text);
      await onImportCollection(data);
    } catch (err) {
      console.error("Import failed:", err);
    }
    e.target.value = "";
  }, [onImportCollection]);

  return (
    <div className="flex flex-col gap-1.5">
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
            <div className="bg-[linear-gradient(135deg,#ff2a1f,#cc0d00)]" />
            <div className="bg-[linear-gradient(135deg,#2544ff,#111cc6)]" />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/10" />
          </div>
        }
        disabled={saving}
        onClick={onCreateCollection}
      />
      <label className="pointer-events-auto flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-black/8 bg-white/70 px-3 text-[9px] font-black uppercase tracking-[0.22em] text-neutral-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-neutral-700">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.md"
          className="hidden"
          onChange={handleFileChange}
          disabled={saving}
        />
        <Upload className="h-3 w-3" />
        Import Layer
      </label>
    </div>
  );
};