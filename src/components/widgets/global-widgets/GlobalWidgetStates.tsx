"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { overlayItemVariants } from "@/lib/motion";

export const GlobalWidgetCenterAddCard = ({
  onOpenLibrary,
}: {
  onOpenLibrary: () => void;
}) => (
  <motion.div
    variants={overlayItemVariants}
    className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl"
  >
    <button
      type="button"
      onClick={onOpenLibrary}
      className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white/60 px-5 text-base font-medium text-[#171717] transition-colors hover:bg-white"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1122ff] text-white">
        <Plus className="h-5 w-5" />
      </span>
      <span>Add Widget</span>
    </button>
  </motion.div>
);

export const GlobalWidgetCenterEmptyState = () => (
  <motion.div
    variants={overlayItemVariants}
    className="rounded-2xl border border-black/10 bg-white/50 p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl"
  >
    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
      Shell Status
    </p>
    <h3 className="mt-3 text-xl font-semibold tracking-tight text-neutral-900">
      No global widgets yet
    </h3>
    <p className="mt-3 text-sm leading-6 text-neutral-600">
      Add a widget from the shared library to make this shell useful.
    </p>
  </motion.div>
);
