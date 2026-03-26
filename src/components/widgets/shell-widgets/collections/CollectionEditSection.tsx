import { motion } from "framer-motion";
import { COLLECTION_SWATCHES } from "@/components/widgets/shell-widgets/collections/constants";
import type { CollectionEditSectionProps } from "@/components/widgets/shell-widgets/collections/types";

export const CollectionEditSection = ({
  collection,
  editingCollection,
  saving,
  primaryActionLabel,
  onCollectionColorChange,
  onCollectionDone,
  onRequestDeleteCollection,
}: CollectionEditSectionProps) => (
  <div className="border-t border-black/6 px-4 pb-3.5 pt-3">
    <div className="mb-3">
      <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-neutral-400">COLOR</p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="grid h-7 w-7 shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-lg border border-black/10 shadow-sm">
          <div className="bg-[#ff0000]" />
          <div className="bg-[#ffff00]" />
          <div className="bg-[#0000ff]" />
          <div className="bg-[#f8f6f1]" />
        </div>
        {COLLECTION_SWATCHES.map((swatch) => (
          <motion.button
            key={swatch}
            onClick={() => onCollectionColorChange(swatch)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className={`h-6 w-6 rounded-full border-2 transition-colors duration-150 ${
              editingCollection?.color === swatch ? "border-black ring-2 ring-black/10" : "border-transparent hover:border-black/20"
            }`}
            style={{ backgroundColor: swatch }}
          />
        ))}
        <label className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-dashed border-black/15 transition-colors hover:border-black/30">
          <span className="text-[9px] text-neutral-400">+</span>
          <input
            type="color"
            value={editingCollection?.color ?? "#000000"}
            onChange={(event) => onCollectionColorChange(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
    <div className="flex items-center gap-2 border-t border-black/6 pt-2">
      <button
        onClick={() => void onCollectionDone(collection.id)}
        className="group flex h-9 min-w-0 flex-[1.1] items-center gap-2 rounded-full border border-black/10 bg-white px-2 shadow-sm transition-transform hover:scale-[1.01] hover:border-black/15"
      >
        <div className="flex h-5 w-7 items-center justify-center gap-[3px] rounded-full bg-[#f3f1eb] px-[5px]">
          <span className="h-3 w-[3px] rounded-full bg-[#ff0000]" />
          <span className="h-3 w-[3px] rounded-full bg-[#ffff00]" />
          <span className="h-3 w-[3px] rounded-full bg-[#0000ff]" />
        </div>
        <div className="flex flex-1 items-center justify-center pr-2 text-[9px] font-black uppercase tracking-[0.22em] text-neutral-900">
          {primaryActionLabel}
        </div>
      </button>
      <button
        onClick={() => onRequestDeleteCollection(collection)}
        disabled={saving}
        className="group flex h-9 min-w-0 flex-[0.9] items-center gap-2 rounded-full border border-black/10 bg-white px-2 shadow-sm transition-transform hover:scale-[1.01] hover:border-black/15"
      >
        <div className="flex h-5 w-7 items-center justify-center gap-[3px] rounded-full bg-[#f3f1eb] px-[5px]">
          <span className="h-3 w-[3px] rounded-full bg-[#111111]" />
          <span className="h-3 w-[3px] rounded-full bg-[#ff0000]" />
          <span className="h-3 w-[3px] rounded-full bg-[#ffff00]" />
        </div>
        <div className="flex flex-1 items-center justify-center pr-2 text-[9px] font-black uppercase tracking-[0.22em] text-neutral-900 transition-colors group-hover:text-[#ff0000]">
          Delete
        </div>
      </button>
    </div>
  </div>
);
