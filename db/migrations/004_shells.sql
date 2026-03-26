CREATE TABLE IF NOT EXISTS shell_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'panel',
    scope TEXT NOT NULL DEFAULT 'app',
    default_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    default_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shell_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID NOT NULL REFERENCES shell_definitions(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL DEFAULT 'user',
    owner_id TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS shell_instances_owner_definition_idx
    ON shell_instances (owner_type, owner_id, definition_id);

CREATE INDEX IF NOT EXISTS shell_definitions_scope_kind_idx
    ON shell_definitions (scope, kind);

INSERT INTO shell_definitions (
    slug,
    name,
    kind,
    scope,
    default_config,
    default_state,
    is_system
)
VALUES (
    'left_sidebar',
    'Left Sidebar',
    'panel',
    'app',
    '{
      "version": 1,
      "placement": "left",
      "sizePreset": "regular",
      "width": 360,
      "motionPreset": "sidebar-soft",
      "sections": {
        "header": true,
        "search": true,
        "modeSwitch": true,
        "collections": true,
        "controls": true,
        "actions": true
      }
    }'::jsonb,
    '{
      "hidden": false,
      "collapsed": false
    }'::jsonb,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;
