"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import type { Chat, Message, MessengerTheme } from "../../types";

interface MessageListProps {
  chat: Chat;
  messages: Message[];
  currentUserId: string;
  isTyping: boolean;
  activeTheme: MessengerTheme;
  onReaction: (id: string, emoji: string) => void;
  onReply: (msg: Message) => void;
  onOpenThread: (id: string) => void;
  onEdit: (msg: Message) => void;
  onDeleteRequest: (id: string) => void;
  onBlockKitAction: (actionId: string, val: string, msgId: string) => void;
}

export function MessageList({
  chat,
  messages,
  currentUserId,
  isTyping,
  activeTheme,
  onReaction,
  onReply,
  onOpenThread,
  onEdit,
  onDeleteRequest,
  onBlockKitAction,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const grouped = useMemo(() => {
    const result: Record<string, Message[]> = {};
    const root = messages.filter((m) => m.replyToId === null);
    root.forEach((msg) => {
      try {
        const label = new Date(msg.created_at).toLocaleDateString([], {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        (result[label] ??= []).push(msg);
      } catch {
        (result["Unknown Date"] ??= []).push(msg);
      }
    });
    return result;
  }, [messages]);

  const scrollTo = (id: string) => {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar z-10 relative">
      <AnimatePresence initial={false}>
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date} className="space-y-3">
            {/* Date divider */}
            <div className="flex justify-center my-2">
              <span className="bg-black/15 text-white/95 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-xs">
                {date}
              </span>
            </div>
            {msgs.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                chat={chat}
                allMessages={messages}
                currentUserId={currentUserId}
                isHovered={hoveredId === msg.id}
                activeTheme={activeTheme}
                onHover={setHoveredId}
                onReaction={onReaction}
                onReply={onReply}
                onOpenThread={onOpenThread}
                onEdit={onEdit}
                onDeleteRequest={onDeleteRequest}
                onBlockKitAction={onBlockKitAction}
                onScrollToMessage={scrollTo}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
            <div className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}