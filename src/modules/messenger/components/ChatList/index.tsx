"use client";

import { useState, useMemo } from "react";
import { Settings, Users, Radio, Bot, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "@synarava/ui-kit";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { ChatListItem } from "./ChatListItem";
import { ChatListSkeleton } from "./ChatListSkeleton";
import type { Chat, MessengerTheme } from "../../types";

type FilterTab = "all" | "personal" | "groups" | "channels" | "bots";

const TABS: { id: FilterTab; Icon: React.ComponentType<any>; label: string }[] = [
  { id: "all", Icon: Users, label: "All" },
  { id: "personal", Icon: User, label: "DMs" },
  { id: "groups", Icon: Users, label: "Groups" },
  { id: "channels", Icon: Radio, label: "Channels" },
  { id: "bots", Icon: Bot, label: "Bots" },
];

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  loading?: boolean;
  onSelectChat: (id: string) => void;
  onOpenSettings: () => void;
  currentUserId: string;
  activeTheme: MessengerTheme;
}

export function ChatList({
  chats,
  selectedChatId,
  loading = false,
  onSelectChat,
  onOpenSettings,
  currentUserId,
  activeTheme,
}: ChatListProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    return chats.filter((chat) => {
      const name =
        chat.type === "direct"
          ? chat.participants.find((p) => p.id !== currentUserId)?.displayName || "Saved Messages"
          : chat.name || "Chat";
      if (!name.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeTab === "personal") return chat.type === "direct";
      if (activeTab === "groups") return chat.type === "group";
      if (activeTab === "channels") return chat.type === "channel";
      if (activeTab === "bots") return chat.type === "bot";
      return true;
    });
  }, [chats, search, activeTab, currentUserId]);

  const totalUnread = chats.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <LiquidGlassSurface
      variant="frosted-glass"
      tone={activeTheme.glassTone}
      effect="amplified"
      className="h-full flex flex-col rounded-none border-r border-black/8 bg-white/60"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 border border-black/10 text-neutral-600 hover:text-neutral-900 hover:bg-white transition-colors shadow-xs cursor-pointer"
              aria-label="Back to app"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-neutral-900 leading-none">
                Messages
              </h2>
              {totalUnread > 0 && (
                <span className="text-[10px] font-black text-neutral-500">
                  {totalUnread} unread
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 border border-black/10 text-neutral-600 hover:text-neutral-900 hover:bg-white transition-colors shadow-xs cursor-pointer"
            aria-label="Open settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <SearchInput
          value={search}
          onChange={(val: any) => setSearch(typeof val === "string" ? val : val?.target?.value ?? "")}
          placeholder="Search conversations..."
          className="w-full"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0.5 px-2 pb-2 shrink-0 overflow-x-auto no-scrollbar">
        {TABS.map(({ id, Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? "text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-black/5"
              }`}
              style={active ? { backgroundColor: activeTheme.accentColor } : undefined}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
        {loading ? (
          <ChatListSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-neutral-300" />
            </div>
            <p className="text-xs font-black text-neutral-400 uppercase tracking-wider">
              {search ? "No results" : "No conversations"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === selectedChatId}
                currentUserId={currentUserId}
                activeTheme={activeTheme}
                onSelect={onSelectChat}
              />
            ))}
          </div>
        )}
      </div>
    </LiquidGlassSurface>
  );
}
