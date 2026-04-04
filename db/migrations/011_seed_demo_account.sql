INSERT INTO users (
  id,
  email,
  display_name,
  avatar_style,
  password,
  password_hash,
  password_algorithm,
  status,
  email_verified_at,
  updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo@visitall.com',
  'Demo Curator',
  'mondrian-primary',
  '$2b$10$z/DTGEAkXxrqnRvFlNeV2OBQzp2rvXw8q7rYwpr5FU1YC/k6a.jga',
  '$2b$10$z/DTGEAkXxrqnRvFlNeV2OBQzp2rvXw8q7rYwpr5FU1YC/k6a.jga',
  'bcrypt',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  avatar_style = EXCLUDED.avatar_style,
  password = EXCLUDED.password,
  password_hash = EXCLUDED.password_hash,
  password_algorithm = EXCLUDED.password_algorithm,
  status = 'active',
  email_verified_at = COALESCE(users.email_verified_at, NOW()),
  updated_at = NOW();
