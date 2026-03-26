"use client";

import { motion } from "framer-motion";

import { overlayItemVariants } from "@/lib/motion";

export const EntityOverlaySkeletonCard = ({
  emphasis = "default",
}: {
  emphasis?: "default" | "hero";
}) => (
  <motion.div
    variants={overlayItemVariants}
    className={`overflow-hidden rounded-2xl border border-black/10 bg-white/50 p-[17px] shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl ${
      emphasis === "hero" ? "min-h-[288px]" : "min-h-[168px]"
    }`}
  >
    <div className="animate-pulse">
      <div className="h-8 w-8 rounded-xl bg-black/8" />
      {emphasis === "hero" ? <div className="mt-4 h-32 rounded-xl bg-black/6" /> : null}
      <div className="mt-4 h-4 w-32 rounded-full bg-black/8" />
      <div className="mt-3 h-3 w-24 rounded-full bg-black/6" />
      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="h-24 rounded-xl bg-black/6" />
        <div className="h-24 rounded-xl bg-black/6" />
      </div>
      <div className="mt-4 h-28 rounded-xl bg-black/6" />
    </div>
  </motion.div>
);

export const EntityOverlayEmptyState = () => (
  <motion.div
    variants={overlayItemVariants}
    className="rounded-2xl border border-black/10 bg-white/50 p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl"
  >
    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
      Widgets Ready
    </p>
    <h3 className="mt-3 text-xl font-semibold tracking-tight text-neutral-900">
      Panel loaded cleanly
    </h3>
    <p className="mt-3 text-sm leading-6 text-neutral-600">
      This entity has no active cards yet, so the panel stays stable instead of popping in empty sections.
    </p>
  </motion.div>
);
