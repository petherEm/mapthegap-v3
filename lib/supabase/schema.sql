-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  network_name TEXT NOT NULL, -- Allows any network name dynamically
  subnetwork_name TEXT, -- Optional subnetwork (e.g., "PEKAO SA" for Western Union, "Poczta Polska" for Ria)
  street TEXT NOT NULL,
  zip TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT,
  country TEXT NOT NULL CHECK (country IN ('poland', 'lithuania', 'latvia', 'estonia', 'gb', 'france', 'honduras', 'usa')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT, -- Contact phone number
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Industry categorization fields (added in migration 004)
  industry_category TEXT DEFAULT 'money_transfer', -- Primary business type: money_transfer, retail, atm, banking, grocery, postal
  brand_name TEXT, -- Store/location brand (e.g., Walmart, Target, Euronet, Lidl)
  tags TEXT[] DEFAULT ARRAY['money_transfer'], -- Multi-select services/attributes (e.g., ['money_transfer', 'atm', '24h'])
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Drop the old CHECK constraint if it exists (for existing databases)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'locations'
    AND constraint_name LIKE '%network_name%check%'
  ) THEN
    ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_network_name_check;
  END IF;
END $$;

-- Create index on country for faster filtering
CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country);

-- Create index on network_name for faster filtering
CREATE INDEX IF NOT EXISTS idx_locations_network ON locations(network_name);

-- Create index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);

-- Create composite index for country + network queries
CREATE INDEX IF NOT EXISTS idx_locations_country_network ON locations(country, network_name);

-- Industry categorization indexes (added in migration 004)
CREATE INDEX IF NOT EXISTS idx_locations_industry ON locations(industry_category);
CREATE INDEX IF NOT EXISTS idx_locations_brand ON locations(brand_name);
CREATE INDEX IF NOT EXISTS idx_locations_tags ON locations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_locations_country_industry ON locations(country, industry_category);

-- PostGIS spatial index (enabled in separate migration file)
-- See: lib/supabase/migrations/001_enable_postgis.sql
-- To enable: Run the migration file in Supabase SQL Editor

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists before creating
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read locations" ON locations;
DROP POLICY IF EXISTS "Allow public read access to locations" ON locations;
DROP POLICY IF EXISTS "Allow authenticated users to insert locations" ON locations;
DROP POLICY IF EXISTS "Allow authenticated users to update locations" ON locations;
DROP POLICY IF EXISTS "Allow authenticated users to delete locations" ON locations;

-- Create policy: Allow PUBLIC read access to locations (map data is public)
CREATE POLICY "Allow public read access to locations"
  ON locations
  FOR SELECT
  USING (true);

-- Create policy: Allow authenticated users to insert locations
CREATE POLICY "Allow authenticated users to insert locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy: Allow authenticated users to update locations
CREATE POLICY "Allow authenticated users to update locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy: Allow authenticated users to delete locations
CREATE POLICY "Allow authenticated users to delete locations"
  ON locations
  FOR DELETE
  TO authenticated
  USING (true);

-- Optional: Allow public read access (remove if you want authenticated-only access)
-- CREATE POLICY "Allow public to read active locations"
--   ON locations
--   FOR SELECT
--   TO anon
--   USING (is_active = true);

-- ============================================
-- POSTGIS CONFIGURATION (Phase 1)
-- ============================================
-- PostGIS enables powerful spatial queries for geographic data
-- Run this section AFTER the table and indexes above are created
-- See: lib/supabase/migrations/001_enable_postgis.sql for full migration

-- IMPORTANT: This section is included for documentation only
-- Run the actual migration from: lib/supabase/migrations/001_enable_postgis.sql
-- That file includes:
--   1. CREATE EXTENSION postgis
--   2. ALTER TABLE locations ADD COLUMN geom geography(Point, 4326)
--   3. CREATE INDEX idx_locations_geom ON locations USING GIST (geom)
--   4. CREATE TRIGGER to auto-sync geom from lat/lng
--
-- Benefits:
--   - 20-40x faster spatial queries with GIST index
--   - Viewport queries: ST_Within(geom, ST_MakeEnvelope(...))
--   - Distance queries: ST_DWithin(geom, point, radius)
--   - Coverage analysis: ST_ConvexHull, ST_Buffer
--   - Density calculations: ST_Area, point counts
--
-- See: POSTGIS_IMPLEMENTATION_PLAN.md for complete implementation guide
