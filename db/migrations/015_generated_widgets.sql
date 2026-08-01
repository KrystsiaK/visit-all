CREATE TABLE IF NOT EXISTS generated_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Widget identity (from WidgetDefinition contract)
    widget_key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Generated source code (raw JSX — compiled at runtime via executor)
    component_code TEXT NOT NULL,

    -- Port declarations (JSON array of PortDefinition)
    ports JSONB NOT NULL DEFAULT '[]',

    -- Chat transcript that produced this widget
    chat_history JSONB NOT NULL DEFAULT '[]',

    -- Lifecycle
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS generated_widgets_user_status_idx
    ON generated_widgets (user_id, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS generated_widgets_user_key_idx
    ON generated_widgets (user_id, widget_key);