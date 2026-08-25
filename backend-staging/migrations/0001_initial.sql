-- Learning Commons Stage B schema draft.
-- This migration is documentation/scaffolding only; it is not connected to a live database.

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL UNIQUE,
  moderation_state TEXT NOT NULL CHECK (moderation_state IN ('pending', 'approved', 'rejected', 'flagged')),
  created_at TEXT NOT NULL,
  published_at TEXT
);

CREATE TABLE IF NOT EXISTS concepts (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  centroid TEXT
);

CREATE TABLE IF NOT EXISTS note_concepts (
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  similarity REAL NOT NULL CHECK (similarity >= 0 AND similarity <= 1),
  PRIMARY KEY (note_id, concept_id)
);

CREATE TABLE IF NOT EXISTS moderation_events (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('pending', 'approved', 'rejected', 'flagged')),
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- No requester, IP, user-agent, session, device, account, or identity foreign key is stored here.
-- Rate-limit signals belong to a short-lived operational store, not the public note database.
