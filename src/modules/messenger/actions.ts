// src/modules/messenger/actions.ts
"use server";

import { pool } from "@/lib/db";
import { getUserId } from "@/app/actions";
import type { Chat, Message, ChatParticipant, ChatType } from "./types";

/**
 * Helper to ensure a new user has the default chats (Saved Messages, Bot, Sophia Chen, Curators group, Announcements).
 */
async function ensureDefaultChatsForUser(userId: string) {
  // Check if user has any chats
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int as count FROM messenger_participants WHERE user_id = $1::uuid`,
    [userId]
  );
  
  if (rows[0] && rows[0].count > 0) {
    return;
  }

  const botUserId = "00000000-0000-0000-0000-000000000000";
  const sophiaUserId = "22222222-2222-2222-2222-222222222222";
  const alexUserId = "33333333-3333-3333-3333-333333333333";

  // 1. Saved Messages (chat with self)
  const savedChatResult = await pool.query(
    `INSERT INTO messenger_chats (name, type, description) VALUES ('Saved Messages', 'direct', 'Your personal cloud for notes and files.') RETURNING id`
  );
  const savedChatId = savedChatResult.rows[0].id;
  await pool.query(
    `INSERT INTO messenger_participants (chat_id, user_id, role) VALUES ($1::uuid, $2::uuid, 'owner')`,
    [savedChatId, userId]
  );
  await pool.query(
    `INSERT INTO messenger_messages (chat_id, sender_id, content) VALUES ($1::uuid, $2::uuid, 'Welcome to your personal storage (Saved Messages)! 🚀 Save notes, links, files or forward messages here.')`,
    [savedChatId, userId]
  );

  // 2. Antigravity Assistant Bot
  const botChatResult = await pool.query(
    `INSERT INTO messenger_chats (name, type, description) VALUES ('Antigravity Assistant', 'bot', 'Your friendly helper AI inside Visit All.') RETURNING id`
  );
  const botChatId = botChatResult.rows[0].id;
  await pool.query(
    `INSERT INTO messenger_participants (chat_id, user_id, role) VALUES ($1::uuid, $2::uuid, 'member'), ($1::uuid, $3::uuid, 'admin')`,
    [botChatId, userId, botUserId]
  );
  await pool.query(
    `INSERT INTO messenger_messages (chat_id, sender_id, content) VALUES ($1::uuid, $2::uuid, 'Hi! I am your Antigravity assistant. Ask me any question about maps, traces, or collections in Visit All, and I will gladly answer!')`,
    [botChatId, botUserId]
  );

  // 3. Sophia Chen Direct Chat
  const sophiaChatResult = await pool.query(
    `INSERT INTO messenger_chats (type) VALUES ('direct') RETURNING id`
  );
  const sophiaChatId = sophiaChatResult.rows[0].id;
  await pool.query(
    `INSERT INTO messenger_participants (chat_id, user_id, role) VALUES ($1::uuid, $2::uuid, 'member'), ($1::uuid, $3::uuid, 'member')`,
    [sophiaChatId, userId, sophiaUserId]
  );
  await pool.query(
    `INSERT INTO messenger_messages (chat_id, sender_id, content, created_at) VALUES 
      ($1::uuid, $2::uuid, 'Hi! Have you finished the map for new traces in the city center? Looks great!', NOW() - INTERVAL '2 hours'),
      ($1::uuid, $3::uuid, 'Hi! Yes, almost done. Just need to smooth some corners using Bezier curves.', NOW() - INTERVAL '1 hour 50 minutes'),
      ($1::uuid, $2::uuid, 'Great! Share the collection link when you are ready.', NOW() - INTERVAL '1 hour 30 minutes')`,
    [sophiaChatId, sophiaUserId, userId]
  );

  // 4. Curators Club Group
  const groupChatResult = await pool.query(
    `INSERT INTO messenger_chats (name, type, description) VALUES ('Curators Club 🗺️', 'group', 'Group chat for map curators and geolocation enthusiasts.') RETURNING id`
  );
  const groupChatId = groupChatResult.rows[0].id;
  await pool.query(
    `INSERT INTO messenger_participants (chat_id, user_id, role) VALUES ($1::uuid, $2::uuid, 'owner'), ($1::uuid, $3::uuid, 'member'), ($1::uuid, $4::uuid, 'member')`,
    [groupChatId, userId, sophiaUserId, alexUserId]
  );
  await pool.query(
    `INSERT INTO messenger_messages (chat_id, sender_id, content, created_at) VALUES 
      ($1::uuid, $2::uuid, 'Hello everyone! Added new places to visit in Minsk. Take a look in the shared folder.', NOW() - INTERVAL '5 hours'),
      ($1::uuid, $3::uuid, 'Oh, nice! We should arrange a walk on the weekend.', NOW() - INTERVAL '4 hours 30 minutes'),
      ($1::uuid, $4::uuid, 'Yes, great idea! The weather looks perfect.', NOW() - INTERVAL '4 hours')`,
    [groupChatId, alexUserId, sophiaUserId, userId]
  );

  // 5. Announcements Channel
  const channelChatResult = await pool.query(
    `INSERT INTO messenger_chats (name, type, description) VALUES ('Visit All Announcements 📢', 'channel', 'Official news and updates from Visit All team.') RETURNING id`
  );
  const channelChatId = channelChatResult.rows[0].id;
  await pool.query(
    `INSERT INTO messenger_participants (chat_id, user_id, role) VALUES ($1::uuid, $2::uuid, 'member'), ($1::uuid, $3::uuid, 'admin')`,
    [channelChatId, userId, alexUserId]
  );
  await pool.query(
    `INSERT INTO messenger_messages (chat_id, sender_id, content, created_at) VALUES 
      ($1::uuid, $2::uuid, '🎉 Welcome to the official Visit All channel! Stay tuned for news, design updates, and new features!', NOW() - INTERVAL '1 day')`,
    [channelChatId, alexUserId]
  );
}

/**
 * Fetches all chats for the currently logged-in user.
 */
export async function getChats(): Promise<Chat[]> {
  const userId = await getUserId();
  await ensureDefaultChatsForUser(userId);


  const query = `
    SELECT 
      c.id,
      c.name,
      c.type,
      c.description,
      c.avatar_url as "avatarUrl",
      c.created_at,
      c.updated_at,
      COALESCE(
        (SELECT COUNT(*)::int 
         FROM messenger_messages m 
         WHERE m.chat_id = c.id 
           AND m.is_read = FALSE 
           AND m.sender_id != $1::uuid), 0
      ) as "unreadCount"
    FROM messenger_chats c
    INNER JOIN messenger_participants p ON p.chat_id = c.id
    WHERE p.user_id = $1::uuid
    ORDER BY c.updated_at DESC
  `;

  const { rows: chatRows } = await pool.query(query, [userId]);

  const chats: Chat[] = [];

  for (const row of chatRows) {
    // Fetch participants
    const participantsQuery = `
      SELECT 
        u.id,
        u.display_name as "displayName",
        u.email,
        u.avatar_style as "avatarStyle",
        u.status,
        u.custom_status as "customStatus",
        p.role
      FROM users u
      INNER JOIN messenger_participants p ON p.user_id = u.id
      WHERE p.chat_id = $1::uuid
    `;
    const { rows: participantRows } = await pool.query(participantsQuery, [row.id]);

    // Fetch last message
    const lastMessageQuery = `
      SELECT 
        m.content,
        m.created_at,
        u.display_name as "senderName"
      FROM messenger_messages m
      LEFT JOIN users u ON u.id = m.sender_id
      WHERE m.chat_id = $1::uuid
      ORDER BY m.created_at DESC
      LIMIT 1
    `;
    const { rows: lastMsgRows } = await pool.query(lastMessageQuery, [row.id]);

    chats.push({
      id: row.id,
      name: row.name,
      type: row.type as ChatType,
      description: row.description,
      avatarUrl: row.avatarUrl,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      unreadCount: row.unreadCount,
      lastMessage: lastMsgRows[0] ? {
        content: lastMsgRows[0].content,
        created_at: lastMsgRows[0].created_at.toISOString(),
        senderName: lastMsgRows[0].senderName || undefined
      } : undefined,
      participants: participantRows as ChatParticipant[]
    });
  }

  return chats;
}

/**
 * Fetches all messages in a chat, sorted by created_at.
 */
export async function getMessages(chatId: string): Promise<Message[]> {
  await getUserId(); // Assert authorized

  const query = `
    SELECT 
      m.id,
      m.chat_id as "chatId",
      m.sender_id as "senderId",
      COALESCE(u.display_name, 'System') as "senderName",
      COALESCE(u.avatar_style, 'mondrian-primary') as "senderAvatarStyle",
      m.content,
      m.media_url as "mediaUrl",
      m.media_type as "mediaType",
      m.reply_to_id as "replyToId",
      m.created_at,
      m.is_read as "isRead",
      m.reactions as "reactions",
      m.is_edited as "isEdited"
    FROM messenger_messages m
    LEFT JOIN users u ON u.id = m.sender_id
    WHERE m.chat_id = $1::uuid
    ORDER BY m.created_at ASC
  `;

  const { rows } = await pool.query(query, [chatId]);

  return rows.map((r) => ({
    id: r.id,
    chatId: r.chatId,
    senderId: r.senderId,
    senderName: r.senderName,
    senderAvatarStyle: r.senderAvatarStyle,
    content: r.content,
    mediaUrl: r.mediaUrl,
    mediaType: r.mediaType,
    replyToId: r.replyToId,
    created_at: r.created_at.toISOString(),
    isRead: r.isRead,
    reactions: r.reactions || {},
    isEdited: r.isEdited || false
  }));
}

/**
 * Marks all messages in a chat as read.
 */
export async function markAsRead(chatId: string): Promise<{ ok: boolean }> {
  const userId = await getUserId();

  await pool.query(
    `
      UPDATE messenger_messages
      SET is_read = TRUE
      WHERE chat_id = $1::uuid
        AND sender_id != $2::uuid
        AND is_read = FALSE
    `,
    [chatId, userId]
  );

  return { ok: true };
}

/**
 * Sends a message and triggers bot responses if the chat is a bot.
 */
export async function sendMessage(
  chatId: string, 
  content: string, 
  mediaUrl?: string | null,
  mediaType?: "image" | "document" | "voice" | "video" | null,
  replyToId?: string | null
): Promise<Message> {
  const userId = await getUserId();

  const insertQuery = `
    INSERT INTO messenger_messages (chat_id, sender_id, content, media_url, media_type, reply_to_id)
    VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6::uuid)
    RETURNING id, chat_id as "chatId", sender_id as "senderId", content, media_url as "mediaUrl", media_type as "mediaType", reply_to_id as "replyToId", created_at, is_read as "isRead"
  `;

  const { rows } = await pool.query(insertQuery, [
    chatId,
    userId,
    content,
    mediaUrl || null,
    mediaType || null,
    replyToId || null
  ]);

  const inserted = rows[0];

  // Update chat updated_at timestamp
  await pool.query(
    `UPDATE messenger_chats SET updated_at = NOW() WHERE id = $1::uuid`,
    [chatId]
  );

  // Fetch sender details
  const senderQuery = `SELECT display_name as "name", avatar_style as "avatarStyle" FROM users WHERE id = $1::uuid`;
  const { rows: senderRows } = await pool.query(senderQuery, [userId]);
  const sender = senderRows[0];

  const resultMsg: Message = {
    id: inserted.id,
    chatId: inserted.chatId,
    senderId: inserted.senderId,
    senderName: sender?.name || "Me",
    senderAvatarStyle: sender?.avatarStyle || "mondrian-primary",
    content: inserted.content,
    mediaUrl: inserted.mediaUrl,
    mediaType: inserted.mediaType,
    replyToId: inserted.replyToId,
    created_at: inserted.created_at.toISOString(),
    isRead: inserted.isRead,
    reactions: {},
    isEdited: false
  };

  // Check if chat is a Bot chat and trigger automated response in the background
  const chatQuery = `SELECT type FROM messenger_chats WHERE id = $1::uuid`;
  const { rows: chatRows } = await pool.query(chatQuery, [chatId]);
  
  if (chatRows[0]?.type === 'bot') {
    // Trigger bot reply asynchronously
    void triggerBotReply(chatId, content);
  }

  return resultMsg;
}

/**
 * Toggles an emoji reaction on a message for the currently logged-in user.
 */
export async function toggleReaction(
  messageId: string, 
  emoji: string
): Promise<Record<string, string[]>> {
  const userId = await getUserId();

  const selectQuery = `SELECT reactions FROM messenger_messages WHERE id = $1::uuid`;
  const { rows } = await pool.query(selectQuery, [messageId]);
  if (rows.length === 0) {
    throw new Error("Message not found");
  }

  const currentReactions: Record<string, string[]> = rows[0].reactions || {};
  const usersList = currentReactions[emoji] || [];

  let updatedUsersList: string[];
  if (usersList.includes(userId)) {
    // Remove reaction
    updatedUsersList = usersList.filter((uid) => uid !== userId);
  } else {
    // Add reaction
    updatedUsersList = [...usersList, userId];
  }

  const updatedReactions = { ...currentReactions };
  if (updatedUsersList.length === 0) {
    delete updatedReactions[emoji];
  } else {
    updatedReactions[emoji] = updatedUsersList;
  }

  const updateQuery = `
    UPDATE messenger_messages
    SET reactions = $1::jsonb
    WHERE id = $2::uuid
    RETURNING reactions
  `;
  const updateResult = await pool.query(updateQuery, [JSON.stringify(updatedReactions), messageId]);
  return updateResult.rows[0].reactions;
}


/**
 * Fetches other users that the current user can start a chat with.
 */
export async function getAvailableContacts(): Promise<ChatParticipant[]> {
  const userId = await getUserId();

  const query = `
    SELECT id, display_name as "displayName", email, avatar_style as "avatarStyle", status, custom_status as "customStatus", 'member' as role
    FROM users
    WHERE id != $1::uuid
      AND email != 'bot@antigravity.ai'
    ORDER BY display_name ASC
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows as ChatParticipant[];
}

