-- Migration 005: Recategorize Loombard as Pawn Shop
-- Purpose: Fix incorrect categorization of Loombard locations
-- Date: 2025-11-20
-- Background: Loombard is a pawn shop network, not money transfer service

-- ============================================================================
-- Update Loombard Records
-- ============================================================================

-- Update industry_category from 'money_transfer' to 'pawn_shop'
UPDATE locations
SET industry_category = 'pawn_shop'
WHERE network_name = 'Loombard';

-- Update tags: remove 'money_transfer', add 'pawn_shop', 'loans', 'buy_sell'
UPDATE locations
SET tags = ARRAY['pawn_shop', 'loans', 'buy_sell']
WHERE network_name = 'Loombard';

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Check updated records
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM locations
  WHERE network_name = 'Loombard'
    AND industry_category = 'pawn_shop';

  RAISE NOTICE 'Updated % Loombard locations to pawn_shop category', updated_count;
END $$;

-- ============================================================================
-- Sample Query (Commented - Run manually to verify)
-- ============================================================================

-- Verify Loombard records are properly categorized
-- SELECT
--   network_name,
--   brand_name,
--   industry_category,
--   tags,
--   city,
--   country
-- FROM locations
-- WHERE network_name = 'Loombard'
-- LIMIT 10;
