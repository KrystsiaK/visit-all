ALTER TABLE generated_widgets
  ADD COLUMN IF NOT EXISTS target_hosts TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS generated_widgets_target_hosts_idx
  ON generated_widgets USING GIN (target_hosts);