/**
 * Creates or retrieves a direct chat between the current user and target user.
 */
export async function createDirectChat(targetUserId: string): Promise<string> {
  const userId = await getUserId();

  // Handle self-chat (Saved Messages)
  if (targetUserId === userId) {
    const checkSelfQuery = `
      SELECT p.chat_id
      FROM messenger_participants p
      INNER JOIN messenger_chats c ON c.id = p.chat_id
      WHERE c.type = 'direct'
      GROUP BY p.chat_id
      HAVING COUNT(p.user_id) = 1 AND MAX(p.user_id::text) = $1::text
      LIMIT 1
    `;
    const { rows: selfRows } = await pool.query(checkSelfQuery, [userId]);
    if (selfRows[0]) {
      return selfRows[0].chat_id;
    }

    const insertChatQuery = `
      INSERT INTO messenger_chats (type)
      VALUES ('direct')
      RETURNING id
    `;
    const { rows: chatRows } = await pool.query(insertChatQuery);
    const chatId = chatRows[0].id;

    await pool.query(
      `
        INSERT INTO messenger_participants (chat_id, user_id, role)
        VALUES ($1::uuid, $2::uuid, 'owner')
      `,
      [chatId, userId]
    );

    return chatId;
  }

  // 1. Check if direct chat already exists with another user
  const checkQuery = `
    SELECT p1.chat_id
    FROM messenger_participants p1
    INNER JOIN messenger_participants p2 ON p1.chat_id = p2.chat_id
    INNER JOIN messenger_chats c ON c.id = p1.chat_id
    WHERE c.type = 'direct'
      AND p1.user_id = $1::uuid
      AND p2.user_id = $2::uuid
      AND p1.id != p2.id
    LIMIT 1
  `;
  const { rows: checkRows } = await pool.query(checkQuery, [userId, targetUserId]);

  if (checkRows[0]) {
    return checkRows[0].chat_id;
  }

  // 2. Create new direct chat
  const insertChatQuery = `
    INSERT INTO messenger_chats (type)
    VALUES ('direct')
    RETURNING id
  `;
  const { rows: chatRows } = await pool.query(insertChatQuery);
  const chatId = chatRows[0].id;

  // 3. Add participants
  await pool.query(
    `
      INSERT INTO messenger_participants (chat_id, user_id, role)
      VALUES 
        ($1::uuid, $2::uuid, 'member'),
        ($1::uuid, $3::uuid, 'member')
    `,
    [chatId, userId, targetUserId]
  );

  return chatId;
}

