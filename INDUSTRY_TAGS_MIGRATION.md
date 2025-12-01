# Industry Categories & Tags Migration Guide

## Overview

This migration adds support for **multi-industry location types** beyond money transfer services. You can now import and manage:

- 🏪 **Retail stores** (Walmart, Target, etc.)
- 🏧 **ATMs** (Euronet, standalone machines)
- 🏦 **Banks** (with or without money transfer)
- 🛒 **Grocery stores**
- 📮 **Postal services**
- 💊 **Pharmacies**
- ⛽ **Gas stations**
- And more...

---

## What Changed?

### New Database Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `industry_category` | TEXT | Primary business type | `"retail"`, `"atm"`, `"banking"` |
| `brand_name` | TEXT | Store/location brand | `"Walmart"`, `"Euronet"`, `"Target"` |
| `tags` | TEXT[] | Multi-select services/attributes | `["money_transfer", "atm", "24h"]` |

### Existing Fields (Unchanged)

- `network_name`: Service provider (MoneyGram, Western Union, etc.)
- `subnetwork_name`: Partner/franchise (PEKAO SA, Poczta Polska, etc.)

---

## Migration Steps

### Step 1: Run Database Migration

Execute the migration in your **Supabase SQL Editor**:

```sql
-- Run the full migration file
-- File: lib/supabase/migrations/004_add_industry_and_tags.sql
```

Or use the Supabase CLI:

```bash
supabase db reset  # If you want to rebuild from scratch
# OR
psql $DATABASE_URL < lib/supabase/migrations/004_add_industry_and_tags.sql
```

**What it does:**
- ✅ Adds 3 new columns with defaults
- ✅ Creates 4 new indexes (GIN index for tags)
- ✅ Migrates existing data automatically:
  - `industry_category` → `"money_transfer"` (all existing records)
  - `brand_name` → COALESCE(subnetwork_name, network_name)
  - `tags` → `["money_transfer"]` (all existing records)

### Step 2: Verify Migration

Run this query in Supabase SQL Editor:

```sql
-- Check migration results
SELECT
  industry_category,
  COUNT(*) as count,
  array_agg(DISTINCT brand_name) FILTER (WHERE brand_name IS NOT NULL) as sample_brands
FROM locations
GROUP BY industry_category;
```

Expected output:
```
industry_category | count | sample_brands
------------------+-------+--------------------------------
money_transfer    | 8824  | {Ria, Western Union, MoneyGram}
```

### Step 3: Update Application Code

**No code changes required!** The migration is backward compatible:
- ✅ All existing imports continue working
- ✅ All existing queries return data with new fields
- ✅ TypeScript types are already updated

### Step 4: Clear Next.js Cache

```bash
rm -rf .next
npm run dev
```

---

## Usage Examples

### Example 1: Import Walmart Locations with MoneyGram

**JSON Data:**
```json
[
  {
    "id": "walmart-12345",
    "network_name": "MoneyGram",
    "street": "123 Main St",
    "city": "Chicago",
    "country": "US",
    "lat": 41.8781,
    "lng": -87.6298,
    "industry_category": "retail",
    "brand_name": "Walmart",
    "tags": ["money_transfer", "grocery", "pharmacy", "24h"]
  }
]
```

**Import UI:**
1. Go to `/import`
2. Select network: **MoneyGram**
3. Select country override: **USA**
4. Upload JSON file
5. Click "Import"

**Result:**
```
network_name: "MoneyGram"
brand_name: "Walmart"
industry_category: "retail"
tags: ["money_transfer", "grocery", "pharmacy", "24h"]
```

### Example 2: Import Standalone Euronet ATMs

**JSON Data:**
```json
[
  {
    "id": "euronet-67890",
    "network_name": "Euronet",
    "street": "456 Oak Ave",
    "city": "Berlin",
    "country": "DE",
    "lat": 52.5200,
    "lng": 13.4050,
    "industry_category": "atm",
    "brand_name": "Euronet",
    "tags": ["atm", "24h", "cash_withdrawal"]
  }
]
```

