# Network Selection UI - Implementation Guide

## Overview

Replaced accordion-based navigation with a **click-to-select** network selection system. Users now:
1. Browse available networks grouped by industry
2. Click to select networks (max 5)
3. Click "Show on Map" to navigate with selected filters

This provides better control and visibility before navigating to the map.

---

## ✅ What Was Implemented

### **Phase 1: Click-to-Select (COMPLETED)**

All core functionality implemented and working:
- ✅ Network tag selection system
- ✅ Selected networks zone with chips
- ✅ Max 5 network validation
- ✅ Show on map button with count
- ✅ URL parameter support (`?networks=Ria,Loombard`)
- ✅ Grid layout for countries

### **Phase 2: Drag-and-Drop (NOT IMPLEMENTED)**

Deferred for future enhancement. Current click-to-select is sufficient.

---

## Component Architecture

### **New Components Created**

```
components/dashboard/
├── NetworkTag.tsx                 # Individual network tag (available area)
├── SelectedNetworkChip.tsx        # Selected network chip with remove button
├── NetworkTagGrid.tsx             # Groups tags by industry
├── SelectedNetworksZone.tsx       # Shows selected chips + count
├── ShowOnMapButton.tsx            # Navigate to map button
└── NetworkSelectionCard.tsx       # Orchestrates all components
```

### **Component Hierarchy**

```
NetworkSelectionCard (state: selectedNetworks)
├── NetworkTagGrid
│   └── NetworkTag × N (clickable, shows count)
├── SelectedNetworksZone
│   └── SelectedNetworkChip × N (removable)
└── ShowOnMapButton (navigates when clicked)
```

---

## User Flow

### **Step 1: Dashboard Landing**

```
┌─────────────────────────────────────────────────┐
│ 🇵🇱 Poland - 8,757 locations                    │
│                                                  │
│ Available Networks (click to select, max 5):    │
│                                                  │
│ 💰 Money Transfer:                              │
│ [Ria (4,234)] [Western Union (2,123)]          │
│ [MoneyGram (1,877)]                             │
│                                                  │
│ 💎 Pawn Shops:                                  │
│ [Loombard (523)]                                │
└─────────────────────────────────────────────────┘
```

### **Step 2: Select Networks**

User clicks "Ria" and "Loombard":

```
┌─────────────────────────────────────────────────┐
│ Available Networks:                             │
│ 💰 Money Transfer:                              │
│ [Ria ✓] [Western Union] [MoneyGram]           │
│                                                  │
│ 💎 Pawn Shops:                                  │
│ [Loombard ✓]                                    │
│─────────────────────────────────────────────────│
│ Selected Networks (2/5):                        │
│ [✓ Ria ×] [✓ Loombard ×]                       │
│                                                  │
│ [Show 2 networks on map →]                      │
└─────────────────────────────────────────────────┘
```

### **Step 3: Navigate to Map**

Clicks "Show on Map" → navigates to:

```
/poland?networks=Ria,Loombard

Map automatically filters to show:
- Ria locations (4,234)
- Loombard locations (523)
- Total: 4,757 locations visible
```

---

## State Management

### **NetworkSelectionCard State**

```typescript
const [selectedNetworks, setSelectedNetworks] = useState<Set<NetworkName>>(
  new Set()
);

const MAX_NETWORKS = 5;
const maxReached = selectedNetworks.size >= MAX_NETWORKS;
```

### **Selection Logic**

```typescript
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

// Navigate with selected networks
const handleShowOnMap = () => {
  const networksParam = Array.from(selectedNetworks).join(',');
  router.push(`/${countryCode}?networks=${encodeURIComponent(networksParam)}`);
};
```

---

## Visual States

### **NetworkTag (Available Area)**

