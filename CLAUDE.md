# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MapTheGap is a Next.js 16 application for mapping and visualizing location networks across multiple countries and industries. Originally focused on money transfer services, it now supports **11 industry categories** including retail, ATMs, pawn shops, banking, postal services, and more. Features interactive maps, multi-network selection (max 5), industry-based filtering, and real-time statistics. Built with TypeScript, React 19, Tailwind CSS 4, Supabase PostgreSQL with PostGIS, and Mapbox GL JS for mapping.

## Common Commands

### Development

```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database

```bash
# Visit after authentication:
http://localhost:3000/api/seed        # Seed database with 20 mock locations
```

### Key Features

- **Multi-Industry Support**: 11 industry categories with flexible tagging system
  - Money Transfer, Retail, ATM, Banking, Grocery, Postal, Pharmacy, Gas Station, Convenience Store, Pawn Shop, Other
  - PostgreSQL TEXT[] tags with GIN indexes for multi-category locations
  - Auto-detection of industry/tags during import based on network names
- **Network Selection UI**: Click-to-select flow for choosing networks before viewing map
  - Browse all available networks grouped by industry
  - Select up to 5 networks (visual validation and max limit enforcement)
  - "Show on Map" button navigates with selected filters via URL parameters
  - Responsive grid layout (1 col mobile, 2 lg, 3 xl)
- **Interactive Maps**: GPU-accelerated Mapbox GL JS with two view modes:
  - **Clustered Mode**: Smart clustering using Supercluster for performance
  - **Individual Mode**: GPU-accelerated GeoJSON layer showing all 8,824+ dots simultaneously for spotting coverage gaps
- **Smart Viewport Loading**: Zoom-based strategy that loads only visible locations when zoomed in (zoom >= 8)
  - 50-100x reduction in data transfer when zoomed in
  - <500ms load times on 3G networks
  - 75% reduction in memory usage
  - Debounced fetching (500ms) to prevent excessive requests
- **Data Import System**: Web-based UI and API for bulk importing location data with industry auto-detection
  - Country override and network mapping
  - Automatic industry categorization and tag assignment
  - Brand name extraction from subnetworks
- **Pagination Support**: Handles 100k+ locations by fetching data in 1000-row batches
- **Case-Insensitive Filtering**: Smart normalization ensures "London" and "LONDON" are treated as the same city
- **Authentication**: Supabase email/password authentication with Row Level Security
- **Route Groups**: Four separate layouts: (auth), (dashboard), (map), (marketing)
- **App Shell Architecture**: Sidebar-based navigation for dashboard, dedicated map layout
  - **Dashboard Layout**: App sidebar (navigation) + top bar with user menu
  - **Map Layout**: Full-screen map with its own filter sidebar (no app sidebar overlap)
- **Collapsible Sidebars**: Space-efficient sidebars with shadcn/ui components
- **Fullscreen Mode**: Dedicated fullscreen view for map exploration
- **Network Filtering**: Select multiple networks (max 5) with real-time statistics updates
- **Real-time Statistics**: Dynamic charts and network distribution analytics (Server Components + DAL)
- **Supported Countries**: Poland, Lithuania, Latvia, Estonia, Great Britain, France, Honduras, USA
- **Dark Theme**: Consistent neutral-950 background with violet-500 accents (primary color)
- **Network Colors**: Dark orange (Ria), Yellow (Western Union), White (MoneyGram), Reddish (Poczta Polska)

## Architecture

### App Router Structure

#### Route Groups

The application uses **four route groups** for different layouts and purposes:

```
app/
├── (auth)/              # Authentication routes (login, signup)
├── (dashboard)/         # Main app with sidebar navigation
├── (map)/               # Full-screen map views (no app sidebar)
└── (marketing)/         # Public marketing pages
```

- `app/(auth)/`: Authentication routes with marketing navbar
  - `login/page.tsx`: Login page with email/password form
  - `signup/page.tsx`: Registration page
  - `callback/route.ts`: OAuth callback handler
  - `layout.tsx`: Auth layout with NavBar

- `app/(dashboard)/`: Protected routes with app shell (sidebar + topbar)
  - `dashboard/page.tsx`: Dashboard home with stats overview and quick actions
  - `maps/page.tsx`: Network selection page - choose countries and networks to view
  - `import/page.tsx`: Web-based data import UI for bulk uploading JSON files
  - `analytics/page.tsx`: Analytics page
  - `settings/layout.tsx`: Nested settings layout with sub-navigation
    - `settings/page.tsx`: Redirects to /settings/profile
    - `settings/profile/page.tsx`: User profile information
    - `settings/billing/page.tsx`: Plans and payment methods
    - `settings/security/page.tsx`: Password, 2FA, sessions
    - `settings/danger/page.tsx`: Data export, account deletion
  - `layout.tsx`: **App shell layout** with SidebarProvider + AppSidebar + AppTopBar

- `app/(map)/`: Full-screen map routes with dedicated layout (NO app sidebar)
  - `[country]/page.tsx`: Dynamic country map pages (poland, lithuania, etc.)
  - `[country]/stats/page.tsx`: Country statistics page with tabbed interface
  - `layout.tsx`: Minimal layout with just AuthProvider - map has its own sidebar

- `app/(marketing)/`: Public marketing pages with marketing navbar
  - `page.tsx`: Landing page with Hero, Features, Stats, CTA
  - `blog/`: Blog pages
  - `pricing/page.tsx`: Pricing page
  - `contact/page.tsx`: Contact page

#### API Routes

- `app/api/seed/route.ts`: Database seeding endpoint (GET for regular seed, POST for reset)
- `app/api/seed/import/route.ts`: Bulk data import API with network mapping and country override

#### Core Files

- `app/layout.tsx`: Root layout with ThemeProvider (AuthProvider moved to route-specific layouts)
- `app/globals.css`: Global styles with dark theme (violet-500 primary) and Mapbox overrides
- `proxy.ts`: Next.js 16 middleware for route protection (replaces middleware.ts)

### Component Structure

#### App Shell Components

- `components/app-sidebar.tsx`: **Main app navigation sidebar** (shadcn/ui)
  - Navigation items: Dashboard, Maps, Import, Analytics
  - Account items: Profile, Billing, Security
  - User dropdown menu in footer with sign out
  - Collapsible with icon-only mode
- `components/app-topbar.tsx`: **Top bar** with sidebar trigger, search placeholder, theme toggle
- `components/ui/sidebar.tsx`: shadcn/ui sidebar primitives (SidebarProvider, Sidebar, SidebarInset, etc.)
- `components/ui/dropdown-menu.tsx`: Dropdown menu component for user menu

#### Marketing Layout Components

- `components/navbar.tsx`: Marketing navigation with auth state, user menu
- `components/Footer.tsx`: Footer with links
- `components/Hero.tsx`: Landing page hero section
- `components/Features.tsx`: Feature cards
- `components/Stats.tsx`: Statistics section
- `components/CTA.tsx`: Call-to-action section
- `components/LogoCloud.tsx`: Logo showcase

#### Authentication Components

- `components/auth/LoginForm.tsx`: Client-side login form
- `components/auth/RegisterForm.tsx`: Client-side registration form
- `components/auth/UserMenu.tsx`: Dropdown user menu with @headlessui/react

#### Map Components

- `components/map/MapContainer.tsx`: Main map with dual-view modes and viewport tracking:
  - **Clustered Mode**: React markers with Supercluster for aggregation
  - **Individual Mode**: Mapbox GeoJSON layer for GPU-accelerated rendering of all dots
  - **Viewport Tracking**: Emits viewport bounds on moveend event for smart loading
  - **Loading Indicator**: Shows viewport loading state in top-right corner
  - Supports 100k+ locations with excellent performance
- `components/map/MapMarker.tsx`: Individual location marker with custom styling
- `components/map/MapClusterMarker.tsx`: Cluster marker showing point count
- `components/map/LocationPopup.tsx`: Location details popup with phone (tel: link) and subnetwork display

#### Dashboard Components

- `components/dashboard/CountryMapView.tsx`: **Full-screen map view** with its own collapsible sidebar for filters
  - Has its own SidebarProvider (used in `(map)` route group, NOT nested in app sidebar)
  - Manages viewport loading state and zoom threshold logic
  - Debounces viewport fetches (500ms after last map move)
  - Switches between full country data (zoom < 8) and viewport data (zoom >= 8)
  - Supports `?networks=A,B,C` URL parameter for multi-network filtering
  - Header with "Back to Maps" link, Statistics link, Restore View button
- `components/dashboard/NetworkSelectionCard.tsx`: **Network selection orchestrator** (replaces IndustryAccordion)
  - Manages selected networks state (Set<NetworkName>, max 5)
  - Coordinates NetworkTagGrid, SelectedNetworksZone, and ShowOnMapButton
  - Handles add/remove network logic with max limit validation
- `components/dashboard/NetworkTag.tsx`: Individual clickable network tag in available area
  - Shows network name and location count
  - Three states: available (clickable), selected (highlighted), disabled (max reached)
  - Visual feedback with violet-500 border/background when selected
- `components/dashboard/SelectedNetworkChip.tsx`: Selected network chip with remove button
  - Displays in "Selected Networks" zone
  - Checkmark icon (✓) and × remove button
  - violet-500/10 background with violet-500 border
- `components/dashboard/NetworkTagGrid.tsx`: Groups network tags by industry category
  - Displays industry icon and label (from INDUSTRY_CONFIG)
  - Renders NetworkTag components for each network in industry
  - Passes disabled state when max networks reached
- `components/dashboard/SelectedNetworksZone.tsx`: Shows selected networks with count indicator
  - Header shows "Selected Networks (2/5)"
  - Empty state: "Click on networks above to select (max 5)"
  - Renders SelectedNetworkChip for each selected network
- `components/dashboard/ShowOnMapButton.tsx`: Navigation button to map with selected networks
  - Disabled when 0 or >5 networks selected
  - Dynamic text: "Select networks to view on map" / "Show N network(s) on map"
  - Navigates to `/${countryCode}?networks=${networksParam}` with URL encoding
  - violet-500 background when enabled
- `components/dashboard/NetworkStats.tsx`: Statistics cards and pie chart using Recharts
- `components/dashboard/NetworkToggle.tsx`: Network filter switches
- `components/dashboard/ViewModeToggle.tsx`: Radio buttons to switch between Clustered and Individual view modes
- `components/dashboard/StatsView.tsx`: Tabbed interface for statistics (Overview, Density, Network Comparison)
- `components/dashboard/CountryStats.tsx`: Overview statistics with network breakdown pie chart
- `components/dashboard/DensityAnalysisChart.tsx`: Bar chart for location density by city
- `components/dashboard/NetworkComparisonDashboard.tsx`: Network coverage comparison view
- `components/dashboard/CountryStatsTable.tsx`: Table view for country network statistics

#### UI Components (shadcn/ui)

- `components/ui/sidebar.tsx`: Collapsible sidebar component
- `components/ui/switch.tsx`: Toggle switch for network filtering
- `components/ui/button.tsx`: Button component
- `components/ui/input.tsx`: Input field
- `components/ui/select.tsx`: Select dropdown
- `components/ui/separator.tsx`: Divider line
- `components/ui/card.tsx`: Card container
- `components/ui/badge.tsx`: Badge component

### Data Layer

#### Supabase Setup

- `lib/supabase/client.ts`: Browser-side Supabase client using @supabase/ssr
- `lib/supabase/server.ts`: Server-side client with cookie handling
- `lib/supabase/cache-client.ts`: Cache-optimized client for Server Components (service role or anon key)
- `lib/supabase/middleware.ts`: Session update helper for proxy.ts
- `lib/supabase/schema.sql`: Database schema with locations table, indexes, RLS policies, PostGIS functions
- `lib/supabase/queries.ts`: **Data Access Layer (DAL)** - Type-safe query functions for all database operations
  - All functions use helper pattern to avoid "use cache" restrictions
  - Pagination support for large datasets (1,000+ rows)
  - Viewport loading function using PostGIS spatial queries
  - Statistics functions (overview, density, network comparison, coverage)
  - Case-insensitive normalization for city/county aggregation
- `lib/supabase/seed.ts`: Database seeding utility (browser-only)

#### Configuration Files

- `lib/data/countries.ts`: Country definitions with coordinates, networks, zoom levels
  - Supports 8 countries: Poland, Lithuania, Latvia, Estonia, GB, France, Honduras, USA
  - Each country has flag emoji, center coordinates, zoom level, and map bounds
- `lib/data/networks.ts`: Network configurations with colors and logos
- `lib/data/industries.ts`: **Industry category configuration** (NEW)
  - `INDUSTRY_CONFIG`: Icons, labels, and descriptions for all 11 industry categories
  - Helper functions: `getIndustryLabel()`, `getIndustryIcon()`, `getIndustryDescription()`
  - Used for grouping networks in NetworkTagGrid component
- `lib/data/mockData.ts`: 20 mock locations for development (Poland, Lithuania, Latvia, Estonia)

#### Utilities

- `lib/utils/normalize.ts`: Data normalization functions for consistent filtering and aggregation
  - `normalizeCityName()`: Converts city names to Title Case ("LONDON" → "London")
  - `normalizeCountyName()`: Converts county names to Title Case
  - `normalizeNetworkName()`: Trims whitespace from network names
  - Used throughout the app for case-insensitive comparisons in statistics and filters

#### Context & Providers

- `context/AuthContext.tsx`: Authentication context with user state (useAuth hook)
- `context/AuthProvider.tsx`: Auth provider with session management
  - **NOTE**: AuthProvider is NOT in root layout - it's in route-specific layouts:
    - `(dashboard)/layout.tsx` - wraps app shell
    - `(map)/layout.tsx` - wraps map pages
  - This avoids build issues with static marketing pages
- `context/theme-provider.tsx`: Theme provider using next-themes (in root layout)

#### TypeScript Types

- `types/index.ts`: All TypeScript interfaces and types
  - `Location`: Location data with network, address, coordinates, **industry_category, brand_name, tags[]** (NEW)
  - `IndustryCategory`: Union type of 11 industry categories (NEW)
    - `"money_transfer" | "retail" | "atm" | "banking" | "grocery" | "postal" | "pharmacy" | "gas_station" | "convenience_store" | "pawn_shop" | "other"`
  - `IndustryBreakdown`: Industry aggregation with networks (NEW)
    - Contains category, label, icon, count, and array of NetworkInIndustry
  - `NetworkInIndustry`: Network within an industry (NEW)
    - Contains network name, count, and optional top cities
  - `CountryDashboardStats`: Country statistics for dashboard (NEW)
    - Contains country, totalLocations, industries array, lastUpdated
  - `Country`: Country definition with networks and map settings
  - `NetworkConfig`: Network branding and configuration
  - `NetworkStats`: Statistical data for charts
  - `MapCluster`: Supercluster data structure
  - `MapViewport`: Map viewport state
  - `FilterState`: Network filter state
  - `BoundingBox`: Viewport bounds for spatial queries
  - `ViewportBounds`: Extended bounds with zoom level
  - `CountryStatsOverview`: Statistics overview type
  - `DensityData`: Location density by city
  - `NetworkComparisonData`: Network coverage comparison
  - `CoverageData`: Coverage percentage data

### Data Architecture: DAL vs API Routes

**Decision**: Use **Data Access Layer (DAL)** + **Server Components** instead of API Routes for data fetching.

#### Why DAL over API Routes?

**✅ Benefits of DAL Pattern**:
1. **Type Safety**: Direct TypeScript types from database to component
2. **Performance**: No HTTP roundtrip - direct database queries
3. **Server Components**: Leverage React 19 Server Components for data fetching
4. **Code Colocation**: Data fetching logic near business logic
5. **Simpler Testing**: Mock Supabase client instead of HTTP endpoints
6. **Better DX**: Direct function imports vs fetch calls

**❌ Drawbacks of API Routes**:
1. **Extra HTTP Layer**: Unnecessary roundtrip from server → API → database
2. **Serialization Overhead**: JSON stringify/parse on every request
3. **More Boilerplate**: Route handlers, request/response objects
4. **Harder Testing**: Need to test HTTP layer separately
5. **Type Loss**: Manual type assertions on fetch responses

#### When to Use API Routes

Use API routes when:
- **Client-side mutations**: POST/PUT/DELETE from client components
- **Webhooks**: External services calling your app
- **File uploads**: Handling multipart form data
- **Rate limiting**: Need middleware for protection
- **Authentication**: OAuth callbacks, third-party integrations

#### DAL Implementation Pattern

```typescript
// lib/supabase/queries.ts - DAL Layer
async function getLocationsByCountryHelper(
  countryCode: CountryCode
): Promise<Location[]> {
  const supabase = createCacheClient();
  // ... fetch logic with pagination
  return locations;
}

