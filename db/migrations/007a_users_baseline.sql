CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  display_name TEXT,
  avatar_style TEXT NOT NULL DEFAULT 'mondrian-primary',
  password_hash TEXT,
  password_algorithm TEXT NOT NULL DEFAULT 'scrypt',
  email_verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_status_idx
  ON users (status);
