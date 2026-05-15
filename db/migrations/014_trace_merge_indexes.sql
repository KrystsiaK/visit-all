CREATE INDEX IF NOT EXISTS traces_path_gist_idx
    ON traces
    USING GIST (path);

CREATE INDEX IF NOT EXISTS traces_user_collection_idx
    ON traces (user_id, collection_id);
