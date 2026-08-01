"use client";

import { useState, useRef } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { AutoResizeTextarea } from "@synarava/ui-kit";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { EmojiPicker } from "./EmojiPicker";
import { SlashCommandPalette } from "./SlashCommandPalette";
import type { Message, MessengerTheme } from "../../types";

interface MessageInputProps {
  chat: { type: string };
  activeTheme: MessengerTheme;
  editingMessage: Message | null;
  replyingToMessage: Message | null;
  onSend: (text: string, mediaUrl?: string, mediaType?: "image" | "document") => void;
  onCancelEdit: () => void;
}

export function MessageInput({
  chat,
  activeTheme,
  editingMessage,
  replyingToMessage,
  onSend,
  onCancelEdit,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsFilter, setSuggestionsFilter] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (val: string) => {
    setText(val);
    if (val.startsWith("/")) {
      setSuggestionsFilter(val.split(" ")[0].toLowerCase());
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !selectedImage) return;

    if (editingMessage) {
      onSend(trimmed);
      onCancelEdit();
    } else if (selectedImage) {
      onSend(trimmed || "Image", selectedImage, "image");
      setSelectedImage(null);
    } else {
      onSend(trimmed);
    }
    setText("");
    setShowSuggestions(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const placeholder = editingMessage
    ? "Edit message..."
    : replyingToMessage
      ? "Reply to message..."
      : chat.type === "bot"
        ? "Ask the assistant... (/ for commands)"
        : "Type a message... (/ for commands)";

  return (
    <div className="relative">
      {/* Attachment preview inside input area */}
      {selectedImage && (
        <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-t border-black/8 flex items-center gap-3 z-10 shrink-0">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-black/10 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 cursor-pointer"
              aria-label="Remove attachment"
            >
              ×
            </button>
          </div>
          <span className="text-xs font-bold text-neutral-700">Image ready to send</span>
        </div>
      )}

      {/* Slash commands palette */}
      {showSuggestions && (
        <SlashCommandPalette
          filter={suggestionsFilter}
          onSelect={(cmd) => {
            setText(cmd);
            setShowSuggestions(false);
          }}
        />
      )}

      {/* Emoji picker */}
      {isPickerOpen && (
        <EmojiPicker
          activeTheme={activeTheme}
          onSelect={(emoji) => {
            setText((prev) => prev + emoji);
            setIsPickerOpen(false);
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}

      <LiquidGlassSurface
        variant="frosted-glass"
        tone={activeTheme.glassTone}
        effect="default"
        className="p-3 border-t border-black/8 z-10 flex items-end gap-2.5"
      >
        <input
          type="file"
          ref={fileRef}
          onChange={handleFile}
          accept="image/*"
          className="hidden"
          aria-label="Attach image"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="p-2.5 text-neutral-500 hover:bg-black/5 hover:text-neutral-800 rounded-full transition-all shrink-0 cursor-pointer"
          aria-label="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <div className="flex-1 bg-black/4 border border-black/6 rounded-[22px] px-3.5 py-2 flex items-end gap-2 text-neutral-800 focus-within:bg-white focus-within:border-black/15 focus-within:shadow-xs transition-all">
          <AutoResizeTextarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            rows={1}
            maxHeight={96}
            className="flex-1 bg-transparent border-none outline-none text-sm font-semibold py-0.5 placeholder-neutral-400 no-scrollbar leading-5"
          />
          <button
            type="button"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="p-0.5 text-neutral-500 hover:text-neutral-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Open emoji picker"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleSend}
          className="p-3 text-white rounded-full shadow-md transition-all shrink-0 hover:scale-105 active:scale-95 hover:brightness-110 cursor-pointer"
          style={{ backgroundColor: activeTheme.accentColor }}
          aria-label="Send message"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </LiquidGlassSurface>
    </div>
  );
}
