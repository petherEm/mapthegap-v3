# Interactive Map System - Setup Guide

This document explains the map-based dashboard system that has been implemented for viewing money transfer locations across multiple countries.

## Overview

The system allows users to:
- Select from 4 countries (Poland, Lithuania, Latvia, Estonia)
- View network locations on an interactive Mapbox map
- Toggle different money transfer networks on/off
- See statistics and distribution charts
- Click on markers to view location details
- Experience smooth performance with clustering for 10k+ locations

## Tech Stack

- **Mapbox GL JS**: GPU-accelerated mapping
- **react-map-gl**: React wrapper for Mapbox
- **Supercluster**: Point clustering for performance
- **Recharts**: Charts and analytics
- **shadcn/ui**: Modern UI components
- **Supabase**: Database and authentication

## Setup Instructions

### 1. Get Mapbox Token

1. Visit https://account.mapbox.com/
2. Create a free account if you don't have one
3. Go to your Access Tokens page
4. Copy your default public token
5. Replace `YOUR_MAPBOX_TOKEN_HERE` in `.env.local` with your token:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
```

### 2. Set Up Supabase Database

1. Log in to your Supabase project at https://supabase.com
2. Go to the SQL Editor
3. Run the schema file at `lib/supabase/schema.sql`
   - This creates the `locations` table
   - Sets up indexes for performance
   - Configures Row Level Security (RLS)
   - Adds policies for authenticated users

### 3. Seed the Database

You have two options to populate the database with the 20 mock locations:

#### Option A: Use the API endpoint (Recommended)
1. Start the development server: `npm run dev`
2. Log in to your application
3. Visit: `http://localhost:3000/api/seed`
4. You should see a success message with the number of locations inserted

#### Option B: Use Supabase SQL Editor
1. Copy the data from `lib/data/mockData.ts`
2. Convert to SQL INSERT statements
3. Run in Supabase SQL Editor

