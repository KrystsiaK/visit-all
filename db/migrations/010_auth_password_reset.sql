CREATE TABLE IF NOT EXISTS user_password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_password_reset_tokens_user_id_idx
  ON user_password_reset_tokens (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_password_reset_tokens_email_idx
  ON user_password_reset_tokens (email);
