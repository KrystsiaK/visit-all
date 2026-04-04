ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS password_algorithm TEXT NOT NULL DEFAULT 'scrypt',
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE users
SET
  password_hash = COALESCE(password_hash, password),
  password_algorithm = CASE
    WHEN password_hash IS NOT NULL THEN password_algorithm
    WHEN password IS NOT NULL THEN 'bcrypt'
    ELSE password_algorithm
  END,
  updated_at = NOW()
WHERE password_hash IS NULL OR password IS NOT NULL;

CREATE TABLE IF NOT EXISTS user_email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_email_verification_tokens_user_idx
  ON user_email_verification_tokens (user_id, expires_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS user_email_verification_tokens_active_token_idx
  ON user_email_verification_tokens (token_hash)
  WHERE consumed_at IS NULL;