export async function getLocationsByCountry(
  countryCode: CountryCode
): Promise<SupabaseResponse<Location[]>> {
  try {
    const locations = await getLocationsByCountryHelper(countryCode);
    return { data: locations, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
```

```typescript
// app/(dashboard)/[country]/page.tsx - Server Component
export default async function CountryMapPage({ params }: PageProps) {
  const { country } = await params;

  // Direct DAL call - no fetch() needed
  const { data: locations } = await getLocationsByCountry(countryCode);

  return <CountryMapView locations={locations} />;
}
```

#### Statistics Architecture

Previously used API routes (`/api/stats/*`), now migrated to DAL + Server Components:

**Before**:
```typescript
// ❌ Old pattern: API route
// app/api/stats/overview/route.ts
export async function GET(request: Request) {
  const { data } = await getCountryStatsOverview(country);
  return Response.json(data);
}

// Client component fetches
const response = await fetch('/api/stats/overview?country=poland');
const data = await response.json();
```

**After**:
```typescript
// ✅ New pattern: Server Component + DAL
// app/(dashboard)/[country]/stats/page.tsx
export default async function StatsPage({ params }: PageProps) {
  const { country } = await params;

  // Direct DAL call
  const { data: overview } = await getCountryStatsOverview(countryCode);

  return <StatsView overview={overview} />;
}
```

**Benefits**:
- No API routes needed for read operations
- Type-safe data flow from database to UI
- Faster page loads (no extra HTTP layer)
- Automatic caching via Server Components
- Simpler codebase (fewer files)

### Industry Categorization System

**Goal**: Support locations beyond money transfer - retail stores, ATMs, pawn shops, banks, etc.

#### Architecture Decision

Chose **PostgreSQL TEXT[] array with GIN indexes** over separate junction tables:

**Benefits**:
1. **Flexibility**: Locations can have multiple categories (e.g., "grocery store with ATM")
2. **Performance**: GIN indexes enable fast array queries (`tags @> ARRAY['atm']`)
3. **Simplicity**: No join tables needed, direct array operations
4. **Native Support**: PostgreSQL has excellent array support
5. **Future-proof**: Can add any number of tags without schema changes

#### Database Schema (Migration 004)

Added 3 new fields to `locations` table:

```sql
-- Primary industry category (single value)
industry_category TEXT DEFAULT 'money_transfer'
  CHECK (industry_category IN (
    'money_transfer', 'retail', 'atm', 'banking', 'grocery',
    'postal', 'pharmacy', 'gas_station', 'convenience_store',
    'pawn_shop', 'other'
  )),

-- Brand name (e.g., "Walmart", "PEKAO SA")
brand_name TEXT,

-- Multi-category tags array
tags TEXT[] DEFAULT ARRAY['money_transfer'],

-- Indexes for performance
CREATE INDEX idx_locations_industry ON locations(industry_category);
CREATE INDEX idx_locations_brand ON locations(brand_name);
CREATE INDEX idx_locations_tags ON locations USING GIN(tags);
CREATE INDEX idx_locations_country_industry ON locations(country, industry_category);
```

#### Auto-Detection During Import

The import API (`/api/seed/import`) automatically detects industry and tags based on network name:

```typescript
function detectIndustryCategory(networkName: string): IndustryCategory {
  const normalized = networkName.toLowerCase();

  if (normalized.includes("loombard") || normalized.includes("lombard")) {
    return "pawn_shop";
  }
  if (normalized.includes("euronet") || normalized.includes("atm")) {
    return "atm";
  }
  if (normalized.includes("walmart") || normalized.includes("target")) {
    return "retail";
  }
  // ... more detection rules
  return "money_transfer"; // default
}

function detectTags(networkName: string, industryCategory: IndustryCategory): string[] {
  const tags: string[] = [];

  if (industryCategory === "pawn_shop") {
    tags.push("pawn_shop", "loans", "buy_sell");
  } else if (industryCategory === "atm") {
    tags.push("atm", "cash_withdrawal");
  }
  // ... more tag rules

  return tags.length > 0 ? tags : ["money_transfer"];
}
```

**Benefits**:
- Backward compatible (old imports still work with defaults)
- No manual category assignment needed
- Can override with explicit values in import JSON
- Smart defaults based on common patterns

#### Industry Configuration

`lib/data/industries.ts` defines visual configuration for all categories:

```typescript
export const INDUSTRY_CONFIG: Record<IndustryCategory, {
  icon: string;
  label: string;
  description: string;
}> = {
  money_transfer: {
    icon: "💰",
    label: "Money Transfer",
    description: "Money transfer and remittance services",
  },
  pawn_shop: {
    icon: "💎",
    label: "Pawn Shops",
    description: "Pawn shops and loan services",
  },
  retail: {
    icon: "🏬",
    label: "Retail",
    description: "Retail stores and shopping centers",
  },
  // ... 8 more categories
};
```

#### Querying by Industry

Get industry breakdown for a country with pagination:

```typescript
const { data: industries } = await getCountryIndustryBreakdown("poland");

// Returns:
[
  {
    category: "money_transfer",
    label: "Money Transfer",
    icon: "💰",
    count: 7234,
    networks: [
      { name: "Ria", count: 4234 },
      { name: "Western Union", count: 2000 },
      { name: "MoneyGram", count: 1000 }
    ]
  },
  {
    category: "pawn_shop",
    label: "Pawn Shops",
    icon: "💎",
    count: 523,
    networks: [
      { name: "Loombard", count: 523 }
    ]
  }
]
```

#### Migration Files

**Migration 004** (`lib/supabase/migrations/004_add_industry_and_tags.sql`):
- Adds 3 new fields with defaults
- Creates 4 performance indexes
- Migrates existing data to defaults
- Idempotent (safe to re-run with DROP IF EXISTS / CREATE IF NOT EXISTS)

**Migration 005** (`lib/supabase/migrations/005_recategorize_loombard.sql`):
- Recategorizes Loombard from money_transfer to pawn_shop
- Updates tags to `['pawn_shop', 'loans', 'buy_sell']`
- Fixes initial categorization mistake

### Network Selection UI

**Goal**: Give users control over which networks to view BEFORE navigating to map.

#### User Flow

**Old Flow** (Accordion-based):
1. Click industry accordion → expands
2. Click network → navigates immediately to map
3. No preview, no multi-select

**New Flow** (Click-to-Select):
1. **Dashboard Landing**: See all countries in responsive grid (1 col mobile, 2 lg, 3 xl)
2. **Browse Networks**: Each country shows available networks grouped by industry
3. **Select Networks**: Click network tags to select (max 5, visual validation)
4. **Preview Selection**: Selected networks appear in "Selected Networks (2/5)" zone
5. **Show on Map**: Click button to navigate with `?networks=A,B,C` parameter

#### Component Architecture

```
NetworkSelectionCard (orchestrator, state: selectedNetworks)
├── NetworkTagGrid
│   └── NetworkTag × N (clickable, shows count, 3 visual states)
├── SelectedNetworksZone
│   └── SelectedNetworkChip × N (removable, checkmark icon)
└── ShowOnMapButton (navigates when clicked)
```

**State Management**:
```typescript
const [selectedNetworks, setSelectedNetworks] = useState<Set<NetworkName>>(new Set());
const MAX_NETWORKS = 5;
const maxReached = selectedNetworks.size >= MAX_NETWORKS;
```

#### Visual States

**NetworkTag** (available area):
- **Available**: Outlined, hover effect, cursor pointer
- **Selected**: violet-500 border, violet-500/10 background, checkmark
- **Disabled**: Opacity 50%, cursor not-allowed (when max reached)

**SelectedNetworkChip** (selected zone):
- violet-500 border, violet-500/10 background
- Checkmark icon (✓) on left
- Remove button (×) on right with hover effect

**ShowOnMapButton**:
- **Disabled** (0 or >5): Gray background, "Select networks to view on map"
- **Enabled** (1-5): violet-500 background, "Show N network(s) on map"

#### URL Parameter Strategy

**New Format**:
```
?networks=Ria,Western Union,Loombard  # Comma-separated, max 5
```

**Legacy Formats** (still supported for backward compatibility):
```
?industry=money_transfer              # Filter by industry
?network=Ria                          # Single network
?industry=pawn_shop&network=Loombard  # Industry + network
```

**Priority Order** in `CountryMapView`:
1. **Priority 1**: `networks` parameter (comma-separated list)
2. **Priority 2**: `industry` parameter
3. **Priority 3**: `network` parameter (legacy single)

**Implementation**:
```typescript
const networksParam = searchParams.get("networks");

useEffect(() => {
  // Priority 1: Handle comma-separated networks list
  if (networksParam) {
    const networkList = networksParam
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    setActiveNetworks(new Set(networkList as NetworkName[]));
    return; // Stop, don't process other params
  }

  // Priority 2 & 3: Handle industry/network params...
}, []);
```

#### Validation Rules

- **Minimum**: 0 networks (button disabled)
- **Maximum**: 5 networks (tags become disabled)
- **Show on Map**: Enabled only when 1-5 networks selected
- **Selected Tags**: Always clickable (to deselect)
- **Available Tags**: Disabled if max reached (unless already selected)

#### Performance

- **State Updates**: O(1) Set operations for add/remove
- **Rendering**: Only affected components re-render (isolated subtree)
- **Navigation**: Client-side router push (no page reload)
- **Memory**: Set<NetworkName> holds max 5 items (~100 bytes)

#### Implementation Details

See `NETWORK_SELECTION_UI.md` for complete implementation guide including:
- Detailed component hierarchy
- Step-by-step user flow mockups
- Testing checklist
- Edge cases handled
- Future enhancements (drag-and-drop, keyboard navigation)

### Styling System

#### Theme Colors

- **Background**: `neutral-950` (oklch(0.08 0 0))
- **Foreground**: `neutral-50` (oklch(0.98 0 0))
- **Primary**: `violet-500` (oklch(0.606 0.25 292.717)) - changed from rose-500
- **Cards**: `neutral-900` (oklch(0.15 0 0))
- **Borders**: `neutral-800` (oklch(0.2 0 0))
- **Accent**: `violet-400` for highlights, `violet-500/10` for subtle backgrounds

#### Tailwind CSS 4

- **PostCSS Architecture**: `@tailwindcss/postcss` plugin
- **Inline Theme**: `@theme inline` directive for CSS variable integration
- **Custom Properties**: All theme variables defined in `globals.css`
- **Dark by Default**: Dark theme without requiring `dark:` variants

#### Mapbox Styling

```css
/* Custom Mapbox popup styling */
.mapboxgl-popup-content {
  background: transparent !important;
}
.mapboxgl-popup-tip {
  border-top-color: #171717 !important;
}
.mapboxgl-ctrl-group {
  background: #171717 !important;
}
```

### Authentication Flow

1. **Unauthenticated User**:

   - Lands on marketing page (`/`)
   - Can access `/login` and `/register`
   - Redirected to `/login` when accessing protected routes

2. **Login Process**:

   - User submits email/password via `LoginForm`
   - Supabase validates credentials
   - Session cookie set via `@supabase/ssr`
   - Redirected to `/dashboard`

3. **Protected Routes**:

   - `proxy.ts` checks session on every request
   - Redirects to `/login` if not authenticated
   - Redirects to `/dashboard` if accessing auth routes while logged in

4. **Session Management**:
   - `AuthProvider` monitors auth state changes
   - Updates React context on session changes
   - Automatic token refresh via Supabase

### Map System

#### Data Flow

1. Server fetches locations from Supabase (`getLocationsByCountry`) using pagination
2. Data passed to `CountryMapView` client component
3. `MapContainer` dynamically imported with `ssr: false`
4. Based on `viewMode`, either Supercluster or Mapbox GeoJSON layer renders points
5. Map renders markers/clusters (clustered mode) or native circles (individual mode)

#### Dual View Modes

**Clustered Mode (Default)**:

- Uses React markers (`<Marker>`) with Supercluster aggregation
- **Algorithm**: Supercluster with 75px radius, zoom 0-20
- **Performance**: Handles 10k+ points smoothly with client-side clustering
- **Use Case**: Standard navigation and exploration
- **Interactive**: Click clusters to zoom, click markers for popups

**Individual Mode**:

- Uses Mapbox native GeoJSON layer with GPU-accelerated rendering
- **Performance**: Renders 8,824+ dots at ~60 FPS
- **Implementation**: `map.addLayer()` with circle paint properties
- **Use Case**: Spotting coverage gaps and distribution patterns
- **Styling**: 4px circles with network colors, white stroke
- **Interactive**: Click dots for popups, cursor changes on hover

**Technical Implementation** (MapContainer.tsx:119-208):

```typescript
useEffect(() => {
  const map = mapRef.current?.getMap();
  if (!map) return;

  const setupLayers = () => {
    if (viewMode === "individual") {
      // Create GeoJSON feature collection
      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: filteredLocations.map((loc) => ({
          type: "Feature",
          properties: {
            id: loc.id,
            network: loc.network_name,
            color: NETWORKS[loc.network_name].color,
          },
          geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
        })),
      };

      // Add Mapbox source and circle layer
      map.addSource("locations-individual", { type: "geojson", data: geojson });
      map.addLayer({
        id: "locations-individual-layer",
        type: "circle",
        source: "locations-individual",
        paint: {
          "circle-radius": 4,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.9,
        },
      });

      // Add click and hover handlers
      map.on("click", "locations-individual-layer", handleClick);
      map.on(
        "mouseenter",
        "locations-individual-layer",
        () => (map.getCanvas().style.cursor = "pointer")
      );
    } else {
      // Clean up when switching to clustered mode
      map.removeLayer("locations-individual-layer");
      map.removeSource("locations-individual");
    }
  };
}, [viewMode, filteredLocations]);
```

#### Network Filtering

- Client-side filtering using React state
- No re-fetch required when toggling networks
- Real-time statistics update based on active networks
- Filters apply to both clustered and individual modes

#### Fullscreen Mode

- CSS-based fullscreen using `fixed inset-0 z-50`
- Toggle button in header
- Exit button overlays map when active
- Smooth transitions

### Smart Viewport Loading

Implemented to dramatically reduce initial load times and improve performance, especially on mobile networks.

#### Performance Impact

**Before Viewport Loading**:
- Initial Load: 8,824 locations (2-3MB JSON)
- Load Time: 2-3 seconds on 3G
- Memory: ~15-20MB in browser
- Scale Limit: ~10,000 locations before severe lag

**After Viewport Loading**:
- Initial Load: Same (full country for clustering)
- Viewport Load: 50-500 locations (10-50KB JSON)
- Load Time: <500ms on 3G
- Memory: 75% reduction when zoomed in (~2-5MB)
- Scale Limit: Unlimited (viewport always shows manageable subset)

**Result**: 50-100x reduction in data transfer when zoomed in

#### Zoom-Based Strategy

**Zoom Level < 8 (Country View)**:
- Behavior: Load full country dataset
- Reason: Clustered view needs all points for accurate clustering
- Data: ~8,824 locations for Poland
- Use Case: Overview, initial landing, browsing

**Zoom Level >= 8 (City/Neighborhood View)**:
- Behavior: Load only viewport locations
- Reason: Individual mode, fewer points visible
- Data: ~50-500 locations per viewport
- Use Case: Detailed exploration, finding specific locations

#### Implementation Details

**State Management** (CountryMapView.tsx):

```typescript
// Viewport loading state
const [isViewportLoading, setIsViewportLoading] = useState(false);
const [viewportLocations, setViewportLocations] = useState<Location[]>([]);
const [currentZoom, setCurrentZoom] = useState(country.zoom);

// Zoom threshold: < 8 = full country, >= 8 = viewport mode
const VIEWPORT_MODE_ZOOM_THRESHOLD = 8;
const useViewportMode = currentZoom >= VIEWPORT_MODE_ZOOM_THRESHOLD;
```

**Debounced Fetching**:
- Wait 500ms after last map move before fetching
- Prevents excessive requests during panning/zooming
- Clears previous timeout on new move event
- Shows loading indicator during fetch

**Smart Location Selection**:
```typescript
// Use viewport data if zoomed in and available, otherwise full dataset
const locationsToFilter = useViewportMode && viewportLocations.length > 0
  ? viewportLocations
  : locations;
```

**PostGIS Spatial Query** (queries.ts):

```typescript
export async function getLocationsInViewport(
  countryCode: CountryCode,
  bounds: BoundingBox
): Promise<SupabaseResponse<Location[]>> {
  const { data, error } = await supabase.rpc("get_locations_in_viewport", {
    p_country: countryCode,
    p_west: bounds.west,
    p_south: bounds.south,
    p_east: bounds.east,
    p_north: bounds.north,
  });
  // Returns only locations within bounding box
}
```

**Viewport Tracking** (MapContainer.tsx):

```typescript
const handleMoveEnd = useCallback(() => {
  if (!onViewportChange) return;

  const map = mapRef.current?.getMap();
  const bounds = map.getBounds();
  const zoom = map.getZoom();

  onViewportChange({
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    zoom,
  });
}, [onViewportChange]);
```

#### User Experience

- **Seamless Transitions**: Switching between zoom levels feels instant
- **Loading Indicator**: Small badge in top-right corner during viewport fetch
- **No Flickering**: Keeps existing data until new data arrives
- **Intelligent Caching**: Full dataset remains in memory for zooming out

#### See Also

- `VIEWPORT_LOADING_IMPLEMENTATION.md` - Detailed implementation plan and architecture
- `lib/supabase/schema.sql` - PostGIS function `get_locations_in_viewport`
- `components/dashboard/CountryMapView.tsx` - Viewport state management
- `components/map/MapContainer.tsx` - Viewport tracking and callbacks

### Data Import System

The application supports bulk importing location data from JSON files with automatic transformation and validation.

#### Import Methods

**1. Web UI** (`/import` page):

- File upload interface with drag-and-drop support
- Network selection dropdown (Ria, Western Union, MoneyGram, Poczta Polska)
- Country override dropdown (force all locations to specific country)
- Replace existing data checkbox
- Real-time upload progress and error reporting

**2. API Endpoint** (`/api/seed/import`):

- POST endpoint accepting JSON array of locations
- Supports batch processing of 1,000 rows at a time
- Returns detailed success/error messages

#### Data Transformation Pipeline

**Input Format** (example from ria_poland_ready.json):

```json
{
  "id": "157765211",
  "name": "Location Name",
  "street": "ul. Przykładowa 123",
  "zip": "00-001",
  "city": "Warsaw",
  "county": "Mazowieckie",
  "country": "PL",
  "lat": 52.2297,
  "lng": 21.0122,
  "phone": "+48 22 123 4567",
  "description": "Near city center"
}
```

**Transformation Process** (app/api/seed/import/route.ts):

1. **Composite ID Generation**:

   - Prefix original ID with network name to prevent collisions
   - Format: `{network}-{originalId}` (e.g., `ria-157765211`)
   - Ensures uniqueness when importing from multiple networks

2. **Network Name Mapping**:

```typescript
const NETWORK_MAP: Record<string, NetworkName> = {
  ria: "Ria",
  "western union": "Western Union",
  moneygram: "MoneyGram",
  "poczta polska": "Poczta Polska",
};
```

3. **Country Code Mapping**:

```typescript
const COUNTRY_MAP: Record<string, CountryCode> = {
  PL: "poland",
  LT: "lithuania",
  LV: "latvia",
  EE: "estonia",
};
```

4. **Phone Number Cleaning**:

   - Removes spaces, dashes, parentheses
   - Standardizes format to E.164 where possible

5. **Country Override** (optional):
   - Forces all imported locations to specific country
   - Useful when source data has incorrect country codes
   - Bypasses COUNTRY_MAP transformation

**Output Format** (inserted into Supabase):

```typescript
{
  id: "ria-157765211",
  network_name: "Ria",
  subnetwork_name: null,
  street: "ul. Przykładowa 123",
  zip: "00-001",
  city: "Warsaw",
  county: "Mazowieckie",
  country: "poland",
  lat: 52.2297,
  lng: 21.0122,
  phone: "+48221234567",
  description: "Near city center",
  is_active: true
}
```

#### Batch Processing

Supabase has insertion limits, so large datasets are processed in batches:

```typescript
const batchSize = 1000;
for (let i = 0; i < transformedLocations.length; i += batchSize) {
  const batch = transformedLocations.slice(i, i + batchSize);
  const { error } = await supabase.from("locations").insert(batch);
  if (error) throw error;
}
```

#### Replace vs. Append Mode

- **Append Mode** (default): Adds new locations without deleting existing ones
- **Replace Mode** (`replace: true`): Deletes all existing data before importing
  - Uses `.delete().neq("id", "")` to clear all rows
  - Useful for complete data refreshes

#### Error Handling

- Validates required fields (network, country)
- Returns detailed error messages for debugging
- Rolls back on batch insertion failures
- Logs transformation errors with row numbers

### Pagination Strategy

Supabase enforces a hard limit of **1,000 rows per API request**, regardless of `.limit()` values. For datasets exceeding this limit, pagination is required.

#### The Problem

```typescript
// ❌ This will only return 1,000 rows maximum
const { data } = await supabase
  .from("locations")
  .select("*")
  .eq("country", "poland")
  .limit(100000); // Limit is ignored beyond 1,000
```

#### The Solution

Implemented in `lib/supabase/queries.ts` for all query functions:

```typescript
export async function getLocationsByCountry(
  countryCode: CountryCode,
  isServer = false
): Promise<SupabaseResponse<Location[]>> {
  const supabase = isServer
    ? await createServerClient()
    : createBrowserClient();

  const PAGE_SIZE = 1000;
  let allLocations: Location[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("country", countryCode)
      .eq("is_active", true)
      .order("city")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1); // Key: range() for pagination

    if (error) {
      return { data: null, error: error as Error };
    }

    if (data && data.length > 0) {
      allLocations = [...allLocations, ...data];
      hasMore = data.length === PAGE_SIZE; // Stop if less than full page returned
      page++;
    } else {
      hasMore = false;
    }
  }

  return { data: allLocations as Location[], error: null };
}
```

#### How It Works

1. **Page Size**: Fixed at 1,000 (Supabase maximum)
2. **Range Queries**: `.range(start, end)` fetches specific row ranges
   - Page 0: rows 0-999
   - Page 1: rows 1000-1999
   - Page 2: rows 2000-2999
   - etc.
3. **Accumulation**: Concatenates results from each page
4. **Termination**: Stops when a page returns fewer than 1,000 rows
5. **Error Handling**: Returns immediately on first error

#### Functions Using Pagination

- `getLocationsByCountry(countryCode)` - Lines 32-76
- `getLocationsByCountryAndNetworks(countryCode, networkNames)` - Lines 101-147
- `getAllLocations()` - Uses `.limit(100000)` (sufficient for global queries)
- `searchLocations(query, countryCode?)` - Uses `.limit(100000)` (sufficient for search results)

#### Performance Considerations

- **Server-side**: Pagination happens during SSR, user sees complete data immediately
- **Client-side**: Would show loading states between pages (not currently implemented)
- **Network overhead**: Multiple roundtrips, but necessary for correctness
- **Memory**: Accumulates all results in memory (acceptable for up to 100k locations)

#### Cache Management

When data changes (imports, updates):

1. Clear Next.js cache: `rm -rf .next`
2. Restart dev server
3. Hard refresh browser (Cmd+Shift+R)

This ensures pagination fetches fresh data from Supabase.

### Important Next.js 16 Changes

#### proxy.ts vs middleware.ts

**Next.js 16 uses `proxy.ts` instead of `middleware.ts`**:

```typescript
// proxy.ts
export async function proxy(request: NextRequest) {
  // Middleware logic here
}
```

#### "use cache" Directive Restrictions

**CRITICAL**: Next.js 16 does NOT allow `"use cache"` directives in files imported by Client Components.

**The Problem**:
```typescript
// ❌ This will cause build error if imported by client component
"use cache";

async function getCachedLocations() {
  // ...
}
```

**Error Message**:
```
Ecmascript file had an error
./lib/supabase/queries.ts

It is not allowed to define inline "use cache" annotated functions in Client Components.
```

**Solution - Use Helper Pattern**:
```typescript
// ✅ Correct: No "use cache" in files imported by client components
async function getLocationsByCountryHelper(countryCode: CountryCode): Promise<Location[]> {
  const supabase = createCacheClient();
  // ... data fetching logic
  return locations;
}

// Public wrapper
export async function getLocationsByCountry(
  countryCode: CountryCode
): Promise<SupabaseResponse<Location[]>> {
  try {
    const locations = await getLocationsByCountryHelper(countryCode);
    return { data: locations, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
```

**Key Takeaways**:
- **DAL files** (`lib/supabase/queries.ts`) should NOT use `"use cache"` if imported by client components
- Use **Server Components** for data fetching to leverage caching
- **PostGIS spatial indexes** make viewport queries fast (<50ms) without caching
- Create separate cached-only files if needed for pure server-side operations

#### Mapbox Integration

**Import from specific subpath**:

```typescript
// ✅ Correct (Next.js 16 + Turbopack)
import Map from "react-map-gl/mapbox";

// ❌ Incorrect
import Map from "react-map-gl";
```

#### Dynamic Imports Required

**Always use dynamic imports for Mapbox components**:

```typescript
const MapContainer = dynamic(
  () => import("@/components/map/MapContainer").then((mod) => mod.MapContainer),
  { ssr: false }
);
```

## Dependencies

### Core

- **Next.js 16.0.1**: App Router, Turbopack, React Server Components
- **React 19.2.0**: Latest with React Compiler
- **TypeScript 5**: Full type safety

### UI/Styling

- **Tailwind CSS 4**: PostCSS-based architecture
- **@headlessui/react 2.2.9**: Unstyled accessible components
- **@heroicons/react 2.2.0**: Icon library
- **shadcn/ui**: Radix UI components (button, switch, sidebar, etc.)
- **tw-animate-css**: Animation utilities

### Mapping

- **mapbox-gl 3.16.0**: WebGL-based mapping library
- **react-map-gl 8.1.0**: React wrapper for Mapbox (import from `/mapbox` subpath)
- **supercluster 8.0.1**: Point clustering algorithm

### Data Visualization

- **recharts 3.3.0**: React charts library for statistics

### Backend

- **@supabase/supabase-js 2.78.0**: Supabase client
- **@supabase/ssr 0.7.0**: SSR helpers for authentication

### Utilities

- **class-variance-authority**: Styling utilities
- **clsx**: Conditional classnames
- **tailwind-merge**: Merge Tailwind classes
- **lucide-react**: Additional icons

## Environment Variables

Required in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Mapbox (must start with pk.)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
```

## Database Schema

### locations Table

The schema is fully **idempotent** - it can be run multiple times safely without errors.

```sql
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  network_name TEXT NOT NULL CHECK (network_name IN ('Western Union', 'MoneyGram', 'Ria', 'Poczta Polska')),
  subnetwork_name TEXT, -- Optional subnetwork (e.g., "PEKAO SA" for Western Union, "Poczta Polska" for Ria)
  street TEXT NOT NULL,
  zip TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT,
  country TEXT NOT NULL CHECK (country IN ('poland', 'lithuania', 'latvia', 'estonia', 'gb', 'france', 'honduras', 'usa')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT, -- Contact phone number (e.g., "+48 22 123 4567")
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Industry categorization (added in migration 004)
  industry_category TEXT DEFAULT 'money_transfer'
    CHECK (industry_category IN (
      'money_transfer', 'retail', 'atm', 'banking', 'grocery',
      'postal', 'pharmacy', 'gas_station', 'convenience_store',
      'pawn_shop', 'other'
    )),
  brand_name TEXT, -- Brand name (e.g., "Walmart", "PEKAO SA", extracted from subnetwork)
  tags TEXT[] DEFAULT ARRAY['money_transfer'], -- Multi-category tags for flexible categorization

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### New Fields (Added During Development)

**phone** (TEXT, optional):

- Contact phone number for the location
- Format: International format preferred (e.g., "+48 22 123 4567")
- Displayed as clickable `tel:` link in LocationPopup
- Added to support customer service and location verification

**subnetwork_name** (TEXT, optional):

- Optional sub-network or partner network
- Examples:
  - Western Union locations might operate via "PEKAO SA" or "PKO BP" banks
  - Ria locations might operate via "Poczta Polska" post offices
- Helps identify the actual operator when locations are franchised or partnered
- Displayed below network name in LocationPopup

**industry_category** (TEXT, required, added in migration 004):

- Primary industry classification (single value)
- Default: `'money_transfer'` for backward compatibility
- 11 supported categories: money_transfer, retail, atm, banking, grocery, postal, pharmacy, gas_station, convenience_store, pawn_shop, other
- Used for grouping networks in dashboard UI
- Auto-detected during import based on network name patterns

**brand_name** (TEXT, optional, added in migration 004):

- Brand name for the location (e.g., "Walmart", "PEKAO SA")
- Often extracted from subnetwork_name during import
- Helps identify retail brands vs. generic networks
- Used for additional filtering and analytics

**tags** (TEXT[], required, added in migration 004):

- Multi-category tags array for flexible categorization
- Default: `ARRAY['money_transfer']` for backward compatibility
- Examples: `['atm', 'cash_withdrawal']`, `['pawn_shop', 'loans', 'buy_sell']`
- Enables locations with multiple services (e.g., "grocery store with ATM")
- Indexed with GIN for fast array queries: `tags @> ARRAY['atm']`
- Auto-detected during import based on industry category

### Idempotent Schema Pattern

To allow safe re-running of schema.sql, all database objects use `IF NOT EXISTS` or `DROP IF EXISTS`:

**Triggers**:

```sql
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**RLS Policies**:

```sql
DROP POLICY IF EXISTS "Allow authenticated users to read locations" ON locations;
DROP POLICY IF EXISTS "Allow authenticated users to insert locations" ON locations;
DROP POLICY IF EXISTS "Allow authenticated users to update locations" ON locations;
DROP POLICY IF EXISTS "Allow authenticated users to delete locations" ON locations;

CREATE POLICY "Allow authenticated users to read locations"
  ON locations FOR SELECT
  USING (auth.role() = 'authenticated');

-- ... other policies
```

This pattern prevents errors like:

- `ERROR: 42710: trigger 'update_locations_updated_at' for relation 'locations' already exists`
- `ERROR: 42710: policy 'Allow authenticated users to read locations' for table 'locations' already exists`

### Indexes

**Original Indexes**:
- `idx_locations_country`: Faster country filtering (`WHERE country = 'poland'`)
- `idx_locations_network`: Faster network filtering (`WHERE network_name = 'Ria'`)
- `idx_locations_active`: Faster active status filtering (`WHERE is_active = true`)
- `idx_locations_country_network`: Composite index for common queries (`WHERE country = 'poland' AND network_name = 'Ria'`)

**Industry Indexes** (added in migration 004):
- `idx_locations_industry`: Faster industry filtering (`WHERE industry_category = 'pawn_shop'`)
- `idx_locations_brand`: Faster brand filtering (`WHERE brand_name = 'Walmart'`)
- `idx_locations_tags`: **GIN index** for array queries (`WHERE tags @> ARRAY['atm']`)
- `idx_locations_country_industry`: Composite index for industry breakdown queries

All indexes use `CREATE INDEX IF NOT EXISTS` for idempotency.

### Row Level Security (RLS)

- Enabled on `locations` table
- Authenticated users can read, insert, update, delete
- Unauthenticated users have no access
- Policies defined in `lib/supabase/schema.sql`

## Development Workflow

### Initial Setup

1. Clone repository
2. Run `npm install`
3. Create `.env.local` with required environment variables
4. Get Mapbox token from https://account.mapbox.com/
5. Set up Supabase project at https://supabase.com
6. Run schema SQL in Supabase SQL Editor
7. Start dev server: `npm run dev`

### Database Seeding

**Option 1: Mock Data (Development)**

1. Log in to application
2. Visit `http://localhost:3000/api/seed`
3. Confirms 20 mock locations inserted (Poland, Lithuania, Latvia, Estonia)
4. Can re-seed by visiting `/api/seed?reset=true`

**Option 2: Bulk Import (Production Data)**

1. Log in to application
2. Navigate to `http://localhost:3000/import`
3. Select network from dropdown (Ria, Western Union, MoneyGram, Poczta Polska)
4. Optionally select country override to force all locations to specific country
5. Choose JSON file to upload (see `Data Import System` section for format)
6. Click "Import Locations"
7. Wait for batch processing to complete (1,000 rows per batch)
8. View imported locations on country map pages

**Data Requirements**:

- JSON file must be array of location objects
- Required fields: `id`, `street`, `zip`, `city`, `country`, `lat`, `lng`
- Optional fields: `phone`, `county`, `description`, `subnetwork_name`, `industry_category`, `brand_name`, `tags`
- Country codes: `PL` (poland), `LT` (lithuania), `LV` (latvia), `EE` (estonia), `GB` (gb), `FR` (france), `HN` (honduras), `US` (usa)

### Adding New Countries

Recently added: **France, Honduras, USA** (in addition to original Poland, Lithuania, Latvia, Estonia, GB)

**Steps to add a new country**:

1. **Update TypeScript Types** (`types/index.ts`):
   ```typescript
   export type CountryCode =
     | "poland" | "lithuania" | "latvia" | "estonia"
     | "gb" | "france" | "honduras" | "usa"
     | "your_new_country"; // Add here
   ```

2. **Add Country Definition** (`lib/data/countries.ts`):
   ```typescript
   your_new_country: {
     code: "your_new_country",
     name: "Your New Country",
     flag: "🏳️", // Country flag emoji
     networks: [], // Initially empty, populated from database
     center: [lng, lat], // Map center coordinates
     zoom: 6, // Initial zoom level
     bounds: [[west, south], [east, north]], // Geographic bounds
   }
   ```

3. **Update Database Schema** (`lib/supabase/schema.sql`):
   ```sql
   country TEXT NOT NULL CHECK (country IN (
     'poland', 'lithuania', 'latvia', 'estonia', 'gb',
     'france', 'honduras', 'usa', 'your_new_country' -- Add here
   ))
   ```

4. **Update Country Mapping** (`app/api/seed/import/route.ts`):
   ```typescript
   const COUNTRY_MAP: Record<string, CountryCode> = {
     // ... existing mappings
     YC: "your_new_country", // Add ISO 3166-1 alpha-2 code mapping
   };
   ```

5. **Import Location Data**: Use `/import` page with country override or ensure data has correct country code

6. **Test**: Dynamic route `[country]` will automatically work at `/your_new_country`

### Adding New Networks

1. Add to `NetworkName` type in `types/index.ts`
2. Add network config to `NETWORKS` in `lib/data/networks.ts`
3. Add logo to `/public/logos/` directory
4. Update database CHECK constraint if needed

## Common Patterns

### App Shell Layout Pattern

```typescript
// app/(dashboard)/layout.tsx - Dashboard with sidebar + topbar
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-topbar";
import { AuthProvider } from "@/context/AuthProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="bg-neutral-950">
          <AppTopBar />
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
```

```typescript
// app/(map)/layout.tsx - Minimal layout for map pages (no app sidebar)
"use client";

import { AuthProvider } from "@/context/AuthProvider";

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="h-screen w-screen overflow-hidden bg-neutral-950">
        {children}
      </div>
    </AuthProvider>
  );
}
```

### Server Components

```typescript
// app/(map)/[country]/page.tsx - Map page (now in (map) route group)
export default async function CountryMapPage({ params }: PageProps) {
  const { country } = await params;
  const supabase = await createClient(); // Server client
  const { data: locations } = await getLocationsByCountry(countryCode, true);
  return <CountryMapView locations={locations} />;
}
```

### Client Components

```typescript
"use client";
import { useState } from "react";

export function NetworkToggle() {
  const [activeNetworks, setActiveNetworks] = useState<Set<NetworkName>>(
    new Set()
  );
  // Client-side interactivity
}
```

### Dynamic Imports

```typescript
const MapContainer = dynamic(
  () => import("@/components/map/MapContainer").then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
```

### Supabase Queries

```typescript
// Server-side
const { data, error } = await getLocationsByCountry("poland", true);

// Client-side
const { data, error } = await getLocationsByCountry("poland", false);
```

### Pagination for Large Datasets

```typescript
// Always use pagination for queries that might return 1,000+ rows
const PAGE_SIZE = 1000;
let allData: Location[] = [];
let page = 0;
let hasMore = true;

while (hasMore) {
  const { data } = await supabase
    .from("locations")
    .select("*")
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (data && data.length > 0) {
    allData = [...allData, ...data];
    hasMore = data.length === PAGE_SIZE;
    page++;
  } else {
    hasMore = false;
  }
}
```

### Data Import Pattern

```typescript
// Import with transformation
const transformedData = rawData.map((item) => ({
  id: `${network}-${item.id}`, // Composite ID
  network_name: NETWORK_MAP[network],
  country: COUNTRY_MAP[item.country] || "poland",
  phone: item.phone?.replace(/[\s\-()]/g, ""), // Clean phone
  // ... other fields
}));

// Batch insert
const BATCH_SIZE = 1000;
for (let i = 0; i < transformedData.length; i += BATCH_SIZE) {
  const batch = transformedData.slice(i, i + BATCH_SIZE);
  await supabase.from("locations").insert(batch);
}
```

### Mapbox GeoJSON Layer Pattern

```typescript
// Use for Individual Mode to render 100k+ points
useEffect(() => {
  const map = mapRef.current?.getMap();
  if (!map) return;

  if (viewMode === "individual") {
    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: locations.map((loc) => ({
        type: "Feature",
        properties: { id: loc.id, color: loc.color },
        geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
      })),
    };

    map.addSource("my-source", { type: "geojson", data: geojson });
    map.addLayer({
      id: "my-layer",
      type: "circle",
      source: "my-source",
      paint: {
        "circle-radius": 4,
        "circle-color": ["get", "color"],
      },
    });
  }

  // Cleanup
  return () => {
    if (map.getLayer("my-layer")) map.removeLayer("my-layer");
    if (map.getSource("my-source")) map.removeSource("my-source");
  };
}, [viewMode, locations]);
```

### Smart Viewport Loading Pattern

```typescript
// CountryMapView.tsx - Debounced viewport fetching
const handleViewportChange = useCallback(
  (bounds: ViewportBounds) => {
    setCurrentZoom(bounds.zoom);

    // Only fetch viewport if zoomed in enough
    if (bounds.zoom < VIEWPORT_MODE_ZOOM_THRESHOLD) {
      setViewportLocations([]);
      return;
    }

    // Clear existing timeout
    if (viewportFetchTimeout.current) {
      clearTimeout(viewportFetchTimeout.current);
    }

    // Debounce viewport fetch (500ms after last move)
    viewportFetchTimeout.current = setTimeout(async () => {
      setIsViewportLoading(true);

      try {
        const boundingBox: BoundingBox = {
          west: bounds.west,
          south: bounds.south,
          east: bounds.east,
          north: bounds.north,
        };

        const result = await getLocationsInViewport(country.code, boundingBox);

        if (result.error) {
          console.error("Viewport fetch error:", result.error);
        } else if (result.data) {
          setViewportLocations(result.data);
        }
      } catch (error) {
        console.error("Viewport fetch failed:", error);
      } finally {
        setIsViewportLoading(false);
      }
    }, 500);
  },
  [country.code, VIEWPORT_MODE_ZOOM_THRESHOLD]
);

// Use viewport data if zoomed in, otherwise full dataset
const locationsToFilter = useViewportMode && viewportLocations.length > 0
  ? viewportLocations
  : locations;
```

### Case-Insensitive Normalization Pattern

```typescript
import { normalizeCityName, normalizeCountyName } from "@/lib/utils/normalize";

// Aggregating statistics with case-insensitive city names
const cityCounts = new Map<string, number>();
allLocations.forEach((loc) => {
  const normalizedCity = normalizeCityName(loc.city); // "LONDON" → "London"
  cityCounts.set(normalizedCity, (cityCounts.get(normalizedCity) || 0) + 1);
});

// Filtering locations
const filteredByCity = locations.filter((loc) => {
  if (!selectedCity) return true;
  return normalizeCityName(loc.city) === normalizeCityName(selectedCity);
});

// Building filter options (deduplicated)
const cityOptions = Array.from(
  new Set(
    locations.map((loc) => normalizeCityName(loc.city))
  )
).sort();
```

### Network Selection UI Pattern

```typescript
// NetworkSelectionCard.tsx - Orchestrator component
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NetworkName, CountryCode } from "@/types";

const MAX_NETWORKS = 5;

export function NetworkSelectionCard({ industries, countryCode }) {
  const router = useRouter();
  const [selectedNetworks, setSelectedNetworks] = useState<Set<NetworkName>>(new Set());

  const maxReached = selectedNetworks.size >= MAX_NETWORKS;

  // Add network (if under max)
  const handleSelectNetwork = (network: NetworkName) => {
    if (selectedNetworks.size < MAX_NETWORKS && !selectedNetworks.has(network)) {
      setSelectedNetworks(prev => new Set([...prev, network]));
    }
  };

  // Remove network
  const handleRemoveNetwork = (network: NetworkName) => {
    setSelectedNetworks(prev => {
      const newSet = new Set(prev);
      newSet.delete(network);
      return newSet;
    });
  };

  // Navigate to map with selected networks
  const handleShowOnMap = () => {
    const networksParam = Array.from(selectedNetworks).join(',');
    router.push(`/${countryCode}?networks=${encodeURIComponent(networksParam)}`);
  };

  return (
    <div className="space-y-6">
      {/* Available Networks */}
      <NetworkTagGrid
        industries={industries}
        selectedNetworks={selectedNetworks}
        onSelectNetwork={handleSelectNetwork}
        maxReached={maxReached}
      />

      {/* Selected Networks Zone */}
      <SelectedNetworksZone
        selectedNetworks={selectedNetworks}
        onRemoveNetwork={handleRemoveNetwork}
        maxNetworks={MAX_NETWORKS}
      />

      {/* Show on Map Button */}
      <ShowOnMapButton
        selectedNetworks={selectedNetworks}
        countryCode={countryCode}
        maxNetworks={MAX_NETWORKS}
      />
    </div>
  );
}
```

```typescript
// CountryMapView.tsx - Parse networks URL parameter
const searchParams = useSearchParams();
const networksParam = searchParams.get("networks");

useEffect(() => {
  // Priority 1: Handle comma-separated networks list from dashboard
  if (networksParam) {
    const networkList = networksParam
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (networkList.length > 0) {
      setActiveNetworks(new Set(networkList as NetworkName[]));
      return; // Stop processing other params
    }
  }

  // Priority 2 & 3: Handle legacy industry/network params...
}, []);
```

### Industry Breakdown Query Pattern

```typescript
// lib/supabase/queries.ts - Get industry breakdown with pagination
async function getCountryIndustryBreakdownHelper(
  countryCode: CountryCode
): Promise<IndustryBreakdown[]> {
  const supabase = createCacheClient();

  // Pagination to handle 8000+ rows
  const PAGE_SIZE = 1000;
  let allData: any[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("locations")
      .select("industry_category, network_name")
      .eq("country", countryCode)
      .eq("is_active", true)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      hasMore = data.length === PAGE_SIZE; // Continue if full page
      page++;
    } else {
      hasMore = false;
    }
  }

  // Group by industry → network → count
  const industryMap = new Map<string, Map<string, number>>();

  allData.forEach((row) => {
    const industry = row.industry_category || "money_transfer";
    const network = row.network_name;

    if (!industryMap.has(industry)) {
      industryMap.set(industry, new Map());
    }

    const networkMap = industryMap.get(industry)!;
    networkMap.set(network, (networkMap.get(network) || 0) + 1);
  });

  // Transform to IndustryBreakdown[]
  const industries: IndustryBreakdown[] = [];

  industryMap.forEach((networkMap, industryCategory) => {
    const networks: NetworkInIndustry[] = [];
    let totalCount = 0;

    networkMap.forEach((count, networkName) => {
      networks.push({ name: networkName, count });
      totalCount += count;
    });

    networks.sort((a, b) => b.count - a.count); // Sort by count desc

    industries.push({
      category: industryCategory as IndustryCategory,
      label: getIndustryLabel(industryCategory as IndustryCategory),
      icon: getIndustryIcon(industryCategory as IndustryCategory),
      count: totalCount,
      networks,
    });
  });

  industries.sort((a, b) => b.count - a.count); // Sort industries by count desc

  return industries;
}

export async function getCountryIndustryBreakdown(
  countryCode: CountryCode
): Promise<SupabaseResponse<IndustryBreakdown[]>> {
  try {
    const industries = await getCountryIndustryBreakdownHelper(countryCode);
    return { data: industries, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
```

```typescript
// app/(dashboard)/dashboard/page.tsx - Server Component using DAL
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch industry breakdown for all countries in parallel
  const countryStats: CountryDashboardStats[] = await Promise.all(
    COUNTRY_LIST.map(async (country) => {
      const { data: industries } = await getCountryIndustryBreakdown(country.code);

      const totalLocations = industries?.reduce((sum, ind) => sum + ind.count, 0) || 0;

      return {
        country,
        totalLocations,
        industries: industries || [],
        lastUpdated: new Date().toISOString(),
      };
    })
  );

  countryStats.sort((a, b) => b.totalLocations - a.totalLocations);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {countryStats.map((stats) => (
        <div key={stats.country.code} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
          {/* Country header */}
          <div className="mb-6">
            <h2>{stats.country.flag} {stats.country.name}</h2>
            <p>{stats.totalLocations.toLocaleString()} locations</p>
          </div>

          {/* Network selection UI */}
          <NetworkSelectionCard
            industries={stats.industries}
            countryCode={stats.country.code}
          />
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Maps Not Loading

- Check `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`
- Ensure token starts with `pk.` (not `Ypk.`)
- Verify token is active at https://account.mapbox.com/access-tokens/
- Clear browser cache and hard refresh (Cmd+Shift+R)

### Build Errors

- Turbopack may have issues with `react-map-gl` in production builds
- Use dev mode for development
- For production, consider webpack fallback

### Authentication Issues

- Verify Supabase URL and anon key
- Check RLS policies in Supabase dashboard
- Ensure cookies are enabled in browser
- Try logging out and back in
- Check Supabase Auth logs in dashboard

### No Locations Showing / Only 1,000 Locations

**Problem**: Map shows no locations or only 1,000 of 8,824+ imported locations

**Solutions**:

1. **Check Database**: Verify data exists in Supabase table editor
2. **Check Pagination**: Ensure `getLocationsByCountry()` uses pagination (see `Pagination Strategy` section)
3. **Clear Cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```
4. **Hard Refresh Browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
5. **Check RLS Policies**: Verify authenticated users can read locations
6. **Check Console**: Look for JavaScript errors in browser DevTools

### Data Import Issues

**Import Fails with "Unauthorized"**:

- Ensure you're logged in before accessing `/import` page
- Check authentication status in user menu

**Import Completes but Locations Don't Show**:

1. Clear Next.js cache: `rm -rf .next`
2. Restart dev server
3. Hard refresh browser
4. Check Supabase table for inserted data
5. Verify country codes match (`PL` → `poland`, not `pl`)

**Wrong Country on Map**:

- Use country override dropdown in import UI
- Forces all locations to specific country regardless of JSON data
- Useful when source data has incorrect country codes

**Duplicate ID Errors**:

- Each import prefixes IDs with network name (`ria-{id}`)
- If importing same data twice, IDs will conflict
- Use "Replace existing data" checkbox to clear before import
- Or manually delete duplicate rows in Supabase

**JSON Format Errors**:

- Ensure file contains array of objects: `[{...}, {...}]`
- Required fields: `id`, `street`, `zip`, `city`, `country`, `lat`, `lng`
- Check for syntax errors with JSON validator

### Individual View Mode Performance

**Dots Not Rendering**:

- Check browser console for Mapbox errors
- Verify `viewMode` prop passed to MapContainer
- Ensure map style is loaded before adding layers

**Clicks Not Working in Individual Mode**:

- Verify Mapbox layer event handlers are attached
- Check that `filteredLocations` contains location data
- Look for console errors during layer setup

**Switching Modes Causes Errors**:

- Ensure cleanup code runs when switching to clustered mode
- Check that layers/sources are removed properly
- Clear browser cache if issues persist

### Database Schema Errors

**Trigger Already Exists**:

```
ERROR: 42710: trigger 'update_locations_updated_at' already exists
```

**Solution**: Schema now uses `DROP TRIGGER IF EXISTS` - re-run entire `lib/supabase/schema.sql`

**Policy Already Exists**:

```
ERROR: 42710: policy 'Allow authenticated users to read locations' already exists
```

**Solution**: Schema now uses `DROP POLICY IF EXISTS` - re-run entire `lib/supabase/schema.sql`

**Column Not Found** (phone or subnetwork_name):

```
ERROR: Could not find the 'phone' column in the schema cache
```

**Solution**: Run updated schema.sql to add new columns with `ALTER TABLE` or recreate table

### Viewport Loading Issues

**Viewport Not Loading When Zoomed In**:

1. **Check zoom threshold**: Ensure zoom level >= 8
2. **Check PostGIS function**: Verify `get_locations_in_viewport` exists in Supabase
3. **Check console**: Look for viewport fetch errors
4. **Check RPC permissions**: Ensure authenticated users can execute RPC functions

**Slow Viewport Loading**:

1. **Check spatial indexes**: Ensure PostGIS spatial indexes exist on locations table
2. **Reduce debounce delay**: Adjust 500ms timeout if needed
3. **Check network**: Verify Supabase connection is fast
4. **Optimize bounds**: Ensure bounding box isn't too large

**Viewport Loading Indicator Stuck**:

- Check that `setIsViewportLoading(false)` runs in finally block
- Verify viewport fetch completes without hanging
- Clear browser cache and restart dev server

**Case-Insensitive Filtering Not Working**:

- Ensure `normalizeCityName()` is applied to both filter value and location value
- Check that filter options are built with normalized names
- Verify normalization function handles edge cases (empty strings, special characters)

### Industry & Tags Issues

**Wrong Industry Category After Import**:

1. **Check auto-detection logic**: Verify network name matches detection patterns in `/api/seed/import`
2. **Override detection**: Pass explicit `industry_category` in import JSON:
   ```json
   {
     "id": "123",
     "network_name": "Custom Network",
     "industry_category": "retail",
     "tags": ["retail", "shopping"],
     // ... other fields
   }
   ```
3. **Manual fix**: Update database directly:
   ```sql
   UPDATE locations
   SET industry_category = 'pawn_shop', tags = ARRAY['pawn_shop', 'loans']
   WHERE network_name = 'Loombard';
   ```
4. **Run migrations**: Ensure migrations 004 and 005 have been applied

**Tags Not Indexed / Slow Array Queries**:

- Verify GIN index exists: `\d locations` in Supabase SQL Editor
- Check for: `idx_locations_tags GIN(tags)`
- If missing, run migration 004 again
- Use correct array query syntax: `tags @> ARRAY['atm']` (not `'atm' = ANY(tags)`)

**Industry Breakdown Shows 0 Locations**:

1. **Check pagination**: Ensure `getCountryIndustryBreakdown()` uses pagination loop
2. **Verify data exists**: Check Supabase table for locations with that country
3. **Check defaults**: Old data without `industry_category` should default to `'money_transfer'`
4. **Clear cache**: `rm -rf .next && npm run dev`

**Network Selection UI Not Showing Industries**:

- Verify `industries` prop passed to `NetworkSelectionCard`
- Check that `industries.length > 0` (otherwise shows "No location data" message)
- Ensure `INDUSTRY_CONFIG` imported in `NetworkTagGrid`
- Check console for errors in industry icon/label lookup

**Max 5 Networks Not Enforcing**:

- Check `MAX_NETWORKS` constant is 5 in `NetworkSelectionCard`
- Verify `maxReached` calculation: `selectedNetworks.size >= MAX_NETWORKS`
- Ensure `disabled` prop passed to `NetworkTag` correctly
- Check that tags have `opacity-50 cursor-not-allowed` when disabled

### Sidebar/Layout Issues

**Two Sidebars Appearing / Overlapping Navbars**:

- **Cause**: Map routes were in `(dashboard)` route group which has AppSidebar, but `CountryMapView` also has its own SidebarProvider
- **Solution**: Map routes moved to separate `(map)` route group with minimal layout
- If you see nested sidebars:
  1. Check that `[country]` routes are in `app/(map)/`, NOT `app/(dashboard)/`
  2. Verify `(map)/layout.tsx` doesn't include `SidebarProvider` or `AppSidebar`
  3. Only `CountryMapView` should have sidebar in map pages

**AuthProvider Not Available in Component**:

- **Cause**: AuthProvider was removed from root layout to fix static page build issues
- **Solution**: AuthProvider is now in route-specific layouts:
  - `(dashboard)/layout.tsx` - has AuthProvider
  - `(map)/layout.tsx` - has AuthProvider
  - `(marketing)/layout.tsx` - NO AuthProvider (public pages)
- If `useAuth()` returns undefined, check you're in a route with AuthProvider

## Best Practices

### Component Organization

- Keep server components in `app/` directory
- Keep client components in `components/` directory
- Use `"use client"` only when necessary

### Performance

- Use dynamic imports for heavy components (e.g., `MapContainer`)
- **Clustered Mode**: Use for standard navigation (handles 10k+ points)
- **Individual Mode**: Use Mapbox native layers for 100k+ points (GPU-accelerated)
- **Smart Viewport Loading**: Enable for zoom >= 8 to reduce data transfer by 50-100x
- **Debouncing**: Use 500ms debounce for viewport fetches to prevent excessive requests
- Implement pagination for Supabase queries exceeding 1,000 rows
- Memoize expensive calculations with `useMemo` (e.g., `supercluster`, `clusters`)
- Use React Server Components for data fetching (avoid "use cache" in DAL files)
- **PostGIS Optimization**: Leverage spatial indexes for fast viewport queries (<50ms)
- **Case-Insensitive Normalization**: Apply normalization early to reduce duplicate processing
- Clear `.next` cache after database changes
- Batch import operations (1,000 rows at a time)

### Security

- Never expose service role keys
- Use RLS policies for data access control
- Validate user input on both client and server
- Use prepared statements for database queries

### Styling

- Use Tailwind utility classes
- Maintain consistent spacing (multiples of 4: p-4, gap-4, space-y-4)
- Use design tokens from `globals.css`
- Keep color scheme consistent (neutral-950/violet-500)

### Route Group Architecture

- **Dashboard routes** (`(dashboard)/`): Use app shell with sidebar + topbar
- **Map routes** (`(map)/`): Use minimal layout - map has its own sidebar
- **Marketing routes** (`(marketing)/`): Use marketing navbar, no sidebar
- **Auth routes** (`(auth)/`): Use marketing navbar with centered content
- **Never nest SidebarProviders** - each route group should have at most one
- **AuthProvider placement**: Only in `(dashboard)` and `(map)` layouts, NOT root

## Additional Documentation

- `MAP_SYSTEM_README.md` - Detailed map system architecture and implementation
- `VIEWPORT_LOADING_IMPLEMENTATION.md` - Smart Viewport Loading implementation plan and status
- `NETWORK_SELECTION_UI.md` - **Network Selection UI implementation guide** (click-to-select flow, component hierarchy, testing checklist)
- `lib/supabase/schema.sql` - Complete database schema with PostGIS functions
- `lib/supabase/migrations/004_add_industry_and_tags.sql` - Industry categorization migration
- `lib/supabase/migrations/005_recategorize_loombard.sql` - Loombard recategorization fix
- `lib/utils/normalize.ts` - Normalization utilities for case-insensitive operations
- `lib/data/industries.ts` - Industry category configuration with icons and labels
