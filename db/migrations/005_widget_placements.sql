CREATE TABLE IF NOT EXISTS widget_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shell_instance_id UUID NOT NULL REFERENCES shell_instances(id) ON DELETE CASCADE,
    widget_instance_id UUID NOT NULL REFERENCES widget_instances(id) ON DELETE CASCADE,
    slot TEXT NOT NULL DEFAULT 'main',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS widget_placements_shell_widget_unique_idx
    ON widget_placements (shell_instance_id, widget_instance_id);

CREATE UNIQUE INDEX IF NOT EXISTS widget_placements_shell_slot_position_unique_idx
    ON widget_placements (shell_instance_id, slot, position);
