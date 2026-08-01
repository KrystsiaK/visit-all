-- Migration: 023_admin_telemetry.sql
-- Description: Adds user roles, telemetry logs, and service integration settings.

-- 1. Add role column to users table with valid options
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'support', 'admin', 'superadmin'));

-- 2. Promote the default demo Curator account to superadmin
UPDATE users SET role = 'superadmin' WHERE email = 'demo@visitall.com';

-- 3. Create telemetry logs table
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index telemetry logs for performance
CREATE INDEX IF NOT EXISTS telemetry_logs_event_type_idx ON telemetry_logs(event_type);
CREATE INDEX IF NOT EXISTS telemetry_logs_created_at_idx ON telemetry_logs(created_at DESC);

-- 4. Create system integrations table
CREATE TABLE IF NOT EXISTS system_integrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    api_key TEXT DEFAULT NULL,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Seed default configurations for system integrations
INSERT INTO system_integrations (id, name, enabled, api_key, settings) VALUES
('google_analytics', 'Google Analytics', false, null, '{"measurement_id": ""}'::jsonb),
('sentry', 'Sentry Error Reporting', false, null, '{"dsn": "", "environment": "production"}'::jsonb),
('telemetry_api', 'Telemetry API Sync', false, null, '{"endpoint": "", "sync_interval_seconds": 60}'::jsonb),
('stripe_billing', 'Stripe Billing System', false, null, '{"webhook_secret": "", "sandbox_mode": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed mock analytics logs for the last 7 days to populate overview charts
INSERT INTO telemetry_logs (user_id, event_type, metadata, created_at)
VALUES
(null, 'auth.login', '{"ip": "192.168.1.10", "device": "Chrome Desktop"}'::jsonb, NOW() - INTERVAL '6 days 12 hours'),
(null, 'pin.create', '{"collection_id": "pin", "name": "Modern Art Gallery"}'::jsonb, NOW() - INTERVAL '5 days 14 hours'),
(null, 'auth.login', '{"ip": "192.168.1.12", "device": "Safari Mobile"}'::jsonb, NOW() - INTERVAL '5 days 2 hours'),
(null, 'trace.create', '{"length_meters": 450}'::jsonb, NOW() - INTERVAL '4 days 20 hours'),
(null, 'pin.create', '{"collection_id": "pin", "name": "Vondelpark Cafe"}'::jsonb, NOW() - INTERVAL '4 days 18 hours'),
(null, 'area.create', '{"color": "#b7102a"}'::jsonb, NOW() - INTERVAL '3 days 22 hours'),
(null, 'auth.login', '{"ip": "192.168.1.15", "device": "Firefox Desktop"}'::jsonb, NOW() - INTERVAL '3 days 10 hours'),
(null, 'billing.purchase', '{"amount_usd": 19.99, "plan": "pro_monthly"}'::jsonb, NOW() - INTERVAL '3 days 8 hours'),
(null, 'pin.create', '{"collection_id": "pin", "name": "Design District"}'::jsonb, NOW() - INTERVAL '2 days 16 hours'),
(null, 'trace.create', '{"length_meters": 1820}'::jsonb, NOW() - INTERVAL '2 days 6 hours'),
(null, 'auth.login', '{"ip": "192.168.1.20", "device": "Chrome Desktop"}'::jsonb, NOW() - INTERVAL '1 day 22 hours'),
(null, 'billing.purchase', '{"amount_usd": 149.00, "plan": "pro_yearly"}'::jsonb, NOW() - INTERVAL '1 day 18 hours'),
(null, 'pin.create', '{"collection_id": "pin", "name": "Rijksmuseum"}'::jsonb, NOW() - INTERVAL '1 day 4 hours'),
(null, 'auth.login', '{"ip": "192.168.1.22", "device": "Safari Mobile"}'::jsonb, NOW() - INTERVAL '8 hours'),
(null, 'widget.create', '{"widget_slug": "global_overview"}'::jsonb, NOW() - INTERVAL '4 hours'),
(null, 'pin.create', '{"collection_id": "pin", "name": "Canal Viewpoint"}'::jsonb, NOW() - INTERVAL '2 hours');
