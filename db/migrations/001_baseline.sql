CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#ef4444',
    icon TEXT DEFAULT '📍',
    type TEXT NOT NULL DEFAULT 'pin',
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entity_containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    geometry_kind TEXT NOT NULL,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active',
    source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    archived_at TIMESTAMPTZ,
    purge_after TIMESTAMPTZ,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS entity_containers_user_status_idx
    ON entity_containers (user_id, status, entity_type);

CREATE TABLE IF NOT EXISTS pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID REFERENCES entity_containers(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    name TEXT,
    note TEXT,
    image_url TEXT,
    location GEOMETRY(Point, 4326) NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pins_container_id_idx
    ON pins (container_id);

CREATE TABLE IF NOT EXISTS traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID REFERENCES entity_containers(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    name TEXT,
    color TEXT DEFAULT '#ef4444',
    path GEOMETRY(LineString, 4326) NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS traces_container_id_idx
    ON traces (container_id);

CREATE TABLE IF NOT EXISTS areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID REFERENCES entity_containers(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    name TEXT,
    color TEXT DEFAULT '#ef4444',
    path GEOMETRY(Polygon, 4326) NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS areas_container_id_idx
    ON areas (container_id);

CREATE TABLE IF NOT EXISTS widget_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    layer TEXT NOT NULL,
    supported_entity_types TEXT[] NOT NULL DEFAULT '{}',
    component_key TEXT NOT NULL,
    default_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS widget_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID NOT NULL REFERENCES widget_definitions(id) ON DELETE CASCADE,
    layer TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    title TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS widget_instances_global_unique_idx
    ON widget_instances (user_id, definition_id, layer, position)
    WHERE layer = 'global';

CREATE UNIQUE INDEX IF NOT EXISTS widget_instances_entity_unique_idx
    ON widget_instances (user_id, definition_id, layer, entity_type, entity_id, position)
    WHERE layer = 'entity';
