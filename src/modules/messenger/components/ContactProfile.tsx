// src/modules/messenger/components/ContactProfile.tsx
"use client";

import { useState, useMemo } from "react";
import { X, Bell, BellOff, Image as ImageIcon, FileText, Link2, Info } from "lucide-react";
import { UserAvatarBadge } from "@synarava/ui-kit";
import { BaseShell } from "@synarava/shell-kit";
import type { Chat, MessengerTheme } from "../types";

interface ContactProfileProps {
  isOpen: boolean;
  chat: Chat;
  onClose: () => void;
  currentUserId: string;
  activeTheme: MessengerTheme;
}

type TabType = "media" | "files" | "links";

export function ContactProfile({
  isOpen,
  chat,
  onClose,
  currentUserId,
  activeTheme
}: ContactProfileProps) {
  const [muted, setMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("media");

  const otherParticipant = useMemo(() => {
    if (chat.type === "direct" || chat.type === "bot") {
      return chat.participants.find((p) => p.id !== currentUserId) || null;
    }
    return null;
  }, [chat, currentUserId]);

  const title = useMemo(() => {
    if (chat.type === "direct") return otherParticipant ? (otherParticipant.displayName || "Direct Chat") : "Saved Messages";
    return chat.name || "Group Chat";
  }, [chat, otherParticipant]);

  const avatarStyle = useMemo(() => {
    if (chat.type === "direct") return otherParticipant ? (otherParticipant.avatarStyle || "mondrian-primary") : "glass-translucent";
    return chat.avatarUrl || "mondrian-accent";
  }, [chat, otherParticipant]);

  const infoSection = useMemo(() => {
    if (chat.type === "bot") {
      return {
        email: "@antigravity_bot",
        phone: "AI Helper Integration",
        bio: "AI helper bot for Visit All navigation. Ask it about 'maps', 'traces', or 'signals'."
      };
    }
    if (chat.type === "channel") {
      return {
        email: "@visitall_announcements",
        phone: "Official Channel",
        bio: "News and updates channel. Official announcements from the development team are published here."
      };
    }
    if (chat.type === "group") {
      return {
        email: `@curators_club_group`,
        phone: "Group Chat",
        bio: "Community of curators and cartographers. Discussing geolocations, interesting places, and widgets."
      };
    }

    // Direct chat
    if (!otherParticipant) {
      return {
        email: "Personal Cloud",
        phone: "Storage",
        bio: "Your personal space for storing notes, media files, drafts, and links inside Visit All."
      };
    }

    return {
      email: otherParticipant.email || "@username",
      phone: "+375 (29) 111-22-33",
      bio: "Visit All user. Cartography and coordination of new collections."
    };
  }, [chat.type, otherParticipant]);


  return (
    <BaseShell 
      isOpen={isOpen} 
      onClose={onClose}
      title="User Info"
      closeLabel="Close"
      placement="right"
      showBackdrop={false}
      showHeader={false}
      mobileHandle={false}
      glassVariant="soft-glass" 
      glassTone={activeTheme.glassTone} 
      glassEffect="default"
      shellClassName="fixed top-0 bottom-0 right-0 z-40 w-80 h-full flex flex-col overflow-hidden border-l border-black/8"
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-black/8 bg-white/40 shrink-0">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-neutral-600" />
          <span className="font-extrabold text-sm text-neutral-900">User Info</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 text-neutral-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Info */}
      <div className="flex flex-col items-center text-center p-6 border-b border-black/8 shrink-0">
        <UserAvatarBadge styleId={avatarStyle} size="lg" />
        <h2 className="mt-3 text-lg font-black text-neutral-950 tracking-tight">{title}</h2>
        <span className="text-xs text-neutral-500 mt-0.5">{infoSection.email}</span>

        {/* Action Button */}
        <button 
          onClick={() => setMuted(!muted)}
          className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            muted 
              ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" 
              : "bg-black/5 text-neutral-800 hover:bg-black/8"
          }`}
        >
          {muted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          {muted ? "Unmute Notifications" : "Mute Notifications"}
        </button>
      </div>

      {/* Details List */}
      <div className="px-6 py-4 flex flex-col gap-4 border-b border-black/8 text-sm shrink-0">
        <div>
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Bio</span>
          <p className="text-neutral-800 font-medium mt-1 leading-5">{infoSection.bio}</p>
        </div>
        <div>
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Phone</span>
          <p className="text-neutral-800 font-bold mt-0.5">{infoSection.phone}</p>
        </div>
      </div>

      {/* Shared Tabs */}
      <div className="flex border-b border-black/8 bg-white/20 shrink-0">
        {(["media", "files", "links"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all relative ${
              activeTab === tab ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <span className="capitalize">{tab}</span>
            {activeTab === tab && (
              <span 
                className="absolute bottom-0 left-0 right-0 h-[2px]" 
                style={{ backgroundColor: activeTheme.accentColor }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === "media" && (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-neutral-200 rounded-lg overflow-hidden border border-black/5 shadow-xs relative group cursor-pointer">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "files" && (
          <div className="flex flex-col gap-2">
            {[
              { name: "visit_all_guidelines.pdf", size: "2.4 MB" },
              { name: "minsk_coordinates.json", size: "48 KB" }
            ].map((file, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/4 transition-colors cursor-pointer">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-800 truncate">{file.name}</p>
                  <span className="text-[10px] text-neutral-450">{file.size}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "links" && (
          <div className="flex flex-col gap-2">
            {[
              { label: "Protomaps Vector Server", url: "https://protomaps.com" },
              { label: "MapLibre Style Docs", url: "https://maplibre.org/style-spec" }
            ].map((link, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/4 transition-colors cursor-pointer">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Link2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-800 truncate">{link.label}</p>
                  <a href={link.url} target="_blank" rel="noreferrer" className="text-[10px] text-[#2f6bff] truncate block hover:underline">
                    {link.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseShell>
  );
}
