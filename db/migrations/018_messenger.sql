-- Migration: 018_messenger.sql
-- Description: Creates tables for the messenger module and seeds initial chats.

CREATE TABLE IF NOT EXISTS messenger_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT, -- Null for direct messages, set for groups/channels
    type TEXT NOT NULL CHECK (type IN ('direct', 'group', 'channel', 'bot')),
    description TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messenger_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES messenger_chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messenger_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES messenger_chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Null if sent by system or external integration
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'document', 'voice', 'video')),
    reply_to_id UUID REFERENCES messenger_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS messenger_participants_chat_idx ON messenger_participants(chat_id);
CREATE INDEX IF NOT EXISTS messenger_participants_user_idx ON messenger_participants(user_id);
CREATE INDEX IF NOT EXISTS messenger_messages_chat_created_idx ON messenger_messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messenger_messages_sender_idx ON messenger_messages(sender_id);

-- Seed Bot and Mock Users if they do not exist
-- Including mock password hashes to satisfy NOT NULL constraints on the users table
INSERT INTO users (id, email, password, password_hash, password_algorithm, display_name, avatar_style, status, email_verified_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000000', 
    'bot@antigravity.ai', 
    '$2b$10$z/DTGEAkXxrqnRvFlNeV2OBQzp2rvXw8q7rYwpr5FU1YC/k6a.jga', 
    '$2b$10$z/DTGEAkXxrqnRvFlNeV2OBQzp2rvXw8q7rYwpr5FU1YC/k6a.jga', 
    'bcrypt', 
    'Antigravity Assistant', 
    'bot-accent', 
    'active', 
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'sophia@visitall.com', 
    '$2b$10$z/DTGEAkXxrqnRvFlNeV2OBQzp2rvXw8q7rYwpr5FU1YC/k6a.jga', 
    '$2b$10$z/DTGEAkXxrqnRvFlNeV2OBQzp2rvXw8q7rYwpr5FU1YC/k6a.jga', 
    'bcrypt', 
    'Sophia Chen', 
    'mondrian-accent', 
    'active', 
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    'alex@visitall.com', 
    '$2b$10$z/DTGEAkXxrqnRvFlNeV2OBQzp2rvXw8q7rYwpr5FU1YC/k6a.jga', 
    '$2b$10$z/DTGEAkXxrqnRvFlNeV2OBQzp2rvXw8q7rYwpr5FU1YC/k6a.jga', 
    'bcrypt', 
    'Alex Krystsia', 
    'mondrian-primary', 
    'active', 
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Seed Chats and Participants for Demo User (11111111-1111-1111-1111-111111111111)
-- Only run seeds if the demo user exists
DO $$
DECLARE
    demo_user_id UUID := '11111111-1111-1111-1111-111111111111';
    bot_user_id UUID := '00000000-0000-0000-0000-000000000000';
    sophia_user_id UUID := '22222222-2222-2222-2222-222222222222';
    alex_user_id UUID := '33333333-3333-3333-3333-333333333333';
    
    bot_chat_id UUID;
    direct_chat_id UUID;
    group_chat_id UUID;
    channel_chat_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE id = demo_user_id) THEN
        
        -- 1. Bot Chat
        INSERT INTO messenger_chats (name, type, description)
        VALUES ('Antigravity Assistant', 'bot', 'Your friendly helper AI inside Visit All.')
        RETURNING id INTO bot_chat_id;

        INSERT INTO messenger_participants (chat_id, user_id, role) VALUES
            (bot_chat_id, demo_user_id, 'member'),
            (bot_chat_id, bot_user_id, 'admin');

        INSERT INTO messenger_messages (chat_id, sender_id, content, created_at) VALUES
            (bot_chat_id, bot_user_id, 'Привет! Я твой ассистент Antigravity. Задай мне любой вопрос о картах, маршрутах или коллекциях в Visit All, и я с радостью отвечу!', NOW() - INTERVAL '1 hour');

        -- 2. Direct Chat with Sophia
        INSERT INTO messenger_chats (type)
        VALUES ('direct')
        RETURNING id INTO direct_chat_id;

        INSERT INTO messenger_participants (chat_id, user_id, role) VALUES
            (direct_chat_id, demo_user_id, 'member'),
            (direct_chat_id, sophia_user_id, 'member');

        INSERT INTO messenger_messages (chat_id, sender_id, content, created_at) VALUES
            (direct_chat_id, sophia_user_id, 'Привет! Ты закончил карту новых маршрутов в центре города? Выглядит здорово!', NOW() - INTERVAL '2 hours'),
            (direct_chat_id, demo_user_id, 'Привет! Да, почти закончил. Осталось сгладить несколько углов с помощью кривых Безье.', NOW() - INTERVAL '1 hour 50 minutes'),
            (direct_chat_id, sophia_user_id, 'Отлично! Скинь ссылку на коллекцию, когда будешь готов поделиться.', NOW() - INTERVAL '1 hour 30 minutes');

        -- 3. Group Chat (Curators Club)
        INSERT INTO messenger_chats (name, type, description)
        VALUES ('Curators Club 🗺️', 'group', 'Group chat for map curators and geolocation enthusiasts.')
        RETURNING id INTO group_chat_id;

        INSERT INTO messenger_participants (chat_id, user_id, role) VALUES
            (group_chat_id, demo_user_id, 'owner'),
            (group_chat_id, sophia_user_id, 'member'),
            (group_chat_id, alex_user_id, 'member');

        INSERT INTO messenger_messages (chat_id, sender_id, content, created_at) VALUES
            (group_chat_id, alex_user_id, 'Всем привет! Добавил новые точки для посещения в Минске. Посмотрите в общей папке.', NOW() - INTERVAL '5 hours'),
            (group_chat_id, sophia_user_id, 'О, класс! Надо будет устроить прогулку по выходным.', NOW() - INTERVAL '4 hours 30 minutes'),
            (group_chat_id, demo_user_id, 'Да, отличная идея! Погода обещает быть отличной.', NOW() - INTERVAL '4 hours');

        -- 4. Channel (Announcements)
        INSERT INTO messenger_chats (name, type, description)
        VALUES ('Visit All Announcements 📢', 'channel', 'Official news and updates from Visit All team.')
        RETURNING id INTO channel_chat_id;

        INSERT INTO messenger_participants (chat_id, user_id, role) VALUES
            (channel_chat_id, demo_user_id, 'member'),
            (channel_chat_id, alex_user_id, 'admin');

        INSERT INTO messenger_messages (chat_id, sender_id, content, created_at) VALUES
            (channel_chat_id, alex_user_id, '🎉 Добро пожаловать на официальный канал Visit All! Здесь будут публиковаться все новости, обновления дизайна и новые фичи. Оставайтесь с нами!', NOW() - INTERVAL '1 day');

    END IF;
END $$;