| State | Border | Background | Text | Cursor |
|-------|--------|------------|------|--------|
| Available | neutral-700 | transparent | neutral-300 | pointer |
| Selected | rose-500 | rose-500/10 | rose-50 | default |
| Disabled (max reached) | neutral-800 | neutral-900 | neutral-600 | not-allowed |
| Hover (available) | rose-500 | neutral-800 | neutral-300 | pointer |

### **SelectedNetworkChip**

```css
Border: rose-500
Background: rose-500/10
Text: rose-50
Icon: ✓ (checkmark)
Remove button: × with hover:bg-rose-600
```

### **ShowOnMapButton**

| State | Background | Text | Cursor |
|-------|------------|------|--------|
| Disabled (0 selected) | neutral-700 | neutral-500 | not-allowed |
| Enabled (1-5 selected) | rose-500 | white | pointer |
| Hover (enabled) | rose-600 | white | pointer |

**Button Text:**
- 0 selected: "Select networks to view on map"
- 1 selected: "Show 1 network on map"
- 2-5 selected: "Show N networks on map"

---

## URL Parameter Format

### **New Format (Dashboard)**

```
?networks=Ria,Western Union,Loombard
```

Comma-separated list of network names (max 5).

### **Legacy Formats (Still Supported)**

```
?industry=money_transfer              # Filter by industry
?network=Ria                          # Single network
?industry=pawn_shop&network=Loombard  # Industry + network
```

### **Priority Order in CountryMapView**

1. **Priority 1**: `networks` parameter (comma-separated)
2. **Priority 2**: `industry` parameter
3. **Priority 3**: `network` parameter (legacy)

### **Implementation**

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

---

## Validation Rules

### **Selection Limits**

- **Minimum**: 0 networks (button disabled)
- **Maximum**: 5 networks (tags become disabled)
- **Show on Map**: Enabled only when 1-5 networks selected

### **Network Tag States**

```typescript
const isSelected = selectedNetworks.has(network);
const isDisabled = maxReached && !isSelected;

// Behavior:
// - Selected tags: Always clickable (to deselect)
// - Available tags: Clickable if under max
// - Available tags: Disabled if max reached
```

---

## Grid Layout (Dashboard)

### **Responsive Grid**

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {/* Country cards */}
</div>
```

### **Breakpoints**

- **Mobile (< 1024px)**: 1 column (stacked)
- **Large (≥ 1024px)**: 2 columns
- **XL (≥ 1280px)**: 3 columns

### **Visual Layout**

```
Mobile:              Large (lg):          XL (xl):
┌─────┐              ┌────┬────┐          ┌───┬───┬───┐
│ PL  │              │ PL │ FR │          │PL │FR │HN │
├─────┤              ├────┼────┤          ├───┼───┼───┤
│ FR  │              │ HN │ US │          │US │LT │LV │
├─────┤              └────┴────┘          └───┴───┴───┘
│ HN  │
└─────┘
```

---

## Performance

### **State Updates**

- **Selection**: O(1) Set operations
- **Rendering**: Only affected components re-render
- **Navigation**: Client-side router push

### **URL Encoding**

```typescript
// Encode network names properly
const networksParam = Array.from(selectedNetworks).join(',');
router.push(`/${countryCode}?networks=${encodeURIComponent(networksParam)}`);

// Example output:
// /poland?networks=Ria%2CWestern%20Union
```

### **Memory**

- Set<NetworkName>: ~100 bytes (max 5 networks)
- Re-renders: Isolated to NetworkSelectionCard subtree
- No global state needed

---

## Edge Cases Handled

### **Empty Country**

```tsx
if (industries.length === 0) {
  return (
    <div className="text-center py-12">
      <p>No location data available for this country yet.</p>
      <button onClick={() => router.push('/import')}>
        Import Locations →
      </button>
    </div>
  );
}
```

### **Max Networks Reached**

```tsx
// Disable unselected tags
const isDisabled = maxReached && !isSelected;

