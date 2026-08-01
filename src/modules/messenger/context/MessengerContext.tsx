"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { getChats, getMessages, markAsRead, updateCustomStatus } from "../actions";
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/app/actions";
import { useMessageActions } from "../hooks/useMessageActions";
import { useMessengerPolling } from "../hooks/useMessengerPolling";
import { MESSENGER_THEMES, type Chat, type Message, type MessengerTheme } from "../types";

interface UserProfile {
  displayName: string | null;
  avatarStyle: string | null;
  email: string;
  customStatus?: string | null;
}

interface MessengerContextValue {
  // State
  chats: Chat[];
  selectedChatId: string | null;
  messages: Message[];
  userProfile: UserProfile | null;
  activeTheme: MessengerTheme;
  loading: boolean;
  messagesLoading: boolean;
  isProfileOpen: boolean;
  activeThreadParentId: string | null;
  cachedThreadParent: Message | null;
  isSettingsOpen: boolean;
  activeBotTab: "messages" | "home";

  // Computed
  activeChat: Chat | null;
  threadReplies: Message[];

  // Setters
  setIsProfileOpen: (v: boolean) => void;
  setIsSettingsOpen: (v: boolean) => void;
  setActiveBotTab: (v: "messages" | "home") => void;
  setActiveTheme: (t: MessengerTheme) => void;
  setActiveThreadParentId: (id: string | null) => void;

  // Handlers
  handleSelectChat: (chatId: string) => Promise<void>;
  handleSendMessage: (
    content: string,
    mediaUrl?: string,
    mediaType?: "image" | "document",
    replyToId?: string | null
  ) => Promise<void>;
  handleSaveProfile: (name: string, avatarStyle: string, statusText?: string | null) => Promise<void>;
  handleToggleReaction: (messageId: string, emoji: string) => Promise<void>;
  handleEditMessage: (messageId: string, newContent: string) => Promise<void>;
  handleDeleteMessage: (messageId: string) => Promise<void>;
  handleClearChat: () => Promise<void>;
  handleSetStatus: (status: string | null) => Promise<void>;
  handleOpenThread: (messageId: string) => void;
}

const MessengerContext = createContext<MessengerContextValue | null>(null);

interface MessengerProviderProps {
  children: ReactNode;
  initialProfile?: UserProfile | null;
}

export function MessengerProvider({ children, initialProfile }: MessengerProviderProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialProfile ?? null);
  const [activeTheme, setActiveTheme] = useState<MessengerTheme>(MESSENGER_THEMES[0]);
  const [loading, setLoading] = useState(!initialProfile);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeThreadParentId, setActiveThreadParentId] = useState<string | null>(null);
  const [cachedThreadParent, setCachedThreadParent] = useState<Message | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeBotTab, setActiveBotTab] = useState<"messages" | "home">("messages");

  // Init: fetch profile + chats
  useEffect(() => {
    async function init() {
      try {
        const [profile, chatList] = await Promise.all([
          initialProfile ? Promise.resolve(initialProfile) : getCurrentUserProfile(),
          getChats(),
        ]);
        let customStatus: string | null = null;
        for (const chat of chatList) {
          const self = chat.participants.find((p: any) => p.email === profile.email);
          if (self?.customStatus) { customStatus = self.customStatus; break; }
        }
        setUserProfile({ ...profile, customStatus });
        setChats(chatList);
      } catch (err) {
        console.error("Messenger init failed", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling
  useMessengerPolling({ selectedChatId, setChats, setMessages });

  // Thread caching
  const threadParentMessage = useMemo(
    () => (activeThreadParentId ? messages.find((m) => m.id === activeThreadParentId) ?? null : null),
    [messages, activeThreadParentId]
  );
  useEffect(() => {
    if (threadParentMessage) setCachedThreadParent(threadParentMessage);
  }, [threadParentMessage]);

  const threadReplies = useMemo(
    () => (activeThreadParentId ? messages.filter((m) => m.replyToId === activeThreadParentId) : []),
    [messages, activeThreadParentId]
  );

  const activeChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId) ?? null,
    [chats, selectedChatId]
  );

  // Message actions
  const { handleSendMessage, handleToggleReaction, handleEditMessage, handleDeleteMessage, handleClearChat: _clearChat } =
    useMessageActions({ selectedChatId, userProfile, setMessages, setChats });

  const handleClearChat = useCallback(async () => {
    if (!selectedChatId) return;
    await _clearChat(selectedChatId);
  }, [_clearChat, selectedChatId]);

  const handleSelectChat = useCallback(async (chatId: string) => {
    setSelectedChatId(chatId);
    setActiveThreadParentId(null);
    setActiveBotTab("messages");
    setMessagesLoading(true);
    try {
      const history = await getMessages(chatId);
      setMessages(history);
      await markAsRead(chatId);
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)));
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const handleSaveProfile = useCallback(
    async (name: string, avatarStyle: string, statusText?: string | null) => {
      if (!userProfile) return;
      try {
        const updated = await updateCurrentUserProfile({ displayName: name, avatarStyle });
        if (statusText !== undefined) await updateCustomStatus(statusText);
        setUserProfile((prev) =>
          prev
            ? { ...prev, displayName: updated.displayName, avatarStyle: updated.avatarStyle, customStatus: statusText !== undefined ? statusText : prev.customStatus }
            : null
        );
        setChats(await getChats());
      } catch (err) {
        console.error("Failed to save profile", err);
      }
    },
    [userProfile]
  );

  const handleSetStatus = useCallback(async (status: string | null) => {
    try {
      await updateCustomStatus(status);
      setUserProfile((prev) => (prev ? { ...prev, customStatus: status } : null));
      setChats(await getChats());
    } catch (err) {
      console.error("Failed to update status", err);
    }
  }, []);

  const handleOpenThread = useCallback((messageId: string) => {
    setIsProfileOpen(false);
    setActiveThreadParentId(messageId);
  }, []);

  const value: MessengerContextValue = {
    chats, selectedChatId, messages, userProfile, activeTheme, loading,
    messagesLoading, isProfileOpen, activeThreadParentId, cachedThreadParent,
    isSettingsOpen, activeBotTab, activeChat, threadReplies,
    setIsProfileOpen, setIsSettingsOpen, setActiveBotTab, setActiveTheme,
    setActiveThreadParentId,
    handleSelectChat, handleSendMessage, handleSaveProfile, handleToggleReaction,
    handleEditMessage, handleDeleteMessage, handleClearChat, handleSetStatus, handleOpenThread,
  };

  return <MessengerContext.Provider value={value}>{children}</MessengerContext.Provider>;
}

export function useMessenger(): MessengerContextValue {
  const ctx = useContext(MessengerContext);
  if (!ctx) throw new Error("useMessenger must be used within MessengerProvider");
  return ctx;
}