/**
 * Background runner that processes bot responses.
 */
async function triggerBotReply(chatId: string, userMessage: string) {
  const botUserId = "00000000-0000-0000-0000-000000000000";
  
  // Wait 1.2 seconds to simulate writing/thinking
  await new Promise((resolve) => setTimeout(resolve, 1200));

  let reply = "";
  const cleanMsg = userMessage.toLowerCase().trim();

  if (cleanMsg.includes("привет") || cleanMsg.includes("hello") || cleanMsg.includes("hi") || cleanMsg.includes("start")) {
    reply = "Hi! I am your Antigravity assistant. Choose a topic:\n\n[🗺️ About Maps](/map) [📈 About Framework](/framework) [🌸 Switch Theme](/theme-sakura)";
  } else if (cleanMsg.includes("карт") || cleanMsg.includes("map")) {
    reply = "Visit All uses MapLibre GL library for vector maps rendering.\n\n[📈 About Framework](/framework) [ℹ️ Help](/help)";
  } else if (cleanMsg.includes("маршрут") || cleanMsg.includes("путь") || cleanMsg.includes("trace")) {
    reply = "Traces are drawn by clicking on the map. Vertices are draggable. Lines are smoothed with Bezier curves.\n\n[🗺️ About Maps](/map) [ℹ️ Help](/help)";
  } else if (cleanMsg.includes("ui") || cleanMsg.includes("shell") || cleanMsg.includes("widget") || cleanMsg.includes("framework")) {
    reply = "The UI architecture is built on `@synarava/shell-kit` framework. Modules communicate via Signals.\n\n[🗺️ About Maps](/map) [🌸 Switch Theme](/theme-sakura)";
  } else if (cleanMsg.includes("погода") || cleanMsg.includes("weather")) {
    reply = "The weather widget is currently in development. But we can connect a weather API and link it to the map!\n\n[🗺️ About Maps](/map) [ℹ️ Help](/help)";
  } else if (cleanMsg.includes("календарь") || cleanMsg.includes("calendar")) {
    reply = "We plan to add a calendar widget for events on geo-pins!\n\n[🗺️ About Maps](/map) [ℹ️ Help](/help)";
  } else {
    reply = "I am still learning, but I will gladly help you with the Visit All project. Select a topic:\n\n[🗺️ About Maps](/map) [📈 About Framework](/framework) [ℹ️ Help](/help)";
  }

  // Insert bot message
  await pool.query(
    `
      INSERT INTO messenger_messages (chat_id, sender_id, content)
      VALUES ($1::uuid, $2::uuid, $3)
    `,
    [chatId, botUserId, reply]
  );

  // Update chat updated_at
  await pool.query(
    `UPDATE messenger_chats SET updated_at = NOW() WHERE id = $1::uuid`,
    [chatId]
  );
}

