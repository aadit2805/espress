-- Make rating nullable since we now use quality_tier instead
ALTER TABLE drinks ALTER COLUMN rating DROP NOT NULL;
