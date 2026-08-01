// src/modules/messenger/types.ts

export type ChatType = "direct" | "group" | "channel" | "bot";

export interface ChatParticipant {
  id: string;
  displayName: string;
  email: string;
  avatarStyle: string;
  status: string;
  customStatus?: string | null;
  role: "member" | "admin" | "owner";
}

export interface Chat {
  id: string;
  name: string | null;
  type: ChatType;
  description: string | null;
  avatarUrl: string | null;
  created_at: string;
  updated_at: string;
  unreadCount: number;
  lastMessage?: {
    content: string;
    created_at: string;
    senderName?: string;
  };
  participants: ChatParticipant[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string | null;
  senderName: string;
  senderAvatarStyle: string;
  content: string;
  mediaUrl: string | null;
  mediaType: "image" | "document" | "voice" | "video" | null;
  replyToId: string | null;
  created_at: string;
  isRead: boolean;
  reactions?: Record<string, string[]>;
  isEdited?: boolean;
}

export interface MessengerTheme {
  id: string;
  name: string;
  wallpaper: string;
  accentColor: string;
  glassTone: "neutral" | "mist" | "cream" | "rose";
  pattern: "none" | "radial-dot" | "grid" | "cyber-grid" | "hex" | "blossom";
}

export const MESSENGER_THEMES: MessengerTheme[] = [
  {
    id: "sand",
    name: "Classic Sand 🏖️",
    wallpaper: "#efe9dd",
    accentColor: "#2f6bff",
    glassTone: "cream",
    pattern: "radial-dot"
  },
  {
    id: "cinematic",
    name: "Cinematic Glass 🎬",
    wallpaper: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    accentColor: "#06b6d4",
    glassTone: "mist",
    pattern: "grid"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon ⚡",
    wallpaper: "linear-gradient(135deg, #11001c 0%, #220035 50%, #3a005c 100%)",
    accentColor: "#ff007f",
    glassTone: "rose",
    pattern: "cyber-grid"
  },
  {
    id: "emerald",
    name: "Emerald Forest 🌲",
    wallpaper: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f766e 100%)",
    accentColor: "#10b981",
    glassTone: "cream",
    pattern: "radial-dot"
  },
  {
    id: "sakura",
    name: "Sakura Breeze 🌸",
    wallpaper: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)",
    accentColor: "#f43f5e",
    glassTone: "rose",
    pattern: "blossom"
  },
  {
    id: "midnight",
    name: "Midnight Velvet 🌌",
    wallpaper: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
    accentColor: "#a855f7",
    glassTone: "neutral",
    pattern: "hex"
  }
];

