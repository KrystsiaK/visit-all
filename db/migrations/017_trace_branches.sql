CREATE TABLE IF NOT EXISTS trace_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id UUID NOT NULL REFERENCES traces(id) ON DELETE CASCADE,
    path GEOMETRY(LineString, 4326) NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trace_branches_trace_id_idx
    ON trace_branches (trace_id);

CREATE INDEX IF NOT EXISTS trace_branches_user_id_idx
    ON trace_branches (user_id);

CREATE INDEX IF NOT EXISTS trace_branches_path_gist_idx
    ON trace_branches
    USING GIST (path);
