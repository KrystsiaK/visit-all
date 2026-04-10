"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { EntityMediaItemRecord } from "@/app/actions";

interface MediaLightboxProps {
  open: boolean;
  mediaItems: EntityMediaItemRecord[];
  activeIndex: number;
  entityTitle: string;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export function MediaLightbox({
  open,
  mediaItems,
  activeIndex,
  entityTitle,
  onClose,
  onChangeIndex,
}: MediaLightboxProps) {
  const activeItem = mediaItems[activeIndex] ?? null;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < mediaItems.length - 1;

  return (
    <AnimatePresence>
      {open && activeItem ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${entityTitle} gallery viewer`}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/88 p-6 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close gallery viewer"
            className="absolute inset-0"
            onClick={onClose}
          />

          <div className="relative z-[1] flex h-full w-full max-w-6xl flex-col">
            <div className="flex items-center justify-between px-2 pb-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">
                  Gallery
                </p>
                <p className="mt-2 truncate text-sm text-white/80">
                  {activeItem.caption || `${entityTitle} image ${activeIndex + 1}`}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-white transition-colors hover:bg-white/12"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              {canGoPrev ? (
                <button
                  type="button"
                  onClick={() => onChangeIndex(activeIndex - 1)}
                  className="absolute left-0 z-[2] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white transition-colors hover:bg-white/16"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : null}

              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, scale: 0.985, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: 10 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto flex h-full max-h-[78vh] w-full items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.publicUrl}
                  alt={activeItem.caption || `${entityTitle} image ${activeIndex + 1}`}
                  className="max-h-full max-w-full rounded-[28px] object-contain shadow-[0px_30px_90px_rgba(0,0,0,0.45)]"
                />
              </motion.div>

              {canGoNext ? (
                <button
                  type="button"
                  onClick={() => onChangeIndex(activeIndex + 1)}
                  className="absolute right-0 z-[2] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white transition-colors hover:bg-white/16"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : null}
            </div>

            {mediaItems.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto pb-1">
                {mediaItems.map((item, index) => {
                  const selected = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onChangeIndex(index)}
                      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border transition-all ${
                        selected
                          ? "border-white/70 shadow-[0px_10px_24px_rgba(255,255,255,0.14)]"
                          : "border-white/12 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.publicUrl}
                        alt={item.caption || `${entityTitle} thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