/**
 * Edits the content of an existing message.
 */
export async function editMessage(messageId: string, newContent: string): Promise<{ ok: boolean }> {
  const userId = await getUserId();

  // Verify that the user is the sender of the message
  const checkQuery = `SELECT sender_id FROM messenger_messages WHERE id = $1::uuid`;
  const { rows } = await pool.query(checkQuery, [messageId]);

  if (!rows[0] || rows[0].sender_id !== userId) {
    throw new Error("Unauthorized to edit this message");
  }

  const updateQuery = `
    UPDATE messenger_messages
    SET content = $2, is_edited = TRUE
    WHERE id = $1::uuid
  `;
  await pool.query(updateQuery, [messageId, newContent]);

  return { ok: true };
}

/**
 * Deletes an existing message.
 */
export async function deleteMessage(messageId: string): Promise<{ ok: boolean }> {
  const userId = await getUserId();

  // Verify that the user is the sender of the message or it's a private chat/saved messages
  const checkQuery = `
    SELECT m.sender_id, m.chat_id, c.type 
    FROM messenger_messages m
    JOIN messenger_chats c ON c.id = m.chat_id
    WHERE m.id = $1::uuid
  `;
  const { rows } = await pool.query(checkQuery, [messageId]);

  if (!rows[0]) {
    throw new Error("Message not found");
  }

  const { sender_id, type } = rows[0];

  // User can delete their own messages, or delete any message in direct/bot chats/saved messages
  const canDelete = sender_id === userId || type === "direct" || type === "bot";

  if (!canDelete) {
    throw new Error("Unauthorized to delete this message");
  }

  const deleteQuery = `DELETE FROM messenger_messages WHERE id = $1::uuid`;
  await pool.query(deleteQuery, [messageId]);

  return { ok: true };
}

/**
 * Clears all messages in a specific chat.
 */
export async function clearChat(chatId: string): Promise<{ ok: boolean }> {
  const userId = await getUserId();

  // Verify that the user is a participant of the chat
  const checkQuery = `SELECT 1 FROM messenger_participants WHERE chat_id = $1::uuid AND user_id = $2::uuid`;
  const { rows } = await pool.query(checkQuery, [chatId, userId]);

  if (!rows[0]) {
    throw new Error("Unauthorized to clear this chat");
  }

  const deleteQuery = `DELETE FROM messenger_messages WHERE chat_id = $1::uuid`;
  await pool.query(deleteQuery, [chatId]);

  return { ok: true };
}

/**
 * Updates the custom status text for the current user.
 */
export async function updateCustomStatus(statusText: string | null): Promise<{ ok: boolean }> {
  const userId = await getUserId();
  const query = `
    UPDATE users
    SET custom_status = $2,
        updated_at = NOW()
    WHERE id = $1::uuid
  `;
  await pool.query(query, [userId, statusText ? statusText.trim() : null]);
  return { ok: true };
}



