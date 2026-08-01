"use client";

import { X, CornerUpLeft, Pencil } from "lucide-react";
import type { Message, MessengerTheme } from "../../types";

interface ReplyBannerProps {
  message: Message;
  activeTheme: MessengerTheme;
  onClear: () => void;
}

export function ReplyBanner({ message, activeTheme, onClear }: ReplyBannerProps) {
  return (
    <div className="px-4 py-2.5 bg-white/90 backdrop-blur-md border-t border-black/8 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-2 text-neutral-800 min-w-0">
        <CornerUpLeft className="w-4 h-4 shrink-0" style={{ color: activeTheme.accentColor }} />
        <div className="min-w-0">
          <span
            className="text-[10px] font-black uppercase tracking-wider block leading-none"
            style={{ color: activeTheme.accentColor }}
          >
            Replying to {message.senderName}
          </span>
          <p className="text-xs text-neutral-500 truncate max-w-md mt-0.5">{message.content}</p>
        </div>
      </div>
      <button
        onClick={onClear}
        className="p-1 hover:bg-black/5 rounded-full text-neutral-500 transition-colors cursor-pointer shrink-0"
        aria-label="Cancel reply"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface EditBannerProps {
  message: Message;
  activeTheme: MessengerTheme;
  onClear: () => void;
}

export function EditBanner({ message, activeTheme, onClear }: EditBannerProps) {
  return (
    <div className="px-4 py-2.5 bg-white/90 backdrop-blur-md border-t border-black/8 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-2 text-neutral-800 min-w-0">
        <Pencil className="w-4 h-4 shrink-0" style={{ color: activeTheme.accentColor }} />
        <div className="min-w-0">
          <span
            className="text-[10px] font-black uppercase tracking-wider block leading-none"
            style={{ color: activeTheme.accentColor }}
          >
            Editing Message
          </span>
          <p className="text-xs text-neutral-500 truncate max-w-md mt-0.5">{message.content}</p>
        </div>
      </div>
      <button
        onClick={onClear}
        className="p-1 hover:bg-black/5 rounded-full text-neutral-500 transition-colors cursor-pointer shrink-0"
        aria-label="Cancel edit"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface AttachmentPreviewProps {
  src: string;
  onRemove: () => void;
}

export function AttachmentPreview({ src, onRemove }: AttachmentPreviewProps) {
  return (
    <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-t border-black/8 flex items-center gap-3 z-10 shrink-0">
      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-black/10 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Attachment preview" className="w-full h-full object-cover" />
        <button
          onClick={onRemove}
          className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 cursor-pointer"
          aria-label="Remove attachment"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1">
        <span className="text-xs font-bold text-neutral-800">Image to send</span>
        <p className="text-[10px] text-neutral-400 mt-0.5">Sent along with the message text</p>
      </div>
    </div>
  );
}
