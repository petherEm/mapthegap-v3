-- Migration: Fix Geography/Geometry Type Casting in PostGIS Functions
-- Description: Fixes ST_Collect and other spatial functions to work with geography type
-- Date: November 2025
-- Issue: ST_Collect expects geometry, but geom column is geography

-- ============================================
-- FIX: Get Locations in Viewport Function
-- ============================================
CREATE OR REPLACE FUNCTION get_locations_in_viewport(
  p_country TEXT,
  p_west DOUBLE PRECISION,
  p_south DOUBLE PRECISION,
  p_east DOUBLE PRECISION,
  p_north DOUBLE PRECISION
) RETURNS TABLE (
  id TEXT,
  network_name TEXT,
  subnetwork_name TEXT,
  street TEXT,
  zip TEXT,
  city TEXT,
  county TEXT,
  country TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.network_name,
    l.subnetwork_name,
    l.street,
    l.zip,
    l.city,
    l.county,
    l.country,
    l.lat,
    l.lng,
    l.phone,
    l.description
  FROM locations l
  WHERE l.country = p_country
    AND l.is_active = true
    AND ST_Within(
      CAST(l.geom AS geometry),
      ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)
    )
  ORDER BY l.city, l.street;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FIX: Compare Network Coverage Function
-- ============================================
CREATE OR REPLACE FUNCTION compare_network_coverage(
  p_country TEXT
) RETURNS TABLE (
  network_name TEXT,
  location_count BIGINT,
  coverage_area_sqkm DOUBLE PRECISION,
  market_share_pct DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  WITH network_stats AS (
    SELECT
      l.network_name,
      COUNT(*) as location_count,
      CASE
        WHEN COUNT(*) > 1
        THEN ST_Area(ST_ConvexHull(ST_Collect(l.geom::geometry))::geography) / 1000000.0
        ELSE 0
      END as coverage_area
    FROM locations l
    WHERE l.country = p_country
      AND l.is_active = true
    GROUP BY l.network_name
  ),
  totals AS (
    SELECT SUM(ns.location_count) as total_locations
    FROM network_stats ns
  )
  SELECT
    ns.network_name,
    ns.location_count,
    ns.coverage_area as coverage_area_sqkm,
    ROUND((100.0 * ns.location_count / t.total_locations)::numeric, 1)::double precision as market_share_pct
  FROM network_stats ns
  CROSS JOIN totals t
  ORDER BY ns.location_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FIX: Get Density by City Function
-- ============================================
CREATE OR REPLACE FUNCTION get_density_by_city(
  p_country TEXT
) RETURNS TABLE (
  city TEXT,
  location_count BIGINT,
  density_per_sqkm DOUBLE PRECISION,
  networks TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.city,
    COUNT(*) as location_count,
    CASE
      WHEN ST_Area(ST_ConvexHull(ST_Collect(l.geom::geometry))::geography) > 0
      THEN COUNT(*) / (ST_Area(ST_ConvexHull(ST_Collect(l.geom::geometry))::geography) / 1000000.0)
      ELSE 0
    END as density_per_sqkm,
    array_agg(DISTINCT l.network_name) as networks
  FROM locations l
  WHERE l.country = p_country
    AND l.is_active = true
  GROUP BY l.city
  HAVING COUNT(*) > 0
  ORDER BY location_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FIX: Get Coverage Grid Function
-- ============================================
CREATE OR REPLACE FUNCTION get_coverage_grid(
  p_country TEXT,
  p_grid_size_degrees DOUBLE PRECISION DEFAULT 0.5
) RETURNS TABLE (
  cell_id INT,
  cell_center_lng DOUBLE PRECISION,
  cell_center_lat DOUBLE PRECISION,
  location_count BIGINT,
  has_coverage BOOLEAN,
  networks TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH country_bounds AS (
    SELECT
      MIN(l.lng) as min_lng,
      MAX(l.lng) as max_lng,
      MIN(l.lat) as min_lat,
      MAX(l.lat) as max_lat
    FROM locations l
    WHERE l.country = p_country
  ),
  grid_cells AS (
    SELECT
      row_number() OVER () as cell_id,
      x + p_grid_size_degrees / 2 as center_lng,
      y + p_grid_size_degrees / 2 as center_lat,
      ST_MakeEnvelope(
        x,
        y,
        x + p_grid_size_degrees,
        y + p_grid_size_degrees,
        4326
      ) as cell_geom
    FROM country_bounds cb
    CROSS JOIN LATERAL
      generate_series(cb.min_lng::numeric, cb.max_lng::numeric, p_grid_size_degrees::numeric) as x
    CROSS JOIN LATERAL
      generate_series(cb.min_lat::numeric, cb.max_lat::numeric, p_grid_size_degrees::numeric) as y
  )
  SELECT
    gc.cell_id::INT,
    gc.center_lng,
    gc.center_lat,
    COUNT(l.id) as location_count,
    COUNT(l.id) > 0 as has_coverage,
    CASE
      WHEN COUNT(l.id) > 0
      THEN array_agg(DISTINCT l.network_name)
      ELSE ARRAY[]::TEXT[]
    END as networks
  FROM grid_cells gc
  LEFT JOIN locations l ON
    l.country = p_country
    AND l.is_active = true
    AND ST_Within(CAST(l.geom AS geometry), gc.cell_geom)
  GROUP BY gc.cell_id, gc.center_lng, gc.center_lat
  ORDER BY gc.cell_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FIX: Get Coverage Percentage Function
-- ============================================
CREATE OR REPLACE FUNCTION get_coverage_percentage(
  p_country TEXT,
  p_buffer_km DOUBLE PRECISION DEFAULT 5.0
) RETURNS TABLE (
  total_locations BIGINT,
  coverage_area_sqkm DOUBLE PRECISION,
  country_area_sqkm DOUBLE PRECISION,
  coverage_percentage DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  WITH locations_in_country AS (
    SELECT geom
    FROM locations
    WHERE country = p_country
      AND is_active = true
  ),
  buffered_coverage AS (
    SELECT ST_Union(
      ST_Buffer(geom::geography, p_buffer_km * 1000)::geometry
    ) as coverage_geom
    FROM locations_in_country
  ),
  country_hull AS (
    SELECT ST_ConvexHull(ST_Collect(geom::geometry)) as country_geom
    FROM locations_in_country
  )
  SELECT
    (SELECT COUNT(*) FROM locations_in_country) as total_locations,
    ST_Area(bc.coverage_geom::geography) / 1000000.0 as coverage_area_sqkm,
    ST_Area(ch.country_geom::geography) / 1000000.0 as country_area_sqkm,
    CASE
      WHEN ST_Area(ch.country_geom::geography) > 0
      THEN ROUND(
        100.0 * ST_Area(bc.coverage_geom::geography) / ST_Area(ch.country_geom::geography),
        2
      )
      ELSE 0
    END as coverage_percentage
  FROM buffered_coverage bc
  CROSS JOIN country_hull ch;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- VERIFICATION
-- ============================================

-- Test the fixed functions:

-- 1. Compare network coverage (should work now)
-- SELECT * FROM compare_network_coverage('gb');

-- 2. Get density by city
-- SELECT * FROM get_density_by_city('gb') LIMIT 10;

-- 3. Get coverage grid
-- SELECT * FROM get_coverage_grid('gb', 0.5) LIMIT 20;

-- 4. Get coverage percentage
-- SELECT * FROM get_coverage_percentage('gb', 5.0);
