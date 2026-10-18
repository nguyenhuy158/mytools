-- Baseline: the projects schema as it runs in production on 2026-10-18.
-- IF NOT EXISTS makes it a no-op there; on a fresh local D1 it creates the schema.

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  tech TEXT NOT NULL,
  image TEXT,
  shot_url TEXT,
  accent TEXT NOT NULL,
  status TEXT NOT NULL,
  since TEXT,
  highlights TEXT,
  skip_status_check INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);
