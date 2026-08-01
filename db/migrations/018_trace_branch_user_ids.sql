ALTER TABLE trace_branches
    ALTER COLUMN user_id TYPE UUID
    USING user_id::uuid;
