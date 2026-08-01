"use client";

import { useState, useEffect, useCallback } from "react";
import { DestructiveActionDialog } from "@synarava/ui-kit";
import { MESSENGER_THEMES, type Chat, type Message, type MessengerTheme } from "../../types";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ReplyBanner, EditBanner } from "./ReplyEditBanner";

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  currentUserId: string;
  isProfileOpen: boolean;
  activeTheme: MessengerTheme;
  onToggleProfile: () => void;
  onSendMessage: (
    content: string,
    mediaUrl?: string,
    mediaType?: "image" | "document",
    replyToId?: string | null
  ) => void;
  onToggleReaction: (id: string, emoji: string) => void;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onClearChat?: () => void;
  onOpenThread: (id: string) => void;
  onSelectTheme?: (theme: MessengerTheme) => void;
  onSetStatus?: (status: string | null) => void;
}

export function ChatWindow({
  chat,
  messages,
  currentUserId,
  isProfileOpen,
  activeTheme,
  onToggleProfile,
  onSendMessage,
  onToggleReaction,
  onEditMessage,
  onDeleteMessage,
  onClearChat,
  onOpenThread,
  onSelectTheme,
  onSetStatus,
}: ChatWindowProps) {
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [msgToDeleteId, setMsgToDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Simulate typing indicator for bot chats
  useEffect(() => {
    if (chat.type !== "bot") return;
    const last = messages[messages.length - 1];
    if (last?.senderId === currentUserId) {
      const t1 = setTimeout(() => setIsTyping(true), 50);
      const t2 = setTimeout(() => setIsTyping(false), 1150);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [messages, chat.type, currentUserId]);

  const handleSend = useCallback(
    (text: string, mediaUrl?: string, mediaType?: "image" | "document") => {
      if (editingMessage) {
        onEditMessage(editingMessage.id, text);
        setEditingMessage(null);
        return;
      }

      // Slash command interception
      if (text.startsWith("/")) {
        const parts = text.split(" ");
        const cmd = parts[0].toLowerCase();

        if (cmd === "/clear") { setShowClearConfirm(true); return; }

        if (cmd.startsWith("/theme-")) {
          const found = MESSENGER_THEMES.find((t) => t.id === cmd.replace("/theme-", ""));
          if (found) {
            onSelectTheme?.(found);
            onSendMessage(`Switched theme to: ${found.name}`, undefined, undefined, replyingToMessage?.id);
          }
          setReplyingToMessage(null);
          return;
        }

        if (cmd === "/status") {
          const statusText = parts.slice(1).join(" ");
          onSetStatus?.(statusText || null);
          onSendMessage(statusText ? `Set status: ${statusText}` : "Cleared status", undefined, undefined, replyingToMessage?.id);
          setReplyingToMessage(null);
          return;
        }

        if (cmd === "/help") {
          const helpBlocks = {
            blocks: [
              { type: "header", text: { type: "plain_text", text: "Messenger Slash Commands" } },
              { type: "divider" },
              {
                type: "section",
                fields: [
                  { type: "mrkdwn", text: "*`/poll \"Q\" \"A\" \"B\"`*\nCreate interactive poll." },
                  { type: "mrkdwn", text: "*`/todo \"Task\"`*\nCreate checklist item." },
                  { type: "mrkdwn", text: "*`/status \"text\"`*\nSet your status." },
                  { type: "mrkdwn", text: "*`/clear`*\nClear chat history." },
                  { type: "mrkdwn", text: "*`/theme-[id]`*\nSwitch theme." },
                  { type: "mrkdwn", text: "*`/help`*\nShow this message." },
                ],
              },
            ],
          };
          onSendMessage(JSON.stringify(helpBlocks), undefined, undefined, replyingToMessage?.id);
          setReplyingToMessage(null);
          return;
        }

        if (cmd === "/poll") {
          const matches = [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
          if (matches.length < 2) { alert('Usage: /poll "Question" "Option A" "Option B"'); return; }
          const pollPayload = {
            blocks: [
              { type: "header", text: { type: "plain_text", text: `Poll: ${matches[0]}` } },
              { type: "divider" },
              {
                type: "actions",
                elements: matches.slice(1).map((opt, i) => ({
                  type: "button",
                  text: { type: "plain_text", text: opt },
                  action_id: `poll-vote-${i}`,
                  value: opt,
                })),
              },
            ],
          };
          onSendMessage(JSON.stringify(pollPayload), undefined, undefined, replyingToMessage?.id);
          setReplyingToMessage(null);
          return;
        }

        if (cmd === "/todo") {
          const match = text.match(/"([^"]+)"/);
          const taskText = match ? match[1] : parts.slice(1).join(" ");
          if (!taskText) { alert('Usage: /todo "Task text"'); return; }
          const todoPayload = {
            blocks: [
              { type: "header", text: { type: "plain_text", text: "Checklist" } },
              {
                type: "actions",
                elements: [{
                  type: "checkboxes",
                  action_id: "todo-item",
                  options: [{ text: { type: "plain_text", text: taskText }, description: { type: "plain_text", text: "Mark as completed" }, value: taskText }],
                }],
              },
            ],
          };
          onSendMessage(JSON.stringify(todoPayload), undefined, undefined, replyingToMessage?.id);
          setReplyingToMessage(null);
          return;
        }
      }

      onSendMessage(text, mediaUrl, mediaType, replyingToMessage?.id);
      setReplyingToMessage(null);
    },
    [editingMessage, replyingToMessage, onSendMessage, onEditMessage, onSelectTheme, onSetStatus]
  );

  const handleBlockKitAction = useCallback(
    (actionId: string, val: string, msgId: string) => {
      if (actionId.startsWith("poll-vote-")) {
        const idx = parseInt(actionId.replace("poll-vote-", ""));
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
        onSendMessage(`/action poll-vote-${idx} ${val}`, undefined, undefined, msgId);
        return;
      }
      if (actionId === "todo-item") {
        onSendMessage(`/action todo-item ${val}`, undefined, undefined, msgId);
      }
    },
    [onSendMessage]
  );

  const wallpaperPattern = {
    "radial-dot": `radial-gradient(circle, #000 1px, transparent 1px)`,
    grid: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
    "cyber-grid": `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
    hex: `radial-gradient(circle, #000 1.5px, transparent 1.5px)`,
    blossom: `radial-gradient(circle, #fecdd3 2px, transparent 2px)`,
    none: "none",
  }[activeTheme.pattern] ?? "none";

  return (
    <div
      className="flex-1 flex flex-col min-h-0 relative overflow-hidden transition-all duration-300"
      style={{ background: activeTheme.wallpaper }}
    >
      {/* Wallpaper pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: wallpaperPattern,
          backgroundSize: activeTheme.pattern === "cyber-grid" ? "32px 32px" : "20px 20px",
        }}
      />

      <ChatHeader
        chat={chat}
        currentUserId={currentUserId}
        isProfileOpen={isProfileOpen}
        isTyping={isTyping}
        activeTheme={activeTheme}
        onToggleProfile={onToggleProfile}
      />

      <MessageList
        chat={chat}
        messages={messages}
        currentUserId={currentUserId}
        isTyping={isTyping}
        activeTheme={activeTheme}
        onReaction={onToggleReaction}
        onReply={setReplyingToMessage}
        onOpenThread={onOpenThread}
        onEdit={setEditingMessage}
        onDeleteRequest={setMsgToDeleteId}
        onBlockKitAction={handleBlockKitAction}
      />

      {/* Context banners */}
      {replyingToMessage && (
        <ReplyBanner
          message={replyingToMessage}
          activeTheme={activeTheme}
          onClear={() => setReplyingToMessage(null)}
        />
      )}
      {editingMessage && (
        <EditBanner
          message={editingMessage}
          activeTheme={activeTheme}
          onClear={() => { setEditingMessage(null); }}
        />
      )}

      <MessageInput
        chat={chat}
        activeTheme={activeTheme}
        editingMessage={editingMessage}
        replyingToMessage={replyingToMessage}
        onSend={handleSend}
        onCancelEdit={() => setEditingMessage(null)}
      />

      {/* Destructive dialogs */}
      <DestructiveActionDialog
        open={!!msgToDeleteId}
        saving={false}
        eyebrow="Delete Message"
        title="Delete Message?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setMsgToDeleteId(null)}
        onConfirm={() => { if (msgToDeleteId) { onDeleteMessage(msgToDeleteId); setMsgToDeleteId(null); } }}
      />
      <DestructiveActionDialog
        open={showClearConfirm}
        saving={false}
        eyebrow="Clear History"
        title="Clear conversation?"
        description="All messages will be permanently deleted."
        confirmLabel="Clear"
        cancelLabel="Cancel"
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={() => { onClearChat?.(); setShowClearConfirm(false); }}
      />
    </div>
  );
}
