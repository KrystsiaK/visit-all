ALTER TABLE widget_definitions
    ADD COLUMN IF NOT EXISTS mobility TEXT NOT NULL DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS supports_manual_connections BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS supports_auto_shell_signals BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS settings_schema JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE widget_instances
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'placed',
    ADD COLUMN IF NOT EXISTS locked_to_host BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS runtime_overrides JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE shell_instances
    ADD COLUMN IF NOT EXISTS capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS signal_state JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'widget_definitions_mobility_check'
    ) THEN
        ALTER TABLE widget_definitions
            ADD CONSTRAINT widget_definitions_mobility_check
            CHECK (mobility IN ('free', 'restricted', 'locked'));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'widget_instances_status_check'
    ) THEN
        ALTER TABLE widget_instances
            ADD CONSTRAINT widget_instances_status_check
            CHECK (status IN ('library', 'placed', 'disabled', 'broken'));
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS signal_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_type TEXT NOT NULL,
    signal_key TEXT NOT NULL,
    value_type TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (scope_type, signal_key)
);

CREATE TABLE IF NOT EXISTS widget_ports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_definition_id UUID NOT NULL REFERENCES widget_definitions(id) ON DELETE CASCADE,
    direction TEXT NOT NULL,
    port_key TEXT NOT NULL,
    value_type TEXT NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    auto_bindable BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (widget_definition_id, direction, port_key)
);

CREATE TABLE IF NOT EXISTS shell_signal_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_definition_id UUID NOT NULL REFERENCES widget_definitions(id) ON DELETE CASCADE,
    widget_port_id UUID NOT NULL REFERENCES widget_ports(id) ON DELETE CASCADE,
    signal_definition_id UUID NOT NULL REFERENCES signal_definitions(id) ON DELETE CASCADE,
    binding_mode TEXT NOT NULL DEFAULT 'auto',
    default_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (widget_definition_id, widget_port_id, signal_definition_id)
);

CREATE TABLE IF NOT EXISTS widget_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_widget_instance_id UUID NOT NULL REFERENCES widget_instances(id) ON DELETE CASCADE,
    source_port_id UUID NOT NULL REFERENCES widget_ports(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_widget_instance_id UUID REFERENCES widget_instances(id) ON DELETE CASCADE,
    target_port_id UUID REFERENCES widget_ports(id) ON DELETE CASCADE,
    target_signal_definition_id UUID REFERENCES signal_definitions(id) ON DELETE CASCADE,
    transform_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS signal_definitions_scope_type_idx
    ON signal_definitions (scope_type, signal_key);

CREATE INDEX IF NOT EXISTS widget_ports_definition_direction_idx
    ON widget_ports (widget_definition_id, direction);

CREATE INDEX IF NOT EXISTS shell_signal_bindings_definition_idx
    ON shell_signal_bindings (widget_definition_id);

CREATE INDEX IF NOT EXISTS widget_connections_source_idx
    ON widget_connections (source_widget_instance_id);

CREATE INDEX IF NOT EXISTS widget_connections_target_widget_idx
    ON widget_connections (target_widget_instance_id)
    WHERE target_widget_instance_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS widget_connections_target_signal_idx
    ON widget_connections (target_signal_definition_id)
    WHERE target_signal_definition_id IS NOT NULL;
