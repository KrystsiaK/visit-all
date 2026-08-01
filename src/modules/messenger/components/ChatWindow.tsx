// src/modules/messenger/components/ChatWindow.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Smile, Phone, Video, Search, ChevronRight, Check, CheckCheck, Paperclip, X, Pencil, Trash2, CornerUpLeft, MessageSquare } from "lucide-react";
import { UserAvatarBadge, DestructiveActionDialog, AutoResizeTextarea } from "@synarava/ui-kit";
import { motion, AnimatePresence } from "framer-motion";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { type Chat, type Message, type MessengerTheme, MESSENGER_THEMES } from "../types";
import { SlackBlockKitRenderer } from "./SlackBlockKitRenderer";

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  onSendMessage: (content: string, mediaUrl?: string, mediaType?: "image" | "document", replyToId?: string | null) => void;
  onToggleProfile: () => void;
  isProfileOpen: boolean;
  currentUserId: string;
  onToggleReaction: (messageId: string, emoji: string) => void;
  activeTheme: MessengerTheme;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onClearChat?: () => void;
  onSelectTheme?: (theme: MessengerTheme) => void;
  onSetStatus?: (status: string | null) => void;
  onOpenThread?: (messageId: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "🔥", "😂", "😮", "😢", "🎉", "👏"];

const EMOJI_CATEGORIES = [
  {
    title: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😜", "🤫", "🤔", "🙄", "😬", "😴", "😎", "🥳", "💩", "🔥", "✨"]
  },
  {
    title: "Gestures",
    emojis: ["👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤏", "👈", "👉", "👆", "👇", "☝️", "👋", "✍️", "👏", "🙌", "👐", "🤲", "🙏", "💪"]
  },
  {
    title: "Hearts & Fun",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🎉", "🎈", "🎁", "🏆", "👑", "🌟", "⭐", "⚡"]
  }
];

const COMMANDS = [
  { name: "/poll", desc: "Create interactive poll: /poll \"Question\" \"Option A\" \"Option B\"" },
  { name: "/todo", desc: "Create checklist: /todo \"Task text\"" },
  { name: "/status", desc: "Set Slack status: /status \"🍔 Lunch\"" },
  { name: "/clear", desc: "Clear current chat history" },
  { name: "/help", desc: "Show commands help" },
  { name: "/theme-sand", desc: "Switch to Classic Sand theme" },
  { name: "/theme-midnight", desc: "Switch to Midnight Velvet theme" },
  { name: "/theme-sakura", desc: "Switch to Sakura Breeze theme" },
  { name: "/theme-cyberpunk", desc: "Switch to Cyberpunk Neon theme" },
  { name: "/theme-emerald", desc: "Switch to Emerald Forest theme" },
  { name: "/theme-cinematic", desc: "Switch to Cinematic Glass theme" },
];

const checkIfOnlyEmojis = (text: string): boolean => {
  const clean = text.replace(/[\s\uFE0F\u200d]/g, "");
  const charArray = Array.from(clean);
  if (charArray.length === 0 || charArray.length > 3) return false;
  
  const emojiRegex = /^\p{Emoji_Presentation}$/u;
  return charArray.every(char => emojiRegex.test(char));
};

