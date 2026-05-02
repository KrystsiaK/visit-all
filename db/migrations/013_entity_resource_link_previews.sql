CREATE TABLE IF NOT EXISTS entity_resource_link_previews (
    resource_link_id UUID PRIMARY KEY REFERENCES entity_resource_links(id) ON DELETE CASCADE,
    resolved_url TEXT,
    hostname TEXT,
    site_name TEXT,
    title TEXT,
    description TEXT,
    image_url TEXT,
    favicon_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'error')),
    error_message TEXT,
    fetched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS entity_resource_link_previews_status_idx
    ON entity_resource_link_previews (status, fetched_at DESC);
