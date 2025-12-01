# Loombard Recategorization Guide

## Problem

Loombard locations were incorrectly categorized as `money_transfer` when they should be `pawn_shop`.

## Solution

We've implemented:
1. ✅ Added `pawn_shop` to IndustryCategory type
2. ✅ Created migration to update existing Loombard records
3. ✅ Added auto-detection for future imports

---

## Step 1: Update Existing Loombard Records

Run this migration in **Supabase SQL Editor**:

```sql
-- File: lib/supabase/migrations/005_recategorize_loombard.sql

UPDATE locations
SET industry_category = 'pawn_shop'
WHERE network_name = 'Loombard';

UPDATE locations
SET tags = ARRAY['pawn_shop', 'loans', 'buy_sell']
WHERE network_name = 'Loombard';
```

Or copy/paste the entire migration file.

---

## Step 2: Verify Changes

```sql
-- Check Loombard records
SELECT
  network_name,
  brand_name,
  industry_category,
  tags,
  COUNT(*) as count
FROM locations
WHERE network_name = 'Loombard'
GROUP BY network_name, brand_name, industry_category, tags;
```

**Expected result:**
```
network_name | brand_name | industry_category | tags                           | count
-------------|------------|-------------------|--------------------------------|------
Loombard     | Loombard   | pawn_shop        | {pawn_shop,loans,buy_sell}     | XXX
```

---

## Step 3: Future Imports (Automatic)

The import API now **auto-detects** industry categories!

### Auto-Detection Rules

| Network Name Contains | Industry Category | Tags |
|-----------------------|-------------------|------|
| "loombard", "lombard", "pawn" | `pawn_shop` | `["pawn_shop", "loans", "buy_sell"]` |
| "euronet", "atm" | `atm` | `["atm", "cash_withdrawal"]` |
| "bank", "pekao", "pko" | `banking` | `["banking"]` |
| "walmart", "target", "walgreens" | `retail` | `["retail"]` |
| "lidl", "aldi", "tesco" | `grocery` | `["grocery"]` |
| "poczta", "post", "usps" | `postal` | `["postal_services"]` |
| (default) | `money_transfer` | `["money_transfer"]` |

### Example: Auto-Detection in Action

**Import JSON (no industry_category specified):**
```json
{
  "id": "loombard-12345",
  "network_name": "Loombard",
  "street": "ul. Przykładowa 1",
  "city": "Warsaw",
  "country": "PL",
  "lat": 52.2297,
  "lng": 21.0122
}
```

**Auto-transformed to:**
```json
{
  "network_name": "Loombard",
  "brand_name": "Loombard",
  "industry_category": "pawn_shop",  // ✅ Auto-detected!
  "tags": ["pawn_shop", "loans", "buy_sell"]  // ✅ Auto-detected!
}
```

---

## Manual Override (Still Supported)

You can **always override** auto-detection by providing fields explicitly:

```json
{
  "id": "custom-12345",
  "network_name": "Loombard",
  "industry_category": "other",  // Override auto-detection
  "brand_name": "Custom Loombard",  // Override default
  "tags": ["custom_tag"],  // Override auto-tags
  ...
}
```

---

## Adding More Detection Rules

To add more networks to auto-detection, edit:

**File:** `app/api/seed/import/route.ts`

**Function:** `detectIndustryCategory()`

```typescript
// Example: Add detection for "Cash Converters" (pawn shop chain)
if (normalized.includes("cash converters")) {
  return "pawn_shop";
}

// Example: Add detection for "7-Eleven" (convenience store)
if (normalized.includes("7-eleven") || normalized.includes("7eleven")) {
  return "convenience_store";
}
```

---

## Quick Test Queries

### Query 1: Count by Industry
```sql
SELECT
  industry_category,
  COUNT(*) as total
FROM locations
GROUP BY industry_category
ORDER BY total DESC;
```

### Query 2: All Pawn Shops
```sql
SELECT
  network_name,
  brand_name,
  city,
  country,
  tags
FROM locations
WHERE industry_category = 'pawn_shop'
LIMIT 20;
```

### Query 3: Locations with "loans" tag
```sql
SELECT
  network_name,
  brand_name,
  city,
  tags
FROM locations
WHERE 'loans' = ANY(tags);
```

---

## Summary

✅ **Existing Loombard records**: Run migration 005 to update
✅ **Future Loombard imports**: Auto-detected as `pawn_shop`
✅ **Custom networks**: Add detection rules easily
✅ **Manual override**: Always possible via JSON fields

**No code changes needed for basic imports** - auto-detection handles common cases!
