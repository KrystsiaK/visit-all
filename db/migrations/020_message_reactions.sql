-- Migration: 020_message_reactions.sql
-- Description: Adds a jsonb reactions column to messenger_messages for storing user emoji reactions.

ALTER TABLE messenger_messages 
ADD COLUMN IF NOT EXISTS reactions JSONB NOT NULL DEFAULT '{}'::jsonb;