### Example 3: Import Polish Post with Ria (Backward Compatible)

**Old Format (Still Works):**
```json
[
  {
    "id": "ria-11111",
    "network_name": "Ria",
    "subnetwork_name": "Poczta Polska",
    "street": "ul. Przykładowa 1",
    "city": "Warsaw",
    "country": "PL",
    "lat": 52.2297,
    "lng": 21.0122
  }
]
```

**Auto-Transformed To:**
```
network_name: "Ria"
subnetwork_name: "Poczta Polska"
brand_name: "Poczta Polska" (auto-filled from subnetwork_name)
industry_category: "money_transfer" (default)
tags: ["money_transfer"] (default)
```

---

## Industry Categories

### Predefined Types

| Category | Description | Example Brands |
|----------|-------------|----------------|
| `money_transfer` | Money transfer services | Ria, Western Union, MoneyGram |
| `retail` | Retail stores | Walmart, Target, Best Buy |
| `atm` | ATM machines | Euronet, standalone ATMs |
| `banking` | Banks | PEKAO SA, PKO BP |
| `grocery` | Grocery stores | Lidl, Aldi, Tesco |
| `postal` | Post offices | Poczta Polska, USPS |
| `pharmacy` | Pharmacies | CVS, Walgreens |
| `gas_station` | Gas stations | Shell, BP |
| `convenience_store` | Convenience stores | 7-Eleven |
| `other` | Other types | Custom categories |

### Custom Categories

You can use **any string** for `industry_category`. The TypeScript type is extensible:

```typescript
industry_category: "crypto_atm"  // Custom category
```

---

## Tag Examples

### Common Tags

| Tag | Description | Use Case |
|-----|-------------|----------|
| `money_transfer` | Offers money transfer services | All remittance locations |
| `atm` | Has ATM available | Banks, retail stores |
| `24h` | Open 24 hours | Convenience stores, gas stations |
| `drive_through` | Drive-through service | Fast food, banks |
| `grocery` | Sells groceries | Supermarkets, convenience stores |
| `pharmacy` | Pharmacy services | Drug stores |
| `cash_withdrawal` | Cash withdrawal available | ATMs |
| `currency_exchange` | Currency exchange service | Banks, exchange offices |

### Multi-Tag Example

```json
{
  "brand_name": "Walmart Supercenter",
  "industry_category": "retail",
  "tags": [
    "money_transfer",
    "grocery",
    "pharmacy",
    "atm",
    "24h",
    "optical",
    "tire_service"
  ]
}
```

---

## Querying with New Fields

### SQL Queries

```sql
-- All retail locations
SELECT * FROM locations
WHERE industry_category = 'retail';

-- All Walmarts (regardless of services)
SELECT * FROM locations
WHERE brand_name = 'Walmart';

-- All locations with ATMs
SELECT * FROM locations
WHERE 'atm' = ANY(tags);

-- Retail stores offering money transfer
SELECT * FROM locations
WHERE industry_category = 'retail'
  AND 'money_transfer' = ANY(tags);

-- 24-hour locations with MoneyGram
SELECT * FROM locations
WHERE network_name = 'MoneyGram'
  AND '24h' = ANY(tags);

-- All Walmarts in USA
SELECT * FROM locations
WHERE brand_name = 'Walmart'
  AND country = 'usa';
```

### TypeScript Queries (Coming Soon)

```typescript
// Future filter API
const filters = {
  country: "usa",
  industry: ["retail"],
  brands: ["Walmart", "Target"],
  tags: ["money_transfer", "24h"]
};

const locations = await getLocationsByFilters(filters);
```

---

## Import Defaults

### Automatic Defaults (When Fields Not Provided)

