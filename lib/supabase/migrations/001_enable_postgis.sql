-- Migration: Enable PostGIS (Phase 1)
-- Description: Adds PostGIS extension, geom column, spatial index, and auto-sync trigger
-- Date: November 2025
-- Status: Non-breaking (backward compatible)

-- ============================================
-- STEP 1: Enable PostGIS Extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS is installed
-- Run this separately to check: SELECT PostGIS_Version();

-- ============================================
-- STEP 2: Add Geography Column
-- ============================================
-- Add geom column for spatial queries (keeps lat/lng for backward compatibility)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS geom geography(Point, 4326);

-- Add comment to document purpose
COMMENT ON COLUMN locations.geom IS 'PostGIS geography point (auto-synced from lat/lng). Use for spatial queries like ST_DWithin, ST_Within, etc.';

-- ============================================
-- STEP 3: Populate Geom from Existing Data
-- ============================================
-- Populate geom for all existing locations
UPDATE locations
SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
WHERE geom IS NULL;

-- Verify population: SELECT COUNT(*) FROM locations WHERE geom IS NOT NULL;

-- ============================================
-- STEP 4: Create Spatial Index (CRITICAL!)
-- ============================================
-- This index makes spatial queries 20-40x faster
CREATE INDEX IF NOT EXISTS idx_locations_geom
ON locations USING GIST (geom);

-- Verify index created:
-- SELECT indexname FROM pg_indexes WHERE tablename = 'locations' AND indexname = 'idx_locations_geom';

-- ============================================
-- STEP 5: Auto-Sync Trigger
-- ============================================
-- Create function to automatically sync geom when lat/lng changes
CREATE OR REPLACE FUNCTION sync_geom_from_lat_lng()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update geom whenever lat or lng is inserted/updated
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS locations_sync_geom ON locations;

-- Create trigger to run before insert/update
CREATE TRIGGER locations_sync_geom
  BEFORE INSERT OR UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION sync_geom_from_lat_lng();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these queries after migration to verify everything works:

-- 1. Check PostGIS version
-- SELECT PostGIS_Version();

-- 2. Check geom column exists and is populated
-- SELECT COUNT(*) as total, COUNT(geom) as geom_populated
-- FROM locations;

-- 3. Check spatial index exists
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'locations' AND indexname = 'idx_locations_geom';

-- 4. Test spatial query (find locations near Warsaw center)
-- EXPLAIN ANALYZE
-- SELECT id, network_name, city, street,
--        ST_Distance(geom, ST_SetSRID(ST_MakePoint(21.0122, 52.2297), 4326)::geography) / 1000 as km_away
-- FROM locations
-- WHERE ST_DWithin(
--   geom,
--   ST_SetSRID(ST_MakePoint(21.0122, 52.2297), 4326)::geography,
--   5000 -- 5km radius in meters
-- )
-- ORDER BY geom <-> ST_SetSRID(ST_MakePoint(21.0122, 52.2297), 4326)::geography
-- LIMIT 10;

-- Expected: Query should use idx_locations_geom index and run in < 10ms

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

-- To rollback this migration (CAUTION!):
-- DROP TRIGGER IF EXISTS locations_sync_geom ON locations;
-- DROP FUNCTION IF EXISTS sync_geom_from_lat_lng();
-- DROP INDEX IF EXISTS idx_locations_geom;
-- ALTER TABLE locations DROP COLUMN IF EXISTS geom;
-- DROP EXTENSION IF EXISTS postgis CASCADE;

-- ============================================
-- NOTES
-- ============================================

-- 1. Backward Compatibility:
--    - lat/lng columns remain unchanged
--    - All existing queries continue to work
--    - geom is additional column for PostGIS queries

-- 2. Data Integrity:
--    - Trigger ensures geom is ALWAYS in sync with lat/lng
--    - Single source of truth: lat/lng
--    - geom is derived/computed value

-- 3. Performance:
--    - GIST index makes spatial queries 20-40x faster
--    - Index size: ~1-2MB for 8,824 locations
--    - Minimal storage overhead

-- 4. RLS Policies:
--    - Existing RLS policies apply to geom column
--    - No security changes needed
--    - Public read access still enforced

-- 5. Future Queries Enabled:
--    - Viewport queries: ST_Within(geom, ST_MakeEnvelope(...))
--    - Distance queries: ST_DWithin(geom, point, radius)
--    - Nearest neighbor: ORDER BY geom <-> point
--    - Clustering: ST_ClusterKMeans(geom, k)
--    - Coverage analysis: ST_ConvexHull, ST_Buffer
--    - Density analysis: ST_Area, point counts per grid cell

-- ============================================
-- SUCCESS CRITERIA
-- ============================================

-- ✅ PostGIS extension enabled
-- ✅ geom column added to locations table
-- ✅ All existing rows have geom populated
-- ✅ Spatial index created and functional
-- ✅ Trigger auto-syncs geom on insert/update
-- ✅ All existing tests pass (zero breaking changes)
-- ✅ Spatial queries run in < 10ms with index
