ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_style TEXT NOT NULL DEFAULT 'mondrian-primary';

UPDATE users
SET email_verified_at = COALESCE(email_verified_at, NOW()),
    updated_at = NOW()
WHERE password_hash IS NOT NULL
  AND email_verified_at IS NULL;