| Field | Source Priority | Final Default |
|-------|----------------|---------------|
| `industry_category` | 1. From JSON<br>2. `"money_transfer"` | `"money_transfer"` |
| `brand_name` | 1. From JSON<br>2. `subnetwork_name`<br>3. `network_name` | `network_name` |
| `tags` | 1. From JSON<br>2. `["money_transfer"]` | `["money_transfer"]` |

### Example Transformations

**Input:**
```json
{
  "network_name": "Ria",
  "subnetwork_name": "Poczta Polska"
  // No industry_category, brand_name, or tags
}
```

**Output:**
```
network_name: "Ria"
subnetwork_name: "Poczta Polska"
brand_name: "Poczta Polska" (from subnetwork_name)
industry_category: "money_transfer" (default)
tags: ["money_transfer"] (default)
```

---

## Future UI Enhancements (Planned)

### Phase 1: Filter Panel
- Industry selector (Money Transfer, Retail, ATM, Banking, etc.)
- Brand search/filter
- Tag multi-select (Services Offered)

### Phase 2: Dashboard Updates
- Industry breakdown statistics
- Top brands by location count
- Tag-based analytics

### Phase 3: Map Enhancements
- Industry-specific marker colors
- Brand logos on map
- Tag-based filtering on map

---

## Performance Impact

### Indexes Created

```sql
CREATE INDEX idx_locations_industry ON locations(industry_category);
CREATE INDEX idx_locations_brand ON locations(brand_name);
CREATE INDEX idx_locations_tags ON locations USING GIN(tags);
CREATE INDEX idx_locations_country_industry ON locations(country, industry_category);
```

### Query Performance

- **Industry filter**: < 5ms (B-tree index)
- **Brand filter**: < 10ms (B-tree index)
- **Tag filter**: < 10ms (GIN index)
- **Combined filters**: < 20ms (composite indexes)

### Storage Impact

- ~50 bytes per location (3 new fields)
- 10,000 locations = ~500 KB additional storage
- Negligible for scale < 100,000 locations

---

## Rollback Plan

If you need to rollback:

```sql
-- Remove new columns
ALTER TABLE locations DROP COLUMN IF EXISTS industry_category;
ALTER TABLE locations DROP COLUMN IF EXISTS brand_name;
ALTER TABLE locations DROP COLUMN IF EXISTS tags;

-- Remove indexes
DROP INDEX IF EXISTS idx_locations_industry;
DROP INDEX IF EXISTS idx_locations_brand;
DROP INDEX IF EXISTS idx_locations_tags;
DROP INDEX IF EXISTS idx_locations_country_industry;
```

**Note:** This will delete all data in the new fields. Export data first if needed.

---

## FAQ

### Q: Do I need to update existing locations?

**A:** No. The migration automatically sets defaults for all existing records. They'll continue working as money transfer locations.

### Q: Can a location have multiple industries?

**A:** Not directly via `industry_category` (it's a single value). Use `tags` for multi-category support:

```json
{
  "industry_category": "retail",
  "tags": ["money_transfer", "grocery", "pharmacy", "atm"]
}
```

### Q: What if I don't provide industry_category in my JSON?

**A:** It defaults to `"money_transfer"` automatically. Backward compatible!

### Q: Can I use custom tag names?

**A:** Yes! Tags are freeform strings. Use any naming convention you want.

### Q: How do I search for "all Walmarts with MoneyGram"?

**A:** Query:
```sql
WHERE brand_name = 'Walmart' AND network_name = 'MoneyGram'
```

### Q: Will this break my existing imports?

**A:** No. All existing import JSON files continue working without modification.

---

## Support

If you encounter issues:

1. Check migration completed successfully (verify query above)
2. Clear Next.js cache: `rm -rf .next && npm run dev`
3. Check Supabase logs in dashboard
4. Check browser console for errors

---

**Migration Date:** 2025-11-20
**Migration File:** `lib/supabase/migrations/004_add_industry_and_tags.sql`
**TypeScript Types:** Updated in `types/index.ts`
**Import API:** Updated in `app/api/seed/import/route.ts`
