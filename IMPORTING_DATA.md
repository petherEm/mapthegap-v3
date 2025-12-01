# Importing Location Data

## Overview

MapTheGap supports bulk import of location data from JSON files. The import system automatically handles data transformation and ID deduplication.

## ID Strategy

To avoid ID collisions across different networks, we use **composite IDs**:

```
Original ID: "157765211"
Composite ID: "ria-157765211"
```

Format: `{network}-{original_id}`

This ensures uniqueness even if different networks use the same numeric IDs.

## API Endpoint

**POST** `/api/seed/import`

### Request Body

```json
{
  "locations": [...],        // Array of location objects
  "network": "ria",          // Network name: "ria", "western union", "moneygram", "poczta polska"
  "replace": false,          // Optional: Replace all existing locations for this network
  "countryOverride": "poland" // Optional: Force all locations to a specific country
}
```

### Data Transformation

The API automatically transforms your data:

1. **ID**: Prefixes with network name (`157765211` → `ria-157765211`)
2. **network_name**: Sets to standardized name (e.g., "Ria")
3. **subnetwork_name**: Moves raw network_name here if it's not a standard network
4. **phone**: Cleans invalid values (removes "1", empty strings, etc.)
5. **country**: Maps country codes (`PL` → `poland`)
6. **zip**: Sets to "N/A" if null

### Example Raw Data

```json
{
  "id": "157765211",
  "network_name": "Sabat Trade Int. spol. s r.o.",
  "street": "Latrán 5",
  "zip": null,
  "city": "Cesky Krumlov",
  "county": "JC",
  "country": "PL",
  "lat": 48.816817,
  "lng": 14.292514,
  "phone": "1",
  "subnetwork_name": null
}
```

### Transforms To

```json
{
  "id": "ria-157765211",
  "network_name": "Ria",
  "subnetwork_name": "Sabat Trade Int. spol. s r.o.",
  "street": "Latrán 5",
  "zip": "N/A",
  "city": "Cesky Krumlov",
  "county": "JC",
  "country": "poland",
  "lat": 48.816817,
  "lng": 14.292514,
  "phone": null,
  "is_active": true
}
```

## Using the Import Script

### Import Ria Data (Append Mode)

```bash
node scripts/import-ria-data.mjs
```

This adds Ria locations without deleting existing data.

### Import Ria Data (Replace Mode)

```bash
node scripts/import-ria-data.mjs --replace
```

This **deletes all existing Ria locations** and imports fresh data.

### Output Example

```
📖 Reading JSON file...
✅ Loaded 15432 locations

🚀 Importing to database...
   Mode: APPEND to existing locations

✅ Import completed!
   Network: Ria
   Total: 15432
   Inserted: 15432
   Failed: 0

📊 Summary by country:
   poland: 15432
```

## Country Override

If your JSON data contains incorrect country codes or you want to force all locations to a specific country, use the `countryOverride` parameter:

### When to Use Country Override

1. **Incorrect country codes in source data**: Your scraper set wrong codes
2. **Cross-border locations**: Import locations near borders as belonging to one country
3. **Data consistency**: Force all imported data to a specific country regardless of source

### Example with Country Override

```bash
curl -X POST http://localhost:3000/api/seed/import \
  -H "Content-Type: application/json" \
  -d '{
    "locations": [...],
    "network": "ria",
    "countryOverride": "poland",
    "replace": false
  }'
```

This will import all locations as Poland, even if the JSON file says `country: "LT"` or `country: "CZ"`.

### Valid Country Values

- `poland`
- `lithuania`
- `latvia`
- `estonia`

## Batch Processing

The API automatically handles large datasets by processing in batches of 1000 locations to stay within Supabase limits.

## Error Handling

- Authentication required
- Invalid network names are rejected
- Batch errors are reported separately
- Partial success is possible (some batches succeed, others fail)

## Adding Support for New Networks

To add a new network to the import system:

1. Update `NETWORK_MAP` in `app/api/seed/import/route.ts`:

```typescript
const NETWORK_MAP: Record<string, NetworkName> = {
  ria: "Ria",
  "western union": "Western Union",
  moneygram: "MoneyGram",
  "poczta polska": "Poczta Polska",
  // Add your network here
};
```

2. Create a corresponding import script in `scripts/`

## Example: Direct API Call

```bash
curl -X POST http://localhost:3000/api/seed/import \
  -H "Content-Type: application/json" \
  -d '{
    "locations": [...],
    "network": "ria",
    "replace": false
  }'
```

## Best Practices

1. **Test with small datasets first**: Use a subset of your data to test the transformation
2. **Use replace mode carefully**: It deletes ALL locations for that network
3. **Verify data quality**: Check phone numbers, coordinates, and addresses before importing
4. **Monitor the output**: Check for failed batches and errors
5. **Back up your database**: Before running large imports or using replace mode

## Troubleshooting

### "Unauthorized" error

- Make sure you're logged into the application
- The import endpoint requires authentication

### IDs already exist

- Check if you're using `replace: false` when IDs already exist
- Use `replace: true` to overwrite existing data for that network

### Country mapping issues

- Update `COUNTRY_MAP` if your data uses different country codes
- Currently supports: PL (Poland), LT (Lithuania), LV (Latvia), EE (Estonia)

### Phone number issues

- The system filters out invalid phone numbers ("1", empty strings)
- Update the phone cleaning logic if your data has different patterns
