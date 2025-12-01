# Smart Viewport Loading Implementation

**Date**: November 2025
**Status**: 🚧 In Progress
**Goal**: Reduce initial load from 2-3MB to 10-50KB by loading only visible locations

---

## 📊 Performance Impact

### Current State
- **Initial Load**: 8,824 locations (2-3MB JSON)
- **Load Time**: 2-3 seconds on 3G
- **Memory**: ~15-20MB in browser
- **Scale Limit**: ~10,000 locations before severe lag

### After Viewport Loading
- **Initial Load**: 0-200 locations (10-50KB JSON)
- **Load Time**: <500ms on 3G
- **Memory**: ~2-3MB in browser
- **Scale Limit**: Unlimited (viewport always shows manageable subset)

**Result**: 50-100x reduction in data transfer, instant page loads

---

## 🎯 Implementation Strategy

### Hybrid Approach

We'll use a **zoom-based strategy** to balance performance and UX:

#### Zoom Level < 8 (Country View)
- **Behavior**: Load full country dataset
- **Reason**: Clustered view needs all points for accurate clustering
- **Data**: ~8,824 locations
- **Use Case**: Overview, initial landing

#### Zoom Level >= 8 (City/Neighborhood View)
- **Behavior**: Load only viewport locations
- **Reason**: Individual mode, fewer points visible
- **Data**: ~50-500 locations per viewport
- **Use Case**: Detailed exploration, finding specific locations

### State Management

```typescript
interface ViewportLoadingState {
  mode: 'full' | 'viewport';
  loadedBounds: BoundingBox | null;
  locations: Location[];
  isLoading: boolean;
  lastFetchTime: number;
}
```

### Caching Strategy

1. **Initial Load**: Full country (for clustered mode)
2. **On Zoom In** (zoom >= 8): Switch to viewport mode
3. **On Pan/Zoom**: Fetch new viewport if bounds changed significantly
4. **Debouncing**: Wait 500ms after last move before fetching
5. **Deduplication**: Don't refetch if viewport hasn't moved enough

---

## 🏗️ Architecture

### Components

#### 1. MapContainer (Enhanced)
- Listen to `moveend` event
- Calculate current viewport bounds
- Trigger viewport fetch if needed
- Show loading overlay during fetch

#### 2. CountryMapView (Enhanced)
- Manage viewport loading state
- Provide viewport fetch function
- Pass loading state to MapContainer

#### 3. New DAL Function
```typescript
// Already exists in lib/supabase/queries.ts
export async function getLocationsInViewport(
  countryCode: CountryCode,
  west: number,
  south: number,
  east: number,
  north: number
): Promise<SupabaseResponse<Location[]>>
```

### Data Flow

```
User lands on country page
    ↓
Load full country dataset (8,824 locations)
    ↓
Display clustered view
    ↓
User zooms in (zoom >= 8)
    ↓
Switch to viewport mode
    ↓
User pans/zooms
    ↓
Debounce 500ms
    ↓
Fetch viewport locations (50-500)
    ↓
Update map with new locations
    ↓
Show loading indicator if slow
```

---

## 📝 Implementation Checklist

### Phase 1: DAL Layer
- [x] PostGIS function exists: `get_locations_in_viewport`
- [ ] Create TypeScript DAL function: `getLocationsInViewport()`
- [ ] Add proper error handling
- [ ] Add caching with `"use cache"`

### Phase 2: MapContainer Updates
- [ ] Add `onViewportChange` callback prop
- [ ] Listen to `moveend` event
- [ ] Calculate and emit viewport bounds
- [ ] Show loading overlay during fetch
- [ ] Handle viewport mode toggle

### Phase 3: CountryMapView Updates
- [ ] Add viewport loading state
- [ ] Create debounced viewport fetch function
- [ ] Implement zoom threshold logic (zoom < 8 vs >= 8)
- [ ] Merge viewport locations with existing
- [ ] Pass viewport handler to MapContainer

### Phase 4: UI/UX Enhancements
- [ ] Loading indicator in corner during fetch
- [ ] Toast notification if fetch fails
- [ ] Smooth transition between modes
- [ ] Settings to disable viewport loading (optional)

### Phase 5: Testing
- [ ] Test with slow 3G network
- [ ] Test rapid panning/zooming
- [ ] Test zoom in/out transitions
- [ ] Verify no duplicate locations
- [ ] Check memory usage

---

## 🔧 Technical Details

### Zoom Threshold Logic

```typescript
const VIEWPORT_MODE_ZOOM_THRESHOLD = 8;

function shouldUseViewportMode(zoom: number): boolean {
  return zoom >= VIEWPORT_MODE_ZOOM_THRESHOLD;
}
```

### Bounds Comparison (Avoid Unnecessary Fetches)

```typescript
function boundsChangedSignificantly(
  oldBounds: BoundingBox,
  newBounds: BoundingBox
): boolean {
  const latDiff = Math.abs(oldBounds.north - newBounds.north);
  const lngDiff = Math.abs(oldBounds.east - newBounds.east);

  // Only refetch if viewport moved >20% of its size
  const latThreshold = (oldBounds.north - oldBounds.south) * 0.2;
  const lngThreshold = (oldBounds.east - oldBounds.west) * 0.2;

  return latDiff > latThreshold || lngDiff > lngThreshold;
}
```

### Debouncing

```typescript
import { useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';

const debouncedFetchViewport = useMemo(
  () => debounce(
    (bounds: BoundingBox) => fetchViewportLocations(bounds),
    500 // Wait 500ms after last move
  ),
  []
);
```

---

## 🎨 User Experience

### Loading States

1. **Initial Page Load**: Show full loading spinner (current behavior)
2. **Viewport Fetch**: Small loading badge in top-right corner
3. **Error State**: Toast notification with retry button
4. **Empty Viewport**: Show "No locations in this area" message

### Transition Between Modes

- **Zoom Out** (viewport → full): Smooth, no fetch needed (already have full dataset)
- **Zoom In** (full → viewport): Fetch viewport, merge with existing for smooth transition

---

## 🚀 Rollout Plan

### Stage 1: Add Infrastructure (Non-Breaking)
- Add DAL function
- Add state management
- Keep existing behavior as default

### Stage 2: Enable for Testing
- Add feature flag
- Test internally with `?viewportMode=true`
- Gather performance metrics

### Stage 3: Gradual Rollout
- Enable for 10% of users
- Monitor error rates
- Adjust debounce timing if needed

### Stage 4: Full Rollout
- Enable for all users
- Remove feature flag
- Celebrate 50x performance improvement 🎉

---

## 📊 Success Metrics

- ✅ Initial page load < 500ms (down from 2-3s)
- ✅ Viewport fetch < 200ms
- ✅ Memory usage < 5MB (down from 15-20MB)
- ✅ Works smoothly on 3G network
- ✅ No user-visible bugs or glitches

---

## 🔗 Related Files

- `lib/supabase/queries.ts` - DAL functions
- `components/map/MapContainer.tsx` - Map viewport tracking
- `components/dashboard/CountryMapView.tsx` - State management
- `lib/supabase/migrations/002_postgis_functions.sql` - PostGIS functions

---

**Status**: 🚧 Ready to implement
**Estimated Time**: 4-6 hours
**Impact**: 🔥🔥🔥🔥🔥 Massive performance improvement
