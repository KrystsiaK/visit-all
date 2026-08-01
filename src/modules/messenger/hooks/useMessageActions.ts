"use client";

import { useCallback } from "react";
import {
  sendMessage,
  toggleReaction,
  editMessage,
  deleteMessage,
  clearChat,
} from "../actions";
import { getChats, getMessages } from "../actions";
import type { Message } from "../types";

interface UseMessageActionsProps {
  selectedChatId: string | null;
  userProfile: { email: string; displayName: string | null; avatarStyle: string | null } | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setChats: React.Dispatch<React.SetStateAction<any[]>>;
}

export function useMessageActions({
  selectedChatId,
  userProfile,
  setMessages,
  setChats,
}: UseMessageActionsProps) {
  const handleSendMessage = useCallback(
    async (
      content: string,
      mediaUrl?: string,
      mediaType?: "image" | "document",
      replyToId?: string | null
    ) => {
      if (!selectedChatId) return;

      const tempId = `temp-${Date.now()}`;
      const optimistic: Message = {
        id: tempId,
        chatId: selectedChatId,
        senderId: userProfile?.email || "me",
        senderName: userProfile?.displayName || "Me",
        senderAvatarStyle: userProfile?.avatarStyle || "mondrian-primary",
        content,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        replyToId: replyToId || null,
        created_at: new Date().toISOString(),
        isRead: false,
      };

      setMessages((prev) => [...prev, optimistic]);

      try {
        const sent = await sendMessage(selectedChatId, content, mediaUrl, mediaType, replyToId);
        setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
        const updated = await getChats();
        setChats(updated);
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    },
    [selectedChatId, userProfile, setMessages, setChats]
  );

  const handleToggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const reactions = await toggleReaction(messageId, emoji);
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
        );
      } catch (err) {
        console.error("Failed to toggle reaction", err);
      }
    },
    [setMessages]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: newContent, isEdited: true } : m))
      );
      try {
        await editMessage(messageId, newContent);
        const updated = await getChats();
        setChats(updated);
      } catch {
        if (selectedChatId) {
          const history = await getMessages(selectedChatId);
          setMessages(history);
        }
      }
    },
    [selectedChatId, setMessages, setChats]
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      try {
        await deleteMessage(messageId);
        const updated = await getChats();
        setChats(updated);
      } catch {
        if (selectedChatId) {
          const history = await getMessages(selectedChatId);
          setMessages(history);
        }
      }
    },
    [selectedChatId, setMessages, setChats]
  );

  const handleClearChat = useCallback(
    async (chatId: string) => {
      setMessages([]);
      try {
        await clearChat(chatId);
        const updated = await getChats();
        setChats(updated);
      } catch {
        const history = await getMessages(chatId);
        setMessages(history);
      }
    },
    [setMessages, setChats]
  );

  return {
    handleSendMessage,
    handleToggleReaction,
    handleEditMessage,
    handleDeleteMessage,
    handleClearChat,
  };
}
