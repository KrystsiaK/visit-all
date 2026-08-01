// src/modules/messenger/components/ChatThreadPanel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, CornerDownRight } from "lucide-react";
import { UserAvatarBadge, AutoResizeTextarea } from "@synarava/ui-kit";
import { BaseShell } from "@synarava/shell-kit";
import type { Message, MessengerTheme } from "../types";
import { SlackBlockKitRenderer } from "./SlackBlockKitRenderer";

interface ChatThreadPanelProps {
  isOpen: boolean;
  parentMessage: Message;
  replies: Message[];
  onSendReply: (content: string) => void;
  onClose: () => void;
  currentUserId: string;
  activeTheme: MessengerTheme;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

export function ChatThreadPanel({
  isOpen,
  parentMessage,
  replies,
  onSendReply,
  onClose,
  currentUserId,
  activeTheme,
  onToggleReaction,
  onDeleteMessage
}: ChatThreadPanelProps) {
  const [inputText, setInputText] = useState("");
  const repliesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendReply(inputText);
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.content.startsWith('{"blocks":')) {
      return (
        <SlackBlockKitRenderer 
          content={msg.content} 
          onAction={(actionId, val) => {
            onSendReply(`/action ${actionId} ${val}`);
          }} 
          accentColor={activeTheme.accentColor} 
        />
      );
    }
    return <p className="text-sm font-medium leading-5 whitespace-pre-wrap">{msg.content}</p>;
  };

  return (
    <BaseShell
      isOpen={isOpen}
      onClose={onClose}
      title="Thread"
      closeLabel="Close"
      placement="right"
      showBackdrop={false}
      showHeader={false}
      mobileHandle={false}
      glassVariant="soft-glass"
      glassTone={activeTheme.glassTone}
      glassEffect="default"
      shellClassName="fixed top-0 bottom-0 right-0 z-40 w-80 md:w-[360px] h-full flex flex-col overflow-hidden border-l border-black/8"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-black/8 flex items-center justify-between bg-black/4 shrink-0">
        <div className="flex items-center gap-1.5">
          <CornerDownRight className="w-4 h-4 text-neutral-600" />
          <span className="text-xs font-black uppercase tracking-wider text-neutral-800">Thread</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-full text-neutral-500 hover:text-neutral-800 transition-colors"
          title="Close Thread"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Root (Parent) Message */}
      <div className="p-4 bg-black/2 border-b border-black/5 shrink-0">
        <div className="flex items-start gap-2.5">
          <UserAvatarBadge styleId={parentMessage.senderAvatarStyle} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-neutral-800">{parentMessage.senderName}</span>
              <span className="text-[9px] text-neutral-400 font-bold">{formatTime(parentMessage.created_at)}</span>
            </div>
            <div className="mt-1 text-neutral-800 font-medium">
              {renderMessageContent(parentMessage)}
            </div>
          </div>
        </div>
      </div>

      {/* Thread Replies List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar bg-black/1">
        {replies.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <span className="text-xs font-bold italic block">No replies yet</span>
            <span className="text-[10px] block mt-1">Start the conversation below!</span>
          </div>
        ) : (
          replies.map((reply) => {
            const isOwn = reply.senderId === currentUserId;
            return (
              <div key={reply.id} className="flex gap-2.5 items-start">
                <UserAvatarBadge styleId={reply.senderAvatarStyle} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-neutral-800">{reply.senderName}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-neutral-400 font-bold">{formatTime(reply.created_at)}</span>
                      {isOwn && (
                        <button
                          onClick={() => onDeleteMessage(reply.id)}
                          className="text-[9px] text-red-500 hover:text-red-700 font-bold opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 bg-white/70 dark:bg-black/10 rounded-2xl rounded-tl-none p-2.5 shadow-xs border border-black/4">
                    {renderMessageContent(reply)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={repliesEndRef} />
      </div>

      {/* Thread Input Area */}
      <div className="p-3 border-t border-black/8 bg-black/3 flex items-end gap-2 shrink-0">
        <div className="flex-1 bg-white/95 dark:bg-black/20 border border-black/8 rounded-2xl px-3 py-1.5 flex items-end text-neutral-800 focus-within:border-black/15 transition-all">
          <AutoResizeTextarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Reply to thread..."
            rows={1}
            maxHeight={64}
            className="flex-1 bg-transparent border-none outline-none text-xs font-semibold py-0.5 placeholder-neutral-400 no-scrollbar leading-4"
          />
        </div>
        <button
          onClick={handleSend}
          className="p-2.5 text-white rounded-full shadow-sm hover:brightness-110 active:scale-95 transition-all shrink-0"
          style={{ backgroundColor: activeTheme.accentColor }}
          title="Send Reply"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </BaseShell>
  );
}
