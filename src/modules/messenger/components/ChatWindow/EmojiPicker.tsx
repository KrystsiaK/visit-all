"use client";

import { X } from "lucide-react";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import type { MessengerTheme } from "../../types";

const EMOJI_CATEGORIES = [
  {
    title: "Smileys",
    emojis: ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😜","🤫","🤔","🙄","😬","😴","😎","🥳","💩","🔥","✨"],
  },
  {
    title: "Gestures",
    emojis: ["👍","👎","👊","✊","🤛","🤜","🤞","✌️","🤟","🤘","👌","🤏","👈","👉","👆","👇","☝️","👋","✍️","👏","🙌","👐","🤲","🙏","💪"],
  },
  {
    title: "Hearts & Fun",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","🎉","🎈","🎁","🏆","👑","🌟","⭐","⚡"],
  },
];

interface EmojiPickerProps {
  activeTheme: MessengerTheme;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ activeTheme, onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="absolute bottom-20 right-4 z-40">
      <LiquidGlassSurface
        variant="frosted-glass"
        tone={activeTheme.glassTone}
        effect="amplified"
        className="w-72 h-80 rounded-[24px] shadow-lg border border-black/8 flex flex-col overflow-hidden bg-white/60"
      >
        <div className="px-4 py-2.5 border-b border-black/8 bg-white/40 flex items-center justify-between shrink-0">
          <span className="text-xs font-black text-neutral-800 uppercase tracking-wider">
            Emoji Picker
          </span>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800 cursor-pointer transition-colors"
            aria-label="Close emoji picker"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {EMOJI_CATEGORIES.map((cat) => (
            <div key={cat.title} className="space-y-1.5">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wide block">
                {cat.title}
              </span>
              <div className="grid grid-cols-7 gap-1">
                {cat.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onSelect(emoji)}
                    className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </LiquidGlassSurface>
    </div>
  );
}
