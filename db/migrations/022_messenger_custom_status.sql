-- Migration: 022_messenger_custom_status.sql
-- Description: Adds a custom_status column to the users table to store Slack-like statuses.

ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_status TEXT DEFAULT NULL;
