-- Migration: 019_saved_messages.sql
-- Description: Seeds a "Saved Messages" chat (direct chat with self) for the Demo User if it doesn't already exist.

DO $$
DECLARE
    demo_user_id UUID := '11111111-1111-1111-1111-111111111111';
    saved_chat_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE id = demo_user_id) THEN
        
        -- Check if a direct chat with only the demo user exists
        SELECT c.id INTO saved_chat_id
        FROM messenger_chats c
        INNER JOIN messenger_participants p ON p.chat_id = c.id
        WHERE c.type = 'direct'
        GROUP BY c.id
        HAVING COUNT(p.user_id) = 1 AND MAX(p.user_id::text) = demo_user_id::text;

        -- If it doesn't exist, create it
        IF saved_chat_id IS NULL THEN
            INSERT INTO messenger_chats (name, type, description)
            VALUES ('Saved Messages', 'direct', 'Ваше личное облако для заметок и файлов (Saved Messages).')
            RETURNING id INTO saved_chat_id;

            -- Add the demo user as the single participant
            INSERT INTO messenger_participants (chat_id, user_id, role)
            VALUES (saved_chat_id, demo_user_id, 'owner');

            -- Seed a welcoming message
            INSERT INTO messenger_messages (chat_id, sender_id, content, created_at)
            VALUES (
                saved_chat_id, 
                demo_user_id, 
                'Добро пожаловать в ваше личное хранилище (Saved Messages)! 🚀 Здесь можно сохранять заметки, ссылки, медиафайлы или пересылать сообщения из других чатов.', 
                NOW()
            );
        END IF;

    END IF;
END $$;
