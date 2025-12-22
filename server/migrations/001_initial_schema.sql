-- Cafes table
CREATE TABLE cafes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Drinks table
CREATE TABLE drinks (
  id SERIAL PRIMARY KEY,
  cafe_id INTEGER REFERENCES cafes(id) ON DELETE CASCADE,
  drink_type VARCHAR(100) NOT NULL,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5) NOT NULL,
  notes TEXT,
  logged_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_drinks_cafe ON drinks(cafe_id);
CREATE INDEX idx_drinks_logged_at ON drinks(logged_at DESC);
CREATE INDEX idx_drinks_rating ON drinks(rating DESC);
