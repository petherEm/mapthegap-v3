# Phase 2 & 3 Implementation Plan

## Overview

This document outlines the implementation of **Phase 2: Smart Search Enhancement** and **Phase 3: Dashboard Enhancements** for MapTheGap.

**Timeline**: 1-2 weeks
**Status**: 🚧 In Progress
**Date**: November 2025

---

## 🎯 Phase 2: Smart Search Enhancement

### Goal
Integrate natural language query capabilities into the main dashboard, making analytics accessible without navigating to a separate page.

### Features

#### 1. **Intelligent Search Bar**
- **Location**: Main dashboard (top of CountryMapView)
- **Functionality**:
  - Auto-detect NLP queries vs simple keyword search
  - Show visual indicator (💬 icon) when NLP is detected
  - Inline loading states and error handling

**Detection Logic**:
```typescript
function isNaturalLanguageQuery(query: string): boolean {
  const nlpPatterns = [
    /show me/i,
    /find all/i,
    /what is/i,
    /how many/i,
    /compare/i,
    /which/i,
    /where are/i,
    /nearest/i,
    /coverage/i,
  ];
  return nlpPatterns.some(pattern => pattern.test(query));
}
```

#### 2. **Unified Search API**
- **Endpoint**: `/api/search` (POST)
- **Handles**:
  - Simple keyword search (existing functionality)
  - NLP queries (Claude + PostGIS)
- **Response**:
```typescript
interface SearchResponse {
  type: 'simple' | 'nlp';
  locations?: Location[];
  answer?: string; // For NLP queries
  visualization?: 'map' | 'chart' | 'table';
  metadata: {
    totalResults: number;
    executionTime: number;
  };
  actions: {
    showOnMap?: boolean;
    exportable?: boolean;
    zoomTo?: { lat: number; lng: number; zoom: number };
  };
}
```

#### 3. **Inline Results Display**
- **Component**: `SearchResults.tsx`
- **Features**:
  - Natural language answer (for NLP queries)
  - Location highlighting on map
  - Quick action buttons:
    - 🗺️ Show on Map (zoom to results)
    - 📊 View Details (expand data table)
    - 💾 Export CSV/JSON
  - Collapsible panel

#### 4. **Map Integration**
- Highlight matching locations with different color (rose-600)
- Auto-zoom to fit highlighted locations
- Show popup on click with match reason
- Clear highlights on new search

### UI Flow

```
User types query in search bar
    ↓
Auto-detect NLP vs simple search
    ↓
If NLP: Show 💬 icon + "Analyzing..."
If Simple: Show 🔍 icon + "Searching..."
    ↓
Call appropriate API endpoint
    ↓
Display results inline below map
    ↓
Highlight locations on map
    ↓
User clicks "Show on Map" → zoom + center
User clicks "Export" → download data
```

---

## 📊 Phase 3: Dashboard Enhancements

### Goal
Add powerful analytics visualizations to provide business intelligence for network expansion decisions.

### Features

#### 1. **Country Statistics Overview**
- **Location**: Dashboard page or new `/dashboard/[country]/stats` page
- **Components**:
  - Key metrics cards
  - Network distribution pie chart
  - Top 10 cities by density
  - Coverage percentage gauge
  - Growth trend line chart (if historical data available)

**API Endpoints**:
```typescript
GET /api/stats/overview?country=gb
GET /api/stats/density-by-city?country=gb
GET /api/stats/network-comparison?country=gb
GET /api/stats/coverage-percentage?country=gb
```

#### 2. **Coverage Gap Heatmap**
- **Component**: `CoverageGapHeatmap.tsx`
- **Visualization**: Mapbox heatmap layer showing underserved areas
- **PostGIS Function**: `get_coverage_grid`
- **Features**:
  - Toggle heatmap on/off
  - Adjustable grid size (0.1° to 1.0°)
  - Color scale: Green (high coverage) → Red (gaps)
  - Click cell to see details

**Implementation**:
```typescript
map.addLayer({
  id: 'coverage-heatmap',
  type: 'heatmap',
  source: 'coverage-grid',
  paint: {
    'heatmap-weight': ['get', 'location_count'],
    'heatmap-intensity': 1,
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(255, 0, 0, 0)',
      0.2, 'rgb(255, 0, 0)',
      0.4, 'rgb(255, 165, 0)',
      0.6, 'rgb(255, 255, 0)',
      0.8, 'rgb(0, 255, 0)',
      1, 'rgb(0, 128, 0)'
    ],
  }
});
```

#### 3. **Density Analysis Charts**
- **Component**: `DensityAnalysisChart.tsx`
- **Chart Type**: Horizontal bar chart (Recharts)
- **Data**: Top 20 cities by locations per square km
- **PostGIS Function**: `get_density_by_city`
- **Features**:
  - Sort by density or location count
  - Filter by network
  - Export chart as PNG