// Visual feedback
className={disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
```

### **URL with Invalid Networks**

```typescript
// Filter out invalid network names
const networkList = networksParam
  .split(',')
  .map(n => n.trim())
  .filter(n => n.length > 0);  // Remove empty strings

// Only apply if valid networks exist
if (networkList.length > 0) {
  setActiveNetworks(new Set(networkList));
}
```

### **Selection Persistence**

**Current behavior**: Selection resets on navigation (not persisted)

**Rationale**:
- Cleaner UX (fresh start each time)
- Avoids stale selections
- URL is source of truth

**Future enhancement**: Could persist to localStorage if needed

---

## Testing Checklist

### **Network Selection**

- [ ] Click network tag → Appears in selected area
- [ ] Click again → Does not duplicate (already selected)
- [ ] Click × button → Removes from selection
- [ ] Select 5 networks → Other tags become disabled
- [ ] Remove 1 network → Other tags become clickable again
- [ ] Selected tags always show checkmark (✓)

### **Show on Map Button**

- [ ] 0 selected → Button disabled, text: "Select networks to view on map"
- [ ] 1 selected → Button enabled, text: "Show 1 network on map"
- [ ] 2-5 selected → Button enabled, text: "Show N networks on map"
- [ ] Click button → Navigates to `/country?networks=A,B,C`

### **URL Parameters**

- [ ] `/poland?networks=Ria` → Shows only Ria
- [ ] `/poland?networks=Ria,Loombard` → Shows both
- [ ] `/poland?networks=Ria%2CWestern%20Union` → Decodes correctly
- [ ] Invalid network names → Ignored gracefully
- [ ] Empty networks param → Shows all (fallback)

### **Grid Layout**

- [ ] Mobile: 1 column
- [ ] Large screens: 2 columns
- [ ] XL screens: 3 columns
- [ ] Cards have consistent height

### **Visual States**

- [ ] Available tags: Outlined, hover effect
- [ ] Selected tags: Filled rose background, checkmark
- [ ] Disabled tags: Grayed out, no hover, opacity 50%
- [ ] Selected chips: Rose background, × button works

---

## Future Enhancements (Phase 2)

### **Drag-and-Drop**

**Library**: @dnd-kit (recommended)

**Features**:
- Drag network from available area
- Drop into selected zone
- Reorder within selected zone
- Visual feedback during drag

**Implementation**:
```tsx
import { DndContext, DragOverlay } from '@dnd-kit/core';

// Wrap NetworkSelectionCard with DndContext
// Make NetworkTag draggable
// Make SelectedNetworksZone droppable
```

### **Keyboard Navigation**

- Arrow keys to navigate tags
- Enter to select/deselect
- Escape to clear selection
- Tab navigation

### **Advanced Filtering**

- Search within networks
- Filter by industry type
- Sort by location count
- Hide empty industries

### **Selection Presets**

- "All Money Transfer"
- "Top 3 Networks"
- Save custom presets
- Quick select buttons

---

## Migration Notes

### **Breaking Changes**

- ❌ Removed `IndustryAccordion` component (no longer used)
- ✅ All URLs with `?industry=` or `?network=` still work (backward compatible)

### **What to Remove (Optional Cleanup)**

```bash
# These files are no longer used:
rm components/dashboard/IndustryAccordion.tsx
```

### **Database Requirements**

No changes needed. Uses existing:
- `industry_category` field
- `network_name` field
- Industry breakdown query

---

## Summary

✅ **User Experience**: Select networks first, THEN navigate
✅ **Visual Clarity**: See all available networks grouped by industry
✅ **Control**: Max 5 networks, clear selection management
✅ **Performance**: Client-side state, fast interactions
✅ **Flexibility**: Works with any number of industries/networks
✅ **Responsive**: Grid layout adapts to screen size
✅ **Backward Compatible**: Legacy URL params still work

The new selection UI provides better discovery and control compared to the previous accordion approach. Users can now explore networks, make informed selections, and navigate with confidence.
