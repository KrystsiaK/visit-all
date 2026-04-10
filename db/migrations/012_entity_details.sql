CREATE TABLE IF NOT EXISTS entity_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_container_id UUID NOT NULL REFERENCES entity_containers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    title TEXT,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (entity_container_id)
);

CREATE INDEX IF NOT EXISTS entity_details_user_idx
    ON entity_details (user_id, updated_at DESC);
