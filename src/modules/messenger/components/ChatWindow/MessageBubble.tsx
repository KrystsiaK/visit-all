"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CornerUpLeft, MessageSquare, Pencil, Trash2, Check, CheckCheck } from "lucide-react";
import { UserAvatarBadge } from "@synarava/ui-kit";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { SlackBlockKitRenderer } from "../SlackBlockKitRenderer";
import type { Chat, Message, MessengerTheme } from "../../types";

const QUICK_REACTIONS = ["👍", "❤️", "🔥", "😂", "😮", "😢", "🎉", "👏"];

function isOnlyEmojis(text: string): boolean {
  const clean = text.replace(/[\s️‍]/g, "");
  const chars = Array.from(clean);
  if (chars.length === 0 || chars.length > 3) return false;
  return chars.every((c) => /^\p{Emoji_Presentation}$/u.test(c));
}

function formatTime(str: string): string {
  try {
    return new Date(str).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

interface MessageBubbleProps {
  msg: Message;
  chat: Chat;
  allMessages: Message[];
  currentUserId: string;
  isHovered: boolean;
  activeTheme: MessengerTheme;
  onHover: (id: string | null) => void;
  onReaction: (id: string, emoji: string) => void;
  onReply: (msg: Message) => void;
  onOpenThread: (id: string) => void;
  onEdit: (msg: Message) => void;
  onDeleteRequest: (id: string) => void;
  onBlockKitAction: (actionId: string, val: string, msgId: string) => void;
  onScrollToMessage: (id: string) => void;
}

export function MessageBubble({
  msg,
  chat,
  allMessages,
  currentUserId,
  isHovered,
  activeTheme,
  onHover,
  onReaction,
  onReply,
  onOpenThread,
  onEdit,
  onDeleteRequest,
  onBlockKitAction,
  onScrollToMessage,
}: MessageBubbleProps) {
  const isOwn = msg.senderId === currentUserId;
  const emojiOnly = isOnlyEmojis(msg.content);
  const repliedMsg = msg.replyToId ? allMessages.find((m) => m.id === msg.replyToId) : null;
  const threadCount = allMessages.filter((m) => m.replyToId === msg.id).length;
  const threadReplierStyles = Array.from(
    new Set(allMessages.filter((m) => m.replyToId === msg.id).map((m) => m.senderAvatarStyle))
  ).slice(0, 3);

  return (
    <motion.div
      id={`msg-${msg.id}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => onHover(msg.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="max-w-[70%] flex gap-2 items-end relative">
        {/* Hover reaction bar */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 5 }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
              className={`absolute -top-10 z-20 ${isOwn ? "right-0" : "left-0"}`}
            >
              <LiquidGlassSurface
                variant="frosted-glass"
                tone="neutral"
                effect="amplified"
                className="flex items-center gap-1 px-2 py-1 rounded-full shadow-md border border-black/8 bg-white/60"
              >
                {chat.type !== "channel" &&
                  QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onReaction(msg.id, emoji)}
                      className={`text-base p-1 hover:scale-125 transition-transform rounded-full flex items-center justify-center cursor-pointer ${
                        msg.reactions?.[emoji]?.includes(currentUserId)
                          ? "bg-black/15 scale-110"
                          : "hover:bg-black/5"
                      }`}
                      aria-label={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                <div className="w-px h-4 bg-black/10 mx-1 shrink-0" />
                <button
                  type="button"
                  onClick={() => onReply(msg)}
                  className="text-neutral-600 hover:text-neutral-900 hover:scale-120 transition-all p-1 rounded-full hover:bg-black/5 shrink-0 cursor-pointer"
                  aria-label="Reply"
                >
                  <CornerUpLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenThread(msg.id)}
                  className="text-neutral-600 hover:text-neutral-900 hover:scale-120 transition-all p-1 rounded-full hover:bg-black/5 shrink-0 cursor-pointer"
                  aria-label="Reply in thread"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                {isOwn && !msg.mediaUrl && (
                  <button
                    type="button"
                    onClick={() => onEdit(msg)}
                    className="text-neutral-600 hover:text-neutral-900 hover:scale-120 transition-all p-1 rounded-full hover:bg-black/5 shrink-0 cursor-pointer"
                    aria-label="Edit message"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {(isOwn || chat.type === "direct" || chat.type === "bot") && (
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(msg.id)}
                    className="text-red-500 hover:text-red-700 hover:scale-120 transition-all p-1 rounded-full hover:bg-red-50 shrink-0 cursor-pointer"
                    aria-label="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </LiquidGlassSurface>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar for group/channel */}
        {!isOwn && chat.type !== "direct" && (
          <div className="shrink-0 mb-1">
            <UserAvatarBadge styleId={msg.senderAvatarStyle} size="sm" />
          </div>
        )}

        {/* Bubble */}
        <div
          className={`relative rounded-3xl px-3.5 py-2 text-sm flex flex-col transition-all ${
            emojiOnly
              ? "bg-transparent shadow-none select-none"
              : isOwn
                ? "text-white rounded-br-xs shadow-xs"
                : "bg-white text-neutral-900 rounded-bl-xs shadow-xs"
          }`}
          style={isOwn && !emojiOnly ? { backgroundColor: activeTheme.accentColor } : undefined}
        >
          {/* Reply preview */}
          {repliedMsg && (
            <button
              type="button"
              onClick={() => onScrollToMessage(repliedMsg.id)}
              className={`mb-2 w-full text-left border-l-2 pl-2 py-0.5 rounded-r bg-black/5 hover:bg-black/10 transition-colors flex flex-col text-xs cursor-pointer ${
                isOwn ? "border-white/60 text-white" : "border-neutral-400 text-neutral-800"
              }`}
            >
              <span
                className="text-[9px] font-black uppercase tracking-wide block truncate"
                style={!isOwn ? { color: activeTheme.accentColor } : undefined}
              >
                {repliedMsg.senderName}
              </span>
              <span className="text-[10px] truncate block opacity-75">{repliedMsg.content}</span>
            </button>
          )}

          {/* Group sender name */}
          {!isOwn && chat.type !== "direct" && !emojiOnly && (
            <span
              className="block text-[10px] font-black mb-0.5 uppercase tracking-wide"
              style={{ color: activeTheme.accentColor }}
            >
              {msg.senderName}
            </span>
          )}

          {/* Image attachment */}
          {msg.mediaUrl && msg.mediaType === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={msg.mediaUrl}
              alt="Attachment"
              className="rounded-2xl max-h-60 object-cover mb-1.5 w-full border border-black/5"
            />
          )}

          {/* Content: Block Kit or plain text */}
          {msg.content.startsWith('{"blocks":') ? (
            <SlackBlockKitRenderer
              content={msg.content}
              onAction={(actionId, val) => onBlockKitAction(actionId, val, msg.id)}
              accentColor={activeTheme.accentColor}
            />
          ) : (
            <p className={`leading-5 whitespace-pre-wrap font-medium ${emojiOnly ? "text-5xl" : ""}`}>
              {msg.content}
            </p>
          )}

          {/* Timestamp + read status */}
          <div
            className={`flex items-center justify-end gap-1.5 mt-1 text-[9px] opacity-65 leading-none ${
              emojiOnly
                ? "text-neutral-500 font-bold bg-white/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full inline-flex mt-1.5 shadow-xs"
                : ""
            }`}
          >
            {msg.isEdited && <span className="text-[8px] opacity-75 italic mr-0.5">edited</span>}
            <span>{formatTime(msg.created_at)}</span>
            {isOwn && (msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
          </div>

          {/* Reactions */}
          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1.5 ${isOwn ? "justify-end" : "justify-start"}`}>
              {Object.entries(msg.reactions).map(([emoji, users]) => {
                if (!users?.length) return null;
                const hasReacted = users.includes(currentUserId);
                return (
                  <button
                    key={emoji}
                    onClick={() => onReaction(msg.id, emoji)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                      hasReacted
                        ? emojiOnly
                          ? "bg-black/10 border-black/15 text-neutral-800"
                          : "bg-white/20 border-white/30 text-white shadow-xs"
                        : emojiOnly
                          ? "bg-black/5 border-black/5 text-neutral-500 hover:bg-black/10"
                          : isOwn
                            ? "bg-white/10 border-white/10 text-white/85 hover:bg-white/15"
                            : "bg-black/5 border-black/5 text-neutral-500 hover:bg-black/8"
                    }`}
                    aria-label={`${emoji} reaction`}
                  >
                    <span>{emoji}</span>
                    <span className="text-[9px]">{users.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Thread reply summary */}
          {!msg.replyToId && threadCount > 0 && (
            <button
              type="button"
              onClick={() => onOpenThread(msg.id)}
              className={`mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-xl border transition-all w-fit cursor-pointer ${
                isOwn
                  ? "text-white/95 border-white/20 hover:bg-white/10 bg-white/5"
                  : "text-neutral-600 border-black/5 bg-black/2 hover:bg-black/4"
              }`}
            >
              <span className="flex -space-x-1 shrink-0 mr-0.5">
                {threadReplierStyles.map((style, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white overflow-hidden shrink-0 shadow-2xs"
                  >
                    <UserAvatarBadge styleId={style} size="sm" />
                  </div>
                ))}
              </span>
              <MessageSquare className="w-3 h-3" />
              <span>
                {threadCount} {threadCount === 1 ? "reply" : "replies"}
              </span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
