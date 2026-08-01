"use client";

import { useMemo } from "react";
import { Search, Phone, Video, ChevronRight } from "lucide-react";
import { UserAvatarBadge } from "@synarava/ui-kit";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import type { Chat, MessengerTheme } from "../../types";

interface ChatHeaderProps {
  chat: Chat;
  currentUserId: string;
  isProfileOpen: boolean;
  isTyping: boolean;
  activeTheme: MessengerTheme;
  onToggleProfile: () => void;
}

export function ChatHeader({
  chat,
  currentUserId,
  isProfileOpen,
  isTyping,
  activeTheme,
  onToggleProfile,
}: ChatHeaderProps) {
  const title = useMemo(() => {
    if (chat.type === "direct") {
      const other = chat.participants.find((p) => p.id !== currentUserId);
      return other?.displayName || "Direct Chat";
    }
    return chat.name || "Group Chat";
  }, [chat, currentUserId]);

  const subtitle = useMemo(() => {
    if (chat.type === "bot") return "bot assistant";
    if (chat.type === "channel") return "news channel";
    if (chat.type === "group") return `${chat.participants.length} members`;
    const other = chat.participants.find((p) => p.id !== currentUserId);
    if (!other) return "saved messages";
    return other.status === "active" ? "online" : "offline";
  }, [chat, currentUserId]);

  const directStatus = useMemo(() => {
    if (chat.type !== "direct") return null;
    const other = chat.participants.find((p) => p.id !== currentUserId);
    return other?.customStatus ?? null;
  }, [chat, currentUserId]);

  const avatarStyle = useMemo(() => {
    if (chat.type === "direct") {
      const other = chat.participants.find((p) => p.id !== currentUserId);
      return other?.avatarStyle || "mondrian-primary";
    }
    return chat.avatarUrl || "mondrian-accent";
  }, [chat, currentUserId]);

  return (
    <LiquidGlassSurface
      variant="frosted-glass"
      tone={activeTheme.glassTone}
      effect="default"
      className="h-16 px-4 flex items-center justify-between border-b border-black/8 z-10 shadow-sm shrink-0"
    >
      <button
        onClick={onToggleProfile}
        className="flex items-center gap-3 text-left hover:bg-black/4 p-1.5 rounded-2xl transition-all cursor-pointer"
        aria-label={`View profile for ${title}`}
      >
        <UserAvatarBadge styleId={avatarStyle} size="md" />
        <div>
          <h3 className="font-extrabold text-sm text-neutral-900 leading-tight flex items-center gap-1.5">
            <span>{title}</span>
            {directStatus && (
              <span className="text-xs bg-black/5 px-1.5 py-0.5 rounded-full font-bold shadow-2xs">
                {directStatus}
              </span>
            )}
          </h3>
          <span
            className="text-[10px] font-bold"
            style={{ color: subtitle === "online" ? activeTheme.accentColor : "#737373" }}
          >
            {isTyping ? "typing..." : subtitle}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-1 text-neutral-600">
        <button
          className="p-2 hover:bg-black/5 rounded-full transition-all cursor-pointer"
          aria-label="Search in conversation"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:bg-black/5 rounded-full transition-all cursor-pointer"
          aria-label="Voice call"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:bg-black/5 rounded-full transition-all cursor-pointer"
          aria-label="Video call"
        >
          <Video className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-black/10 mx-1" />
        <button
          onClick={onToggleProfile}
          className={`p-2 rounded-full transition-all cursor-pointer ${
            isProfileOpen ? "bg-[#111111] text-white" : "hover:bg-black/5"
          }`}
          aria-label={isProfileOpen ? "Close info panel" : "Open info panel"}
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform ${isProfileOpen ? "" : "rotate-180"}`}
          />
        </button>
      </div>
    </LiquidGlassSurface>
  );
}
