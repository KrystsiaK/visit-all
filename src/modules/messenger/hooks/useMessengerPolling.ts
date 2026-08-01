"use client";

import { useEffect } from "react";
import { getChats, getMessages } from "../actions";
import type { Chat, Message } from "../types";

interface UseMessengerPollingProps {
  selectedChatId: string | null;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  intervalMs?: number;
}

export function useMessengerPolling({
  selectedChatId,
  setChats,
  setMessages,
  intervalMs = 3500,
}: UseMessengerPollingProps) {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const chatList = await getChats();
        setChats(chatList);
        if (selectedChatId) {
          const history = await getMessages(selectedChatId);
          setMessages(history);
        }
      } catch (err) {
        console.error("Messenger polling error", err);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [selectedChatId, setChats, setMessages, intervalMs]);
}