#### 4. **Network Comparison Dashboard**
- **Component**: `NetworkComparisonDashboard.tsx`
- **Layout**: Side-by-side cards for each network
- **Metrics per Network**:
  - Total locations
  - Coverage area (sq km)
  - Market share (%)
  - Average distance between locations
  - Top 5 cities
- **PostGIS Function**: `compare_network_coverage`
- **Visualizations**:
  - Bar chart: Location count comparison
  - Pie chart: Market share
  - Map: Network coverage overlays

#### 5. **Export Reports**
- **Format**: CSV, JSON, PDF (optional)
- **Content**:
  - Executive summary
  - All statistics and charts
  - Location lists
  - Coverage analysis
- **Implementation**: Use `jsPDF` for PDF generation

### New Components to Create

```
components/
  dashboard/
    CountryStats.tsx              # Overview statistics cards
    CoverageGapHeatmap.tsx         # Heatmap visualization
    DensityAnalysisChart.tsx       # City density bar chart
    NetworkComparisonDashboard.tsx # Side-by-side network metrics
    SearchResults.tsx              # Inline search results panel
    ExportReportButton.tsx         # Export functionality
```

### New API Routes to Create

```
app/api/
  search/
    route.ts                    # Unified search (simple + NLP)
  stats/
    overview/route.ts           # Country overview stats
    density-by-city/route.ts    # Density analysis
    network-comparison/route.ts # Network metrics
    coverage-percentage/route.ts # Coverage stats
```

---

## 🏗️ Implementation Order

### Week 1: Phase 2 (Smart Search Enhancement)

**Day 1-2**: Search Infrastructure
- [ ] Create `/api/search` unified endpoint
- [ ] Add NLP detection logic
- [ ] Update search bar with visual indicators

**Day 3-4**: Results Display
- [ ] Build `SearchResults.tsx` component
- [ ] Implement map highlighting
- [ ] Add quick action buttons

**Day 5**: Integration & Testing
- [ ] Integrate search into CountryMapView
- [ ] Test with various query types
- [ ] Fix any bugs

### Week 2: Phase 3 (Dashboard Enhancements)

**Day 1-2**: Statistics API & Components
- [ ] Create stats API endpoints
- [ ] Build `CountryStats.tsx` overview
- [ ] Build `DensityAnalysisChart.tsx`

**Day 3-4**: Visualizations
- [ ] Build `CoverageGapHeatmap.tsx`
- [ ] Build `NetworkComparisonDashboard.tsx`
- [ ] Integrate with map

**Day 5**: Export & Polish
- [ ] Add export functionality
- [ ] Polish UI/UX
- [ ] Final testing

---

## 🎨 Design Considerations

### Colors
- **Highlighted Locations**: `rose-600` (#e11d48)
- **Coverage Heatmap**: Red → Yellow → Green gradient
- **Charts**: Use network colors from `lib/data/networks.ts`

### Layout
- **Search Results**: Collapsible panel above map (or sidebar)
- **Statistics**: Tabbed interface or separate page
- **Heatmap**: Toggle button in map controls

### Responsive
- Stack charts vertically on mobile
- Collapse statistics into accordion on small screens
- Make search results panel scrollable

---

## 📝 Testing Checklist

### Phase 2 Testing
- [ ] Simple keyword search works (e.g., "London")
- [ ] NLP queries work (e.g., "Show me Ria locations in Edinburgh")
- [ ] Map highlights correct locations
- [ ] "Show on Map" button zooms correctly
- [ ] Export downloads correct data
- [ ] Works on mobile

### Phase 3 Testing
- [ ] All statistics load correctly
- [ ] Heatmap displays coverage gaps
- [ ] Charts render with correct data
- [ ] Network comparison shows accurate metrics
- [ ] Export generates valid files
- [ ] Performance is acceptable with 10k+ locations

---

## 🚀 Future Enhancements (Phase 4+)

- **Voice Search**: Speech-to-text for NLP queries
- **Saved Searches**: Bookmark frequent queries
- **Scheduled Reports**: Email weekly analytics
- **Collaborative Features**: Share searches with team
- **Historical Trends**: Track changes over time
- **Predictive Analytics**: ML-based expansion recommendations

---

## 📚 Dependencies

### New Packages
```bash
npm install jspdf        # PDF export (optional)
npm install recharts     # Already installed
```

### Environment Variables
```env
# Already configured
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🎯 Success Metrics

### Phase 2
- ✅ 80%+ of NLP queries correctly interpreted
- ✅ <3 seconds average response time
- ✅ Map highlights accurately match query intent
- ✅ Export works for all result types

### Phase 3
- ✅ All charts render without errors
- ✅ Heatmap updates within 2 seconds
- ✅ Statistics accuracy verified against database
- ✅ Export reports contain all expected data

---

## 🔗 Related Documents

- [PostGIS Implementation Plan](./POSTGIS_IMPLEMENTATION_PLAN.md)
- [NLP Analytics Plan](./NLP_ANALYTICS_PLAN.md)
- [Claude.md](./CLAUDE.md)

---

**Status**: 🚧 Implementation in progress
**Last Updated**: November 2025
