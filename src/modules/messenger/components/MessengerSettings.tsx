// src/modules/messenger/components/MessengerSettings.tsx
"use client";

import { useState } from "react";
import { X, Palette, User, Settings, Info, Check } from "lucide-react";
import { UserAvatarBadge, PrimaryButton, OutlineButton } from "@synarava/ui-kit";
import { BaseShell } from "@synarava/shell-kit";
import { type MessengerTheme, MESSENGER_THEMES } from "../types";

interface MessengerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    displayName: string | null;
    avatarStyle: string | null;
    email: string;
    customStatus?: string | null;
  };
  onSaveProfile: (name: string, avatar: string, status?: string | null) => void;
  activeTheme: MessengerTheme;
  onSelectTheme: (theme: MessengerTheme) => void;
}

const AVATAR_PRESETS = [
  "mondrian-primary",
  "mondrian-accent",
  "mondrian-muted",
  "bot-accent",
  "glass-translucent",
  "glass-frosted"
];

export function MessengerSettings({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  activeTheme,
  onSelectTheme
}: MessengerSettingsProps) {
  const [name, setName] = useState(userProfile.displayName || "Curator");
  const [avatar, setAvatar] = useState(userProfile.avatarStyle || "mondrian-primary");
  const [status, setStatus] = useState(userProfile.customStatus || "");

  const handleSave = () => {
    onSaveProfile(name, avatar, status || null);
    onClose();
  };

  return (
    <BaseShell 
      isOpen={isOpen} 
      onClose={onClose}
      title="Settings"
      closeLabel="Close"
      placement="left"
      showBackdrop={false}
      showHeader={false}
      mobileHandle={false}
      glassVariant="soft-glass" 
      glassTone={activeTheme.glassTone} 
      glassEffect="default"
      shellClassName="fixed top-0 bottom-0 left-0 z-40 w-80 md:w-[340px] h-full flex flex-col overflow-hidden border-r border-black/8"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-black/6 bg-white/40 shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-neutral-800" />
          <span className="font-black text-sm text-neutral-900 uppercase tracking-wider">Settings</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 text-neutral-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* Profile Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Profile Info
          </h3>

          <div className="flex flex-col items-center py-2">
            <UserAvatarBadge styleId={avatar} size="lg" />
            <span className="text-[10px] text-neutral-400 font-medium mt-1">{userProfile.email}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wide">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/4 border border-black/8 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:bg-white focus:border-black/15 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wide">Custom Status (Emoji + Text)</label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="e.g. 🍔 Lunch, 🌴 Vacation"
              className="w-full bg-black/4 border border-black/8 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:bg-white focus:border-black/15 transition-all"
            />
          </div>
        </div>

        {/* Avatar Presets */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wide block">Avatar Style</label>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAvatar(preset)}
                className={`relative flex items-center justify-center p-2 rounded-xl border-2 transition-all ${
                  avatar === preset
                    ? "border-black bg-white"
                    : "border-transparent bg-black/4 hover:bg-black/8"
                }`}
              >
                <UserAvatarBadge styleId={preset} size="sm" />
                {avatar === preset && (
                  <span className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5 border border-[#f8f6f1]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="space-y-4 pt-2 border-t border-black/6">
          <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Beautiful Themes
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {MESSENGER_THEMES.map((theme) => {
              const isActive = theme.id === activeTheme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectTheme(theme)}
                  className={`group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all ${
                    isActive 
                      ? "border-neutral-900 bg-white/70 shadow-sm" 
                      : "border-transparent bg-black/4 hover:bg-black/8 hover:scale-[1.02]"
                  }`}
                >
                  {/* Theme Wallpaper Preview */}
                  <div 
                    className="h-16 w-full relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300"
                    style={{ background: theme.wallpaper }}
                  >
                    {/* Pattern Overlay simulation */}
                    <div 
                      className="absolute inset-0 opacity-[0.08]"
                      style={{
                        backgroundImage: theme.pattern === "radial-dot" 
                          ? `radial-gradient(circle, #000 1px, transparent 1px)`
                          : theme.pattern === "grid"
                          ? `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`
                          : theme.pattern === "cyber-grid"
                          ? `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`
                          : theme.pattern === "hex"
                          ? `radial-gradient(circle, #000 1.5px, transparent 1.5px)`
                          : `radial-gradient(circle, #f43f5e 1px, transparent 1px)`,
                        backgroundSize: "8px 8px"
                      }}
                    />
                    
                    {/* Mock Chat bubbles preview */}
                    <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 pointer-events-none scale-75 origin-bottom-left">
                      <div className="bg-white/90 text-[6px] px-1.5 py-0.5 rounded-md max-w-[70%] font-semibold text-neutral-800 shadow-xs">
                        Hello!
                      </div>
                      <div 
                        className="text-[6px] px-1.5 py-0.5 rounded-md max-w-[70%] self-end font-semibold text-white shadow-xs"
                        style={{ backgroundColor: theme.accentColor }}
                      >
                        How is it going?
                      </div>
                    </div>

                    {isActive && (
                      <div className="absolute top-2 right-2 bg-neutral-950 text-white rounded-full p-0.5 border border-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  
                  {/* Theme Label */}
                  <div className="p-2 flex items-center justify-between gap-1.5 w-full bg-white/30 backdrop-blur-xs">
                    <span className="text-[10px] font-black text-neutral-800 truncate">
                      {theme.name}
                    </span>
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Info */}
        <div className="pt-4 border-t border-black/6 space-y-2 text-[10px] text-neutral-400">
          <div className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span className="font-extrabold uppercase tracking-wide">Antigravity Messenger</span>
          </div>
          <p className="leading-4">Version 1.0.0 (Next.js 16 Module). Designed for modularity and high performance.</p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white/40 border-t border-black/6 grid grid-cols-2 gap-2 shrink-0">
        <OutlineButton
          onClick={onClose}
          fullWidth={true}
          className="rounded-xl py-2 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider border border-black/8 text-neutral-800"
        >
          Cancel
        </OutlineButton>
        <PrimaryButton
          onClick={handleSave}
          fullWidth={true}
          color={activeTheme.accentColor}
          className="rounded-xl py-2 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white"
        >
          Save Details
        </PrimaryButton>
      </div>
    </BaseShell>
  );
}
