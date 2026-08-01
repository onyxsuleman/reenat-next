-- Create homepage_catalog_positions table for 12-Slot Catalog Placement
CREATE TABLE IF NOT EXISTS homepage_catalog_positions (
    position INT PRIMARY KEY CHECK (position >= 1 AND position <= 12),
    catalog_id TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default initial positions 1 to 12
INSERT INTO homepage_catalog_positions (position, catalog_id) VALUES
  (1, 'M4'),
  (2, 'M7'),
  (3, 'M2'),
  (4, 'M5'),
  (5, 'M3'),
  (6, 'M9'),
  (7, 'M1'),
  (8, 'M6'),
  (9, 'M8'),
  (10, 'M10'),
  (11, 'M11'),
  (12, 'M12')
ON CONFLICT (position) DO UPDATE SET catalog_id = EXCLUDED.catalog_id, updated_at = NOW();