export function ChatWindow({
  chat,
  messages,
  onSendMessage,
  onToggleProfile,
  isProfileOpen,
  currentUserId,
  onToggleReaction,
  activeTheme,
  onEditMessage,
  onDeleteMessage,
  onClearChat,
  onSelectTheme,
  onSetStatus,
  onOpenThread
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  
  // Custom dialogs state
  const [msgToDeleteId, setMsgToDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Slash commands autocomplete suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsFilter, setSuggestionsFilter] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = (msg: Message) => {
    setEditingMessage(msg);
    setInputText(msg.content);
    setReplyingToMessage(null); // Clear replying
  };

  const handleStartReply = (msg: Message) => {
    setReplyingToMessage(msg);
    setEditingMessage(null); // Clear editing
  };

  // Scroll to bottom when messages or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Simulate typing indicator when user sends a message in Bot chat
  useEffect(() => {
    if (chat.type !== "bot") return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.senderId === currentUserId) {
      const startTimer = setTimeout(() => {
        setIsTyping(true);
      }, 50);
      const endTimer = setTimeout(() => {
        setIsTyping(false);
      }, 1150);
      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
      };
    }
  }, [messages, chat.type, currentUserId]);

  const chatTitle = useMemo(() => {
    if (chat.type === "direct") {
      const otherParticipant = chat.participants.find((p) => p.id !== currentUserId);
      return otherParticipant ? (otherParticipant.displayName || "Direct Chat") : "Saved Messages";
    }
    return chat.name || "Group Chat";
  }, [chat, currentUserId]);

  const directUserStatus = useMemo(() => {
    if (chat.type === "direct") {
      const otherParticipant = chat.participants.find((p) => p.id !== currentUserId);
      return otherParticipant?.customStatus || null;
    }
    return null;
  }, [chat, currentUserId]);

  const chatSubtitle = useMemo(() => {
    if (chat.type === "bot") return "bot assistant";
    if (chat.type === "channel") return "news channel";
    if (chat.type === "group") return `${chat.participants.length} members`;
    
    const otherParticipant = chat.participants.find((p) => p.id !== currentUserId);
    if (!otherParticipant) return "saved messages";
    return otherParticipant.status === "active" ? "online" : "offline";
  }, [chat, currentUserId]);

  const chatAvatarStyle = useMemo(() => {
    if (chat.type === "direct") {
      const otherParticipant = chat.participants.find((p) => p.id !== currentUserId);
      return otherParticipant ? (otherParticipant.avatarStyle || "mondrian-primary") : "glass-translucent";
    }
    return chat.avatarUrl || "mondrian-accent";
  }, [chat, currentUserId]);

  const handleInputChange = (val: string) => {
    setInputText(val);
    
    if (val.startsWith("/")) {
      const query = val.split(" ")[0].toLowerCase();
      setSuggestionsFilter(query);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSend = () => {
    const textToSend = inputText.trim();
    if (!textToSend && !selectedImage) return;

    // Command Interception
    if (textToSend.startsWith("/")) {
      const parts = textToSend.split(" ");
      const cmd = parts[0].toLowerCase();

      if (cmd === "/clear") {
        setShowClearConfirm(true);
        setInputText("");
        setShowSuggestions(false);
        return;
      }

      if (cmd.startsWith("/theme-")) {
        const themeId = cmd.replace("/theme-", "");
        const found = MESSENGER_THEMES.find(t => t.id === themeId);
        if (found) {
          onSelectTheme?.(found);
          onSendMessage(`🎨 Switched theme to: ${found.name}`, undefined, undefined, replyingToMessage?.id);
        }
        setInputText("");
        setShowSuggestions(false);
        return;
      }

      if (cmd === "/status") {
        const statusText = parts.slice(1).join(" ");
        onSetStatus?.(statusText || null);
        onSendMessage(statusText ? `📢 Set status: ${statusText}` : `📢 Cleared status`, undefined, undefined, replyingToMessage?.id);
        setInputText("");
        setShowSuggestions(false);
        return;
      }

      if (cmd === "/help") {
        const helpBlocks = {
          blocks: [
            {
              type: "header",
              text: { type: "plain_text", text: "⚙️ Messenger Slash Commands Help" }
            },
            {
              type: "divider"
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Here are the available slash commands to interact with this Slack-integrated chat application:"
              }
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: "*`/poll \"Question\" \"Opt1\" ...`*\nCreates an interactive poll." },
                { type: "mrkdwn", text: "*`/todo \"Task details\"`*\nAdds a checkbox item." },
                { type: "mrkdwn", text: "*`/status \"🍔 Lunch\"`*\nSets your emoji status." },
                { type: "mrkdwn", text: "*`/clear`*\nClears all chat history." },
                { type: "mrkdwn", text: "*`/theme-[id]`*\nSwitch chat theme instantly." },
                { type: "mrkdwn", text: "*`/help`*\nDisplays this information." }
              ]
            }
          ]
        };
        onSendMessage(JSON.stringify(helpBlocks), undefined, undefined, replyingToMessage?.id);
        setInputText("");
        setShowSuggestions(false);
        return;
      }

      if (cmd === "/poll") {
        const matches = [...textToSend.matchAll(/"([^"]+)"/g)].map(m => m[1]);
        if (matches.length < 2) {
          alert('Usage: /poll "Question" "Option A" "Option B" ...');
          return;
        }
        const question = matches[0];
        const options = matches.slice(1);
        
        const pollPayload = {
          blocks: [
            {
              type: "header",
              text: { type: "plain_text", text: `📊 Poll: ${question}` }
            },
            {
              type: "section",
              text: { type: "mrkdwn", text: `Poll Creator: *${chat.participants.find(p => p.email === currentUserId)?.displayName || "Me"}*` }
            },
            {
              type: "divider"
            },
            {
              type: "actions",
              elements: options.map((opt, oIdx) => ({
                type: "button",
                text: { type: "plain_text", text: opt },
                action_id: `poll-vote-${oIdx}`,
                value: opt
              }))
            }
          ]
        };
        onSendMessage(JSON.stringify(pollPayload), undefined, undefined, replyingToMessage?.id);
        setInputText("");
        setShowSuggestions(false);
        return;
      }

      if (cmd === "/todo") {
        const taskMatch = textToSend.match(/"([^"]+)"/);
        const taskText = taskMatch ? taskMatch[1] : parts.slice(1).join(" ");
        if (!taskText) {
          alert('Usage: /todo "Task text"');
          return;
        }
        
        const todoPayload = {
          blocks: [
            {
              type: "header",
              text: { type: "plain_text", text: "📝 Checklist" }
            },
            {
              type: "actions",
              elements: [
                {
                  type: "checkboxes",
                  action_id: "todo-item",
                  options: [
                    {
                      text: { type: "plain_text", text: taskText },
                      description: { type: "plain_text", text: "Mark as completed" },
                      value: taskText
                    }
                  ]
                }
              ]
            }
          ]
        };
        onSendMessage(JSON.stringify(todoPayload), undefined, undefined, replyingToMessage?.id);
        setInputText("");
        setShowSuggestions(false);
        return;
      }
    }

    if (editingMessage) {
      onEditMessage(editingMessage.id, textToSend);
      setEditingMessage(null);
    } else if (selectedImage) {
      onSendMessage(textToSend || "Image", selectedImage, "image", replyingToMessage?.id);
      setSelectedImage(null);
      setReplyingToMessage(null);
    } else {
      onSendMessage(textToSend, undefined, undefined, replyingToMessage?.id);
      setReplyingToMessage(null);
    }
    setInputText("");
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatMessageTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  // Thread reply helpers
  const getThreadReplyCount = (msgId: string) => {
    return messages.filter((m) => m.replyToId === msgId).length;
  };

  const getThreadRepliers = (msgId: string) => {
    const replies = messages.filter((m) => m.replyToId === msgId);
    const styles = Array.from(new Set(replies.map(r => r.senderAvatarStyle)));
    return styles.slice(0, 3);
  };

  // Group messages by day
  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    // Only display root level messages in main chat window timeline
    const mainTimelineMessages = messages.filter(m => m.replyToId === null);
    
    mainTimelineMessages.forEach((msg) => {
      try {
        const dateStr = new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(msg);
      } catch {
        if (!groups["Unknown Date"]) groups["Unknown Date"] = [];
        groups["Unknown Date"].push(msg);
      }
    });
    return groups;
  }, [messages]);

  return (
    <div 
      className="flex-1 flex flex-col min-h-0 relative overflow-hidden transition-all duration-300"
      style={{ background: activeTheme.wallpaper }}
    >
      {/* Dynamic Telegram Wallpaper Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: activeTheme.pattern === "radial-dot"
            ? `radial-gradient(circle, #000 1px, transparent 1px)`
            : activeTheme.pattern === "grid"
            ? `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`
            : activeTheme.pattern === "cyber-grid"
            ? `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`
            : activeTheme.pattern === "hex"
            ? `radial-gradient(circle, #000 1.5px, transparent 1.5px)`
            : activeTheme.pattern === "blossom"
            ? `radial-gradient(circle, #fecdd3 2px, transparent 2px)`
            : `none`,
          backgroundSize: activeTheme.pattern === "cyber-grid" ? "32px 32px" : "20px 20px"
        }}
      />

      {/* Header */}
      <LiquidGlassSurface 
        variant="frosted-glass" 
        tone={activeTheme.glassTone} 
        effect="default"
        className="h-16 px-4 flex items-center justify-between border-b border-black/8 z-10 shadow-sm"
      >
        <button 
          onClick={onToggleProfile}
          className="flex items-center gap-3 text-left hover:bg-black/4 p-1.5 rounded-2xl transition-all"
        >
          <UserAvatarBadge styleId={chatAvatarStyle} size="md" />
          <div>
            <h3 className="font-extrabold text-sm text-neutral-900 leading-tight flex items-center gap-1.5">
              <span>{chatTitle}</span>
              {directUserStatus && (
                <span className="text-xs bg-black/5 px-1.5 py-0.5 rounded-full font-bold shadow-2xs" title={directUserStatus}>
                  {directUserStatus}
                </span>
              )}
            </h3>
            <span 
              className="text-[10px] font-bold"
              style={{ color: chatSubtitle === "online" ? activeTheme.accentColor : "#737373" }}
            >
              {isTyping ? "typing..." : chatSubtitle}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1 text-neutral-600">
          <button className="p-2 hover:bg-black/5 rounded-full transition-all">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-black/5 rounded-full transition-all">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-black/5 rounded-full transition-all">
            <Video className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-black/10 mx-1" />
          <button 
            onClick={onToggleProfile}
            className={`p-2 rounded-full transition-all ${
              isProfileOpen ? "bg-[#111111] text-white" : "hover:bg-black/5"
            }`}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isProfileOpen ? "" : "rotate-180"}`} />
          </button>
        </div>
      </LiquidGlassSurface>

      {/* Message Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar z-10 relative">
        <AnimatePresence initial={false}>
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="space-y-3">
              {/* Date divider */}
              <div className="flex justify-center my-2">
                <span className="bg-black/15 text-white/95 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-xs">
                  {date}
                </span>
              </div>

              {msgs.map((msg) => {
                const isOwn = msg.senderId === currentUserId;
                const isOnlyEmojis = checkIfOnlyEmojis(msg.content);
                const repliedMsg = msg.replyToId ? messages.find((m) => m.id === msg.replyToId) : null;
                return (
                  <motion.div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    <div className="max-w-[70%] flex gap-2 items-end relative border-black/0">
                      {/* Floating Reactions Bar */}
                      <AnimatePresence>
                        {hoveredMsgId === msg.id && (
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
                              {chat.type !== "channel" && QUICK_REACTIONS.map((emoji) => {
                                const hasReacted = msg.reactions?.[emoji]?.includes(currentUserId);
                                return (
                                  <button
                                    key={emoji}
                                    onClick={() => onToggleReaction(msg.id, emoji)}
                                    className={`text-base p-1 hover:scale-130 transition-transform rounded-full flex items-center justify-center ${
                                      hasReacted ? "bg-black/15 scale-110" : "hover:bg-black/5"
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                );
                              })}
                              
                              {/* Action Divider */}
                              <div className="w-px h-4 bg-black/10 mx-1 shrink-0" />
                              
                              {/* Reply */}
                              <button
                                type="button"
                                onClick={() => handleStartReply(msg)}
                                className="text-neutral-600 hover:text-neutral-900 hover:scale-120 transition-all p-1 rounded-full hover:bg-black/5 shrink-0 flex items-center justify-center"
                                title="Reply"
                              >
                                <CornerUpLeft className="w-3.5 h-3.5" />
                              </button>
                              
                              {/* Reply in thread */}
                              <button
                                type="button"
                                onClick={() => onOpenThread?.(msg.id)}
                                className="text-neutral-600 hover:text-neutral-900 hover:scale-120 transition-all p-1 rounded-full hover:bg-black/5 shrink-0 flex items-center justify-center"
                                title="Reply in Thread"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              
                              {isOwn && !msg.mediaUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(msg)}
                                  className="text-neutral-600 hover:text-neutral-900 hover:scale-120 transition-all p-1 rounded-full hover:bg-black/5 shrink-0 flex items-center justify-center"
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                              
                              {(isOwn || chat.type === "direct" || chat.type === "bot") && (
                                <button
                                  type="button"
                                  onClick={() => setMsgToDeleteId(msg.id)}
                                  className="text-red-500 hover:text-red-700 hover:scale-120 transition-all p-1 rounded-full hover:bg-red-50 shrink-0 flex items-center justify-center"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </LiquidGlassSurface>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isOwn && chat.type !== "direct" && (
                        <div className="shrink-0 mb-1">
                          <UserAvatarBadge styleId={msg.senderAvatarStyle} size="sm" />
                        </div>
                      )}

                      <div 
                        className={`relative rounded-3xl px-3.5 py-2 text-sm transition-all flex flex-col ${
                          isOnlyEmojis
                            ? "bg-transparent shadow-none select-none"
                            : isOwn 
                              ? "text-white rounded-br-xs shadow-xs" 
                              : "bg-white text-neutral-900 rounded-bl-xs shadow-xs"
                        }`}
                        style={isOwn && !isOnlyEmojis ? { backgroundColor: activeTheme.accentColor } : undefined}
                      >
                        {/* Reply Preview Card */}
                        {repliedMsg && (
                          <button
                            type="button"
                            onClick={() => {
                              const element = document.getElementById(`msg-${repliedMsg.id}`);
                              element?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                            className={`mb-2 w-full text-left border-l-2 pl-2 py-0.5 rounded-r bg-black/5 hover:bg-black/10 transition-colors flex flex-col pointer-events-auto text-xs ${
                              isOwn ? "border-white/60 text-white" : "border-neutral-400 text-neutral-800"
                            }`}
                          >
                            <span 
                              className="text-[9px] font-black uppercase tracking-wide block truncate"
                              style={!isOwn ? { color: activeTheme.accentColor } : undefined}
                            >
                              {repliedMsg.senderName}
                            </span>
                            <span className="text-[10px] truncate block opacity-75">
                              {repliedMsg.content}
                            </span>
                          </button>
                        )}
                        {/* Sender name in Group/Channel */}
                        {!isOwn && chat.type !== "direct" && !isOnlyEmojis && (
                          <span 
                            className="block text-[10px] font-black mb-0.5 uppercase tracking-wide"
                            style={{ color: activeTheme.accentColor }}
                          >
                            {msg.senderName}
                          </span>
                        )}

                        {/* Image Attachment */}
                        {msg.mediaUrl && msg.mediaType === "image" && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img 
                            src={msg.mediaUrl} 
                            alt="Attachment" 
                            className="rounded-2xl max-h-60 object-cover mb-1.5 w-full border border-black/5" 
                          />
                        )}

                        {/* Text Content / Block Kit parsing */}
                        {msg.content.startsWith('{"blocks":') ? (
                          <SlackBlockKitRenderer 
                            content={msg.content} 
                            onAction={(actionId, val) => {
                              onSendMessage(`/action ${actionId} ${val}`, undefined, undefined, msg.id);
                            }} 
                            accentColor={activeTheme.accentColor} 
                          />
                        ) : (
                          <p className={`leading-5 whitespace-pre-wrap font-medium ${
                            isOnlyEmojis ? "text-5xl tracking-normal" : ""
                          }`}>{msg.content}</p>
                        )}

                        {/* Time & Read Status */}
                        <div className={`flex items-center justify-end gap-1.5 mt-1 text-[9px] text-right opacity-65 leading-none ${
                          isOnlyEmojis ? "text-neutral-500 font-bold bg-white/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full inline-flex mt-1.5 shadow-xs" : ""
                        }`}>
                          {msg.isEdited && (
                            <span className="text-[8px] opacity-75 italic mr-0.5">edited</span>
                          )}
                          <span>{formatMessageTime(msg.created_at)}</span>
                          {isOwn && (
                            msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                          )}
                        </div>

                        {/* Reactions List */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className={`flex flex-wrap gap-1 mt-1.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                            {Object.entries(msg.reactions).map(([emoji, users]) => {
                              if (!users || users.length === 0) return null;
                              const hasReacted = users.includes(currentUserId);
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => onToggleReaction(msg.id, emoji)}
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                                    hasReacted 
                                      ? isOnlyEmojis
                                        ? "bg-black/10 border-black/15 text-neutral-800"
                                        : "bg-white/20 border-white/30 text-white shadow-xs" 
                                      : isOnlyEmojis
                                        ? "bg-black/5 border-black/5 text-neutral-500 hover:bg-black/10"
                                        : isOwn 
                                          ? "bg-white/10 border-white/10 text-white/85 hover:bg-white/15" 
                                          : "bg-black/5 border-black/5 text-neutral-500 hover:bg-black/8"
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span className="text-[9px]">{users.length}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Thread reply summary button */}
                        {!msg.replyToId && getThreadReplyCount(msg.id) > 0 && (
                          <button
                            type="button"
                            onClick={() => onOpenThread?.(msg.id)}
                            className={`mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-xl border transition-all w-fit pointer-events-auto ${
                              isOwn 
                                ? "text-white/95 border-white/20 hover:bg-white/10 bg-white/5" 
                                : "text-neutral-600 border-black/5 bg-black/2 hover:bg-black/4"
                            }`}
                          >
                            <span className="flex -space-x-1 shrink-0 mr-0.5">
                              {getThreadRepliers(msg.id).map((style, idx) => (
                                <div key={idx} className="w-4 h-4 rounded-full border border-white overflow-hidden shrink-0 shadow-2xs">
                                  <UserAvatarBadge styleId={style} size="sm" />
                                </div>
                              ))}
                            </span>
                            <span>💬 {getThreadReplyCount(msg.id)} {getThreadReplyCount(msg.id) === 1 ? "reply" : "replies"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {selectedImage && (
        <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-t border-black/8 flex items-center gap-3 z-10">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-black/10 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-neutral-800">Image to send</span>
            <p className="text-[10px] text-neutral-400 mt-0.5">Will be sent along with the message text</p>
          </div>
        </div>
      )}

      {/* Replying Banner */}
      {replyingToMessage && (
        <div className="px-4 py-2.5 bg-white/90 backdrop-blur-md border-t border-black/8 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-neutral-800">
            <CornerUpLeft className="w-4 h-4" style={{ color: activeTheme.accentColor }} />
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider block leading-none" style={{ color: activeTheme.accentColor }}>Replying to {replyingToMessage.senderName}</span>
              <p className="text-xs text-neutral-500 truncate max-w-md mt-0.5">{replyingToMessage.content}</p>
            </div>
          </div>
          <button 
            onClick={() => setReplyingToMessage(null)}
            className="p-1 hover:bg-black/5 rounded-full text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <div className="px-4 py-2.5 bg-white/90 backdrop-blur-md border-t border-black/8 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-neutral-800">
            <Pencil className="w-4 h-4" style={{ color: activeTheme.accentColor }} />
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider block leading-none" style={{ color: activeTheme.accentColor }}>Editing Message</span>
              <p className="text-xs text-neutral-500 truncate max-w-md mt-0.5">{editingMessage.content}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingMessage(null);
              setInputText("");
            }}
            className="p-1 hover:bg-black/5 rounded-full text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Slash Commands Auto-Suggestions Popover */}
      {showSuggestions && (
        <div className="absolute bottom-20 left-4 z-40 w-80 max-h-48 overflow-y-auto rounded-2xl border border-black/8 shadow-lg bg-white/95 backdrop-blur-md p-1.5 flex flex-col gap-0.5 custom-scrollbar">
          <div className="px-2.5 py-1.5 text-[9px] font-black uppercase text-neutral-400 tracking-wider border-b border-black/5 mb-1 shrink-0">
            Slash Commands
          </div>
          {COMMANDS.filter(cmd => cmd.name.startsWith(suggestionsFilter)).map((cmd) => (
            <button
              key={cmd.name}
              type="button"
              onClick={() => {
                setInputText(cmd.name + " ");
                setShowSuggestions(false);
              }}
              className="flex flex-col text-left px-2.5 py-1.5 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
            >
              <span className="text-xs font-black text-neutral-900">{cmd.name}</span>
              <span className="text-[10px] text-neutral-500 font-medium leading-normal mt-0.5">{cmd.desc}</span>
            </button>
          ))}
          {COMMANDS.filter(cmd => cmd.name.startsWith(suggestionsFilter)).length === 0 && (
            <span className="text-[10px] text-neutral-450 italic px-2.5 py-2 font-bold text-center">Command not found</span>
          )}
        </div>
      )}

      {/* Input Area */}
      <LiquidGlassSurface 
        variant="frosted-glass" 
        tone={activeTheme.glassTone} 
        effect="default"
        className="p-3 border-t border-black/8 z-10 flex items-end gap-2.5"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <button 
          onClick={handleAttachClick}
          className="p-2.5 text-neutral-500 hover:bg-black/5 hover:text-neutral-800 rounded-full transition-all shrink-0"
          title="Attach File"
        >
          <Paperclip className="w-4.5 h-4.5" />
        </button>

        <div className="flex-1 bg-black/4 border border-black/6 rounded-[22px] px-3.5 py-2 flex items-end gap-2 text-neutral-800 focus-within:bg-white focus-within:border-black/15 focus-within:shadow-xs transition-all">
          <AutoResizeTextarea
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              editingMessage
                ? "Edit message..."
                : replyingToMessage
                ? "Reply to message..."
                : chat.type === "bot"
                ? "Ask Antigravity assistant... (type / for commands)"
                : "Type a message... (type / for commands)"
            }
            rows={1}
            maxHeight={96}
            className="flex-1 bg-transparent border-none outline-none text-sm font-semibold py-0.5 placeholder-neutral-400 no-scrollbar leading-5"
          />
          <button 
            type="button"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="p-0.5 text-neutral-500 hover:text-neutral-800 transition-colors shrink-0"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleSend}
          className="p-3 text-white rounded-full shadow-md transition-all shrink-0 hover:scale-105 active:scale-95 hover:brightness-110"
          style={{ backgroundColor: activeTheme.accentColor }}
          title="Send"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </LiquidGlassSurface>

      {/* Emoji Picker Glass Panel */}
      {isPickerOpen && (
        <div className="absolute bottom-20 right-4 z-40">
          <LiquidGlassSurface
            variant="frosted-glass"
            tone={activeTheme.glassTone}
            effect="amplified"
            className="w-72 h-80 rounded-[24px] shadow-lg border border-black/8 flex flex-col overflow-hidden bg-white/60"
          >
            <div className="px-4 py-2.5 border-b border-black/8 bg-white/40 flex items-center justify-between">
              <span className="text-xs font-black text-neutral-800 uppercase tracking-wider">Emoji Picker</span>
              <button 
                onClick={() => setIsPickerOpen(false)}
                className="text-neutral-500 hover:text-neutral-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.title} className="space-y-1.5">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wide block">{cat.title}</span>
                  <div className="grid grid-cols-6 gap-1.5">
                    {cat.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setInputText((prev) => prev + emoji);
                          setIsPickerOpen(false);
                        }}
                        className="text-2xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-black/5 flex items-center justify-center cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlassSurface>
        </div>
      )}

      {/* Destructive Confirm Dialogs from design system (@synarava/ui-kit) */}
      <DestructiveActionDialog
        open={!!msgToDeleteId}
        saving={false}
        eyebrow="Delete Message"
        title="Delete Message?"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setMsgToDeleteId(null)}
        onConfirm={() => {
          if (msgToDeleteId) {
            onDeleteMessage(msgToDeleteId);
            setMsgToDeleteId(null);
          }
        }}
      />

      <DestructiveActionDialog
        open={showClearConfirm}
        saving={false}
        eyebrow="Clear History"
        title="Clear conversation?"
        description="Are you sure you want to clear this conversation? All messages will be permanently deleted."
        confirmLabel="Clear"
        cancelLabel="Cancel"
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={() => {
          onClearChat?.();
          setShowClearConfirm(false);
        }}
      />
    </div>
  );
}
