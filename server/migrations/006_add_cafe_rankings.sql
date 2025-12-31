-- Cafe rankings table for user-defined cafe ordering
CREATE TABLE IF NOT EXISTS cafe_rankings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, cafe_id)
);

-- Index for fast ranking lookups by user
CREATE INDEX IF NOT EXISTS idx_cafe_rankings_user ON cafe_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_cafe_rankings_user_rank ON cafe_rankings(user_id, rank);
