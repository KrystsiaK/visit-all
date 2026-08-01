// src/modules/messenger/components/ChatList.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, Settings, Users, Radio, MessageSquare, Bot, User, CheckCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UserAvatarBadge, SearchInput } from "@synarava/ui-kit";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import type { Chat, MessengerTheme } from "../types";

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenSettings: () => void;
  currentUserId: string;
  activeTheme: MessengerTheme;
}

type FilterTab = "all" | "personal" | "groups" | "channels" | "bots";

export function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onOpenSettings,
  currentUserId,
  activeTheme
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      // 1. Filter by search query
      let name = chat.name;
      if (chat.type === "direct") {
        const otherParticipant = chat.participants.find((p) => p.id !== currentUserId);
        name = otherParticipant ? otherParticipant.displayName : "Saved Messages";
      }
      name = name || "Chat";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Filter by tab type
      if (activeTab === "all") return true;
      if (activeTab === "personal") return chat.type === "direct";
      if (activeTab === "groups") return chat.type === "group";
      if (activeTab === "channels") return chat.type === "channel";
      if (activeTab === "bots") return chat.type === "bot";
      return true;
    });
  }, [chats, searchQuery, activeTab, currentUserId]);

  const getChatDetails = (chat: Chat) => {
    let title = chat.name;
    let avatarStyle = chat.avatarUrl || "mondrian-primary";
    let customStatus = null;

    if (chat.type === "direct") {
      const otherParticipant = chat.participants.find((p) => p.id !== currentUserId);
      title = otherParticipant ? (otherParticipant.displayName || "Direct Chat") : "Saved Messages";
      avatarStyle = otherParticipant ? (otherParticipant.avatarStyle || "mondrian-primary") : "glass-translucent";
      customStatus = otherParticipant?.customStatus || null;
    }

    return { title, avatarStyle, customStatus };
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const getTabIcon = (tab: FilterTab) => {
    switch (tab) {
      case "all": return <MessageSquare className="w-3.5 h-3.5" />;
      case "personal": return <User className="w-3.5 h-3.5" />;
      case "groups": return <Users className="w-3.5 h-3.5" />;
      case "channels": return <Radio className="w-3.5 h-3.5" />;
      case "bots": return <Bot className="w-3.5 h-3.5" />;
    }
  };

  return (
    <LiquidGlassSurface 
      variant="soft-glass" 
      tone={activeTheme.glassTone} 
      effect="default"
      className="flex flex-col h-full border-r border-black/8 w-80 md:w-[340px] shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 rounded-full hover:bg-black/5 text-neutral-600 hover:text-neutral-900 transition-colors mr-0.5"
            title="Back to Map"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xl font-black tracking-tight text-neutral-950 uppercase">Chats</span>
          <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: activeTheme.accentColor }}>
            {chats.reduce((acc, c) => acc + c.unreadCount, 0)}
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-black/5 text-neutral-600 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-2">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search chats..."
          className="bg-black/4 border border-black/6 rounded-2xl px-3 py-2 text-neutral-800 focus-within:bg-white focus-within:border-black/15 transition-all duration-200"
        />
      </div>

      {/* Filter Tabs */}
      <div className="px-2 py-1.5 flex gap-1 overflow-x-auto no-scrollbar">
        {(["all", "personal", "groups", "channels", "bots"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
              activeTab === tab
                ? "text-white shadow-sm"
                : "text-neutral-500 hover:bg-black/4 hover:text-neutral-800"
            }`}
            style={activeTab === tab ? { backgroundColor: activeTheme.accentColor } : undefined}
          >
            {getTabIcon(tab)}
            {tab}
          </button>
        ))}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 flex flex-col gap-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
            <MessageSquare className="w-8 h-8 opacity-30 mb-2" />
            <p className="text-xs font-medium">No chats found</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const { title, avatarStyle, customStatus } = getChatDetails(chat);
            const isSelected = selectedChatId === chat.id;

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                  isSelected
                    ? "bg-[#111111] text-white shadow-md"
                    : "hover:bg-black/4 text-neutral-800"
                }`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  <UserAvatarBadge styleId={avatarStyle} size="md" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm truncate flex items-center gap-1.5">
                      <span className="truncate">{title}</span>
                      {customStatus && (
                        <span className="text-xs shrink-0 select-none text-neutral-800" title={customStatus}>
                          {customStatus.split(" ")[0]}
                        </span>
                      )}
                    </span>
                    <span className={`text-[10px] shrink-0 font-medium ${isSelected ? "text-white/60" : "text-neutral-400"}`}>
                      {chat.lastMessage ? formatTime(chat.lastMessage.created_at) : ""}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className={`text-xs truncate ${isSelected ? "text-white/70" : "text-neutral-500"}`}>
                      {chat.lastMessage ? (
                        <>
                          {chat.lastMessage.senderName && chat.type !== "direct" && (
                            <span className="font-semibold mr-1">{chat.lastMessage.senderName}:</span>
                          )}
                          {chat.lastMessage.content}
                        </>
                      ) : (
                        <span className="italic">No messages yet</span>
                      )}
                    </p>

                    {chat.unreadCount > 0 ? (
                      <span className="text-white text-[10px] font-bold h-5 min-w-5 px-1 flex items-center justify-center rounded-full shrink-0 shadow-sm" style={{ backgroundColor: activeTheme.accentColor }}>
                        {chat.unreadCount}
                      </span>
                    ) : chat.lastMessage?.senderName === "Demo Curator" ? (
                      <CheckCheck 
                        className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white/60" : ""}`} 
                        style={!isSelected ? { color: activeTheme.accentColor } : undefined}
                      />
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </LiquidGlassSurface>
  );
}
