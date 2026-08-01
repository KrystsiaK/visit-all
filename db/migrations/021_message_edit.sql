-- Migration: 021_message_edit.sql
-- Description: Adds is_edited column to messenger_messages to track edited messages.

ALTER TABLE messenger_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
