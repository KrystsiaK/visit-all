"use client";

import { UserAvatarBadge } from "@synarava/ui-kit";
import type { Chat, MessengerTheme } from "../../types";

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  currentUserId: string;
  activeTheme: MessengerTheme;
  onSelect: (id: string) => void;
}

function formatTime(str: string): string {
  try {
    const d = new Date(str);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function ChatListItem({
  chat,
  isSelected,
  currentUserId,
  activeTheme,
  onSelect,
}: ChatListItemProps) {
  const avatarStyle =
    chat.type === "direct"
      ? chat.participants.find((p) => p.id !== currentUserId)?.avatarStyle || "mondrian-primary"
      : chat.avatarUrl || "mondrian-accent";

  const title =
    chat.type === "direct"
      ? chat.participants.find((p) => p.id !== currentUserId)?.displayName || "Direct Chat"
      : chat.name || "Group Chat";

  const subtitle = chat.lastMessage
    ? chat.lastMessage.senderName
      ? `${chat.lastMessage.senderName}: ${chat.lastMessage.content}`
      : chat.lastMessage.content
    : "No messages yet";

  const isOnline =
    chat.type === "direct" &&
    chat.participants.find((p) => p.id !== currentUserId)?.status === "active";

  return (
    <button
      onClick={() => onSelect(chat.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer group ${
        isSelected ? "bg-white/70 shadow-xs" : "hover:bg-white/40"
      }`}
    >
      {/* Avatar with online dot */}
      <div className="relative shrink-0">
        <UserAvatarBadge styleId={avatarStyle} size="md" />
        {isOnline && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white/80"
            style={{ backgroundColor: activeTheme.accentColor }}
          />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`text-sm truncate leading-tight ${
              isSelected ? "font-black text-neutral-900" : "font-bold text-neutral-800"
            }`}
          >
            {title}
          </span>
          {chat.lastMessage && (
            <span className="text-[10px] text-neutral-400 font-medium shrink-0">
              {formatTime(chat.lastMessage.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className="text-[11px] text-neutral-500 truncate leading-tight font-medium">
            {subtitle.replace(/^[\s\S]*?"content":\s*"([^"]+)".*$/, "$1").slice(0, 60)}
          </p>
          {chat.unreadCount > 0 && (
            <span
              className="shrink-0 min-w-[18px] h-[18px] rounded-full text-[10px] font-black text-white flex items-center justify-center px-1"
              style={{ backgroundColor: activeTheme.accentColor }}
            >
              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
