CREATE TABLE IF NOT EXISTS entity_media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_container_id UUID NOT NULL REFERENCES entity_containers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    public_url TEXT NOT NULL,
    caption TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS entity_media_items_container_position_idx
    ON entity_media_items (entity_container_id, position);

CREATE INDEX IF NOT EXISTS entity_media_items_user_idx
    ON entity_media_items (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS entity_story_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_container_id UUID NOT NULL REFERENCES entity_containers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    title TEXT,
    body_markdown TEXT NOT NULL DEFAULT '',
    position INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS entity_story_entries_container_position_idx
    ON entity_story_entries (entity_container_id, position);

CREATE INDEX IF NOT EXISTS entity_story_entries_user_idx
    ON entity_story_entries (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS entity_resource_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_container_id UUID NOT NULL REFERENCES entity_containers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    label TEXT,
    url TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS entity_resource_links_container_position_idx
    ON entity_resource_links (entity_container_id, position);

CREATE INDEX IF NOT EXISTS entity_resource_links_user_idx
    ON entity_resource_links (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS entity_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_container_id UUID NOT NULL REFERENCES entity_containers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    value INTEGER NOT NULL CHECK (value BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (entity_container_id)
);

CREATE INDEX IF NOT EXISTS entity_ratings_user_idx
    ON entity_ratings (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS entity_transport_modes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_container_id UUID NOT NULL REFERENCES entity_containers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('walk', 'car', 'bus', 'tram', 'train', 'ferry')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (entity_container_id)
);

CREATE INDEX IF NOT EXISTS entity_transport_modes_user_idx
    ON entity_transport_modes (user_id, updated_at DESC);