### 4. Start Development

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
app/
├── (auth)/                          # Authentication routes
│   ├── login/
│   └── register/
├── (dashboard)/                     # Protected routes
│   ├── dashboard/                   # Country selection page
│   └── [country]/                   # Country-specific map page
│       └── page.tsx
components/
├── map/                             # Map components
│   ├── MapContainer.tsx             # Main map with clustering
│   ├── MapMarker.tsx                # Individual location marker
│   ├── MapClusterMarker.tsx         # Cluster marker
│   └── LocationPopup.tsx            # Marker popup details
├── dashboard/                       # Dashboard components
│   ├── CountryMapView.tsx           # Country map view wrapper
│   ├── NetworkStats.tsx             # Statistics and charts
│   └── NetworkToggle.tsx            # Network filter controls
lib/
├── data/                            # Configuration and mock data
│   ├── countries.ts                 # Country definitions
│   ├── networks.ts                  # Network configurations
│   └── mockData.ts                  # 20 mock locations
├── supabase/                        # Supabase setup
│   ├── schema.sql                   # Database schema
│   ├── queries.ts                   # Query functions
│   ├── seed.ts                      # Seed script
│   ├── client.ts                    # Browser client
│   ├── server.ts                    # Server client
│   └── middleware.ts                # Auth middleware
types/
└── index.ts                         # TypeScript definitions
```

## How It Works

### Country Selection Flow

1. User logs in and is redirected to `/dashboard`
2. Dashboard shows 4 country cards with:
   - Country flag and name
   - Available networks
   - "View Map" button
3. Clicking "View Map" navigates to `/{country_code}`

### Country Map Page

The country-specific page (`/poland`, `/lithuania`, etc.) displays:

#### Left Sidebar
- **Statistics**: Total locations and network breakdown
- **Distribution Chart**: Pie chart showing network percentages
- **Network Toggle**: Switch to show/hide networks
- **Select All / Deselect All**: Quick filter controls

#### Right Panel
- **Interactive Map**: Mapbox GL JS dark theme
- **Markers**: Custom colored pins for each network
- **Clusters**: Aggregated markers showing point count
- **Popups**: Click markers to see location details
- **Navigation**: Zoom/pan controls
- **Location Counter**: Shows active location count

### Performance Optimizations

1. **Clustering**: Supercluster aggregates nearby points
   - Reduces marker count at low zoom levels
   - Click clusters to zoom in
   - Handles 10k+ points smoothly

2. **Memoization**: React.useMemo for expensive computations
   - Cluster calculations
   - Filtered locations
   - Statistics

3. **Client-side Filtering**: Toggle networks without re-fetching
4. **Dark Map Style**: Reduces eye strain, matches app theme

## Data Structure

### Location Schema

```typescript
interface Location {
  id: string;                    // Unique identifier
  network_name: NetworkName;     // "Western Union" | "MoneyGram" | "Ria" | "Poczta Polska"
  street: string;                // Street address
  zip: string;                   // ZIP/postal code
  city: string;                  // City name
  county?: string;               // County/state (optional)
  country: CountryCode;          // "poland" | "lithuania" | "latvia" | "estonia"
  lat: number;                   // Latitude
  lng: number;                   // Longitude
  description?: string;          // Additional info (optional)
  is_active: boolean;            // Active status
  created_at?: string;           // Creation timestamp
  updated_at?: string;           // Update timestamp
}
```

## Adding More Data

### Manual Entry
Use Supabase dashboard to add rows to the `locations` table.

### Bulk Import
1. Prepare CSV/JSON with location data
2. Use Supabase's import feature
3. Or create a custom seed script

### API Integration
Create an API route to accept location data:
```typescript
// app/api/locations/route.ts
export async function POST(request: Request) {
  const location = await request.json();
  // Validate and insert
}
```

## Expanding to More Countries

1. Add country to `lib/data/countries.ts`:
```typescript
export const COUNTRIES: Record<CountryCode, Country> = {
  // ... existing countries
  germany: {
    code: "germany",
    name: "Germany",
    flag: "🇩🇪",
    networks: ["Western Union", "MoneyGram"],
    center: [10.4515, 51.1657], // [lng, lat]
    zoom: 6,
    bounds: [[5.9, 47.3], [15.0, 55.1]],
  },
};
```

2. Update TypeScript type in `types/index.ts`:
```typescript
export type CountryCode = "poland" | "lithuania" | "latvia" | "estonia" | "germany";
```

3. Add location data to Supabase

## Known Issues

### Build Issue with Turbopack
There's currently a known compatibility issue between Next.js 16 Turbopack and react-map-gl. The development server works perfectly, but production builds may fail.

**Workaround**: Use development mode for now. The Next.js team is actively working on Turbopack improvements.

### Mapbox Token
Make sure to replace the placeholder Mapbox token in `.env.local` with your actual token, otherwise maps won't load.

## Troubleshooting

### Maps not loading
- Check that `NEXT_PUBLIC_MAPBOX_TOKEN` is set in `.env.local`
- Verify token is valid at https://account.mapbox.com/
- Check browser console for errors

### No locations showing
- Run the seed script: visit `/api/seed`
- Check Supabase table has data
- Verify RLS policies allow reading

### Markers not clickable
- Check that locations have valid `lat` and `lng`
- Ensure `is_active` is `true`
- Check browser console for errors

### Performance issues
- Clustering should handle 10k+ points
- If slow, check Chrome DevTools Performance tab
- Ensure only active locations are queried

## Future Enhancements

- Search functionality for locations
- Export locations to CSV/PDF
- Directions to locations
- Favorite/bookmark locations
- Mobile app with React Native + Mapbox
- Real-time location updates
- User-submitted locations
- Advanced filtering (by city, zip, etc.)

## Support

For issues or questions:
- Check the Next.js documentation: https://nextjs.org/docs
- Mapbox GL JS docs: https://docs.mapbox.com/mapbox-gl-js/
- Supabase docs: https://supabase.com/docs

## License

This project is private and proprietary.
