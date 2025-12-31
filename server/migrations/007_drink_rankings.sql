-- Add quality tier to drinks (good, mid, bad)
ALTER TABLE drinks ADD COLUMN IF NOT EXISTS quality_tier VARCHAR(10) DEFAULT 'good';

-- Create drink rankings table (replaces cafe_rankings)
CREATE TABLE IF NOT EXISTS drink_rankings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    drink_id INTEGER NOT NULL REFERENCES drinks(id) ON DELETE CASCADE,
    quality_tier VARCHAR(10) NOT NULL, -- 'good', 'mid', 'bad'
    tier_rank INTEGER NOT NULL, -- rank within the tier (1 = best in tier)
    score NUMERIC(3,1), -- calculated score 0.0-10.0
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, drink_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_drink_rankings_user ON drink_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_drink_rankings_user_tier ON drink_rankings(user_id, quality_tier);
CREATE INDEX IF NOT EXISTS idx_drink_rankings_score ON drink_rankings(user_id, score DESC);

-- Drop old cafe_rankings table (optional - keeping for now in case of rollback)
-- DROP TABLE IF EXISTS cafe_rankings;
