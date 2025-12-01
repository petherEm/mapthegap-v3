-- Migration 004: Add Industry Categories, Brand Names, and Tags Support
-- Purpose: Enable multi-industry support (retail, banking, ATM, etc.) beyond money transfer
-- Date: 2025-11-20
-- Status: Safe to run multiple times (idempotent)

-- ============================================================================
-- PHASE 1: Add New Columns
-- ============================================================================

-- Add industry_category column (primary business type)
-- Default: 'money_transfer' for backward compatibility with existing data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'industry_category'
  ) THEN
    ALTER TABLE locations ADD COLUMN industry_category TEXT DEFAULT 'money_transfer';
    RAISE NOTICE 'Added column: industry_category';
  ELSE
    RAISE NOTICE 'Column industry_category already exists, skipping';
  END IF;
END $$;

-- Add brand_name column (actual store/location brand)
-- Examples: "Walmart", "Target", "Euronet", "Lidl"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'brand_name'
  ) THEN
    ALTER TABLE locations ADD COLUMN brand_name TEXT;
    RAISE NOTICE 'Added column: brand_name';
  ELSE
    RAISE NOTICE 'Column brand_name already exists, skipping';
  END IF;
END $$;

-- Add tags array column (multi-select services/attributes)
-- Examples: ['money_transfer', 'atm', '24h', 'drive_through', 'grocery']
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'tags'
  ) THEN
    ALTER TABLE locations ADD COLUMN tags TEXT[] DEFAULT ARRAY['money_transfer'];
    RAISE NOTICE 'Added column: tags';
  ELSE
    RAISE NOTICE 'Column tags already exists, skipping';
  END IF;
END $$;

-- ============================================================================
-- PHASE 2: Create Indexes for Performance
-- ============================================================================

-- Index on industry_category for filtering (e.g., "show me all retail locations")
CREATE INDEX IF NOT EXISTS idx_locations_industry
ON locations(industry_category);

-- Index on brand_name for brand-specific queries (e.g., "show me all Walmarts")
CREATE INDEX IF NOT EXISTS idx_locations_brand
ON locations(brand_name);

-- GIN index on tags array for fast tag searches (e.g., "locations with ATM")
-- GIN (Generalized Inverted Index) is optimized for array/JSONB data
CREATE INDEX IF NOT EXISTS idx_locations_tags
ON locations USING GIN(tags);

-- Composite index for common query pattern: country + industry
CREATE INDEX IF NOT EXISTS idx_locations_country_industry
ON locations(country, industry_category);

-- ============================================================================
-- PHASE 3: Migrate Existing Data (Backward Compatibility)
-- ============================================================================

-- Set brand_name from existing data
-- Priority: subnetwork_name (if exists) > network_name
-- This preserves the actual brand (e.g., "Walmart" from subnetwork, not "MoneyGram")
UPDATE locations
SET brand_name = COALESCE(subnetwork_name, network_name)
WHERE brand_name IS NULL;

-- Ensure all existing records have proper defaults
-- All existing locations are money transfer by default
UPDATE locations
SET industry_category = 'money_transfer'
WHERE industry_category IS NULL;

UPDATE locations
SET tags = ARRAY['money_transfer']
WHERE tags IS NULL OR tags = '{}';

-- ============================================================================
-- PHASE 4: Add Comments for Documentation
-- ============================================================================

COMMENT ON COLUMN locations.industry_category IS
'Primary business category: money_transfer, retail, atm, banking, grocery, postal, etc.';

COMMENT ON COLUMN locations.brand_name IS
'Store/location brand name (e.g., Walmart, Target, Euronet, Lidl, PEKAO SA)';

COMMENT ON COLUMN locations.tags IS
'Array of services/attributes offered (e.g., [money_transfer, atm, 24h, drive_through, grocery])';

-- ============================================================================
-- VERIFICATION QUERIES (Run manually after migration)
-- ============================================================================

-- Check migration results
-- SELECT
--   industry_category,
--   COUNT(*) as count,
--   array_agg(DISTINCT brand_name) FILTER (WHERE brand_name IS NOT NULL) as sample_brands
-- FROM locations
-- GROUP BY industry_category;

-- Sample query: Find retail locations offering money transfer
-- SELECT brand_name, city, country, tags
-- FROM locations
-- WHERE industry_category = 'retail'
--   AND 'money_transfer' = ANY(tags)
-- LIMIT 10;

-- Sample query: Find all Walmarts
-- SELECT * FROM locations WHERE brand_name = 'Walmart';

-- Sample query: Find locations with ATMs
-- SELECT * FROM locations WHERE 'atm' = ANY(tags);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 004 completed successfully!';
  RAISE NOTICE 'New fields added: industry_category, brand_name, tags';
  RAISE NOTICE 'Indexes created: 4 new indexes for performance';
  RAISE NOTICE 'Existing data migrated with defaults';
END $$;
