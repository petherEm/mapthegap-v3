# Natural Language Analytics with Claude LLM

**Date**: November 2025
**Status**: Phase 1 MVP - Ready for Implementation
**Estimated Value**: High differentiation, killer feature potential 🚀

---

## 🎯 Vision

Transform MapTheGap from a **map viewer** into an **intelligent analytics platform** where users can ask questions naturally and get insights powered by Claude LLM + PostGIS.

**Instead of**:
- Click filters → Select network → Choose city → Count results

**Users will**:
- Type: "How many Ria locations are in Wales?"
- Get instant answer with visualization
- Ask follow-up: "Where are the gaps?"

---

## 💡 The Opportunity

### **Why This Makes Perfect Sense**

1. **PostGIS Foundation Already Built** ✅
   - 6 spatial analytics functions ready
   - Viewport queries, distance calculations, coverage analysis
   - All the hard spatial work is done

2. **Perfect Synergy**: Claude LLM + PostGIS
   ```
   User Question → Claude (intent) → PostGIS (execution) → Natural Response
   ```

3. **Mission Alignment**: "MapTheGap" is about finding gaps
   - LLM makes gap analysis **accessible** (no SQL needed)
   - Complex queries in **seconds** (vs hours of manual work)
   - **Actionable insights** for business decisions

4. **Competitive Moat** 🏰
   - No competitor has natural language analytics
   - Enables premium tier ($49/mo for power users)
   - "Wow factor" for demos and investors

---

## 📊 Example Queries

### **Simple Counts**
- "How many Ria locations are in Wales?"
- "Show me all MoneyGram locations in London"
- "What's the total number of locations in Scotland?"

### **Distance Analysis**
- "What's the average distance between Ria and Western Union in Birmingham?"
- "Find Ria locations more than 5km from any competitor"
- "Show me isolated Western Union locations"

### **Coverage Gaps**
- "Where are the coverage gaps in rural Scotland?"
- "Show me areas where Ria has locations but Western Union doesn't"
- "Which cities have fewer than 3 locations?"

### **Competitive Analysis**
- "Which network dominates London?"
- "Compare Ria vs MoneyGram coverage in Wales"
- "Where does Western Union have the best density?"

### **Density Analysis**
- "Which cities have the highest location density?"
- "Show me over-saturated areas"
- "Where should we expand next?"

### **Network Optimization**
- "Are there areas with too many Ria locations?"
- "Find underserved areas with population > 50k"
- "What's the network overlap in Manchester?"

---

## 🏗️ Architecture

### **High-Level Flow**

```
User Types Question
    ↓
/api/analytics/query (Next.js API Route)
    ↓
Claude API (Function Calling Mode)
    ↓
Available Functions:
  • get_locations_in_viewport()
  • find_nearest_locations()
  • get_density_by_city()
  • compare_network_coverage()
  • get_coverage_grid()
  • get_coverage_percentage()
  • execute_custom_postgis_query() (advanced)
    ↓
Execute PostGIS Queries (Supabase)
    ↓
Format Results (natural language + structured data)
    ↓
Return to Client
    ↓
Display: Text answer + Visualization (map/chart/table)
```

### **Technical Stack**

- **LLM**: Claude 3.5 Sonnet (Anthropic API)
- **Database**: Supabase PostgreSQL + PostGIS
- **Backend**: Next.js 16 API Routes
- **Frontend**: React 19 + Recharts + Mapbox
- **Caching**: Next.js Cache Components + Redis (future)
- **Auth**: Supabase Auth (analytics = authenticated users only)

---

## 🎨 UX Patterns

### **When to Use LLM Analytics** ✅

1. **Power Users / Analysts**
   - Business intelligence
   - Expansion planning
   - Competitive research
   - Market analysis

2. **Complex Questions**
   - Multi-step analysis
   - Comparative queries
   - Spatial calculations
   - Statistical aggregations

3. **Exploratory Research**
   - Discovery-driven
   - Hypothesis testing
   - Ad-hoc questions

### **When NOT to Use** ❌

1. **Simple Filtering**
   - "Show Ria locations" → Dropdown faster
   - "Locations in London" → City filter clearer

2. **Visual Browsing**
   - Panning/zooming map
   - Touch interaction
   - Visual exploration

3. **Casual Users**
   - Unclear how to phrase questions
   - Need visual cues
   - Prefer buttons/filters

**Recommendation**: Separate analytics page for power users, keep main map simple.

---

## 📋 Phased Implementation Plan

### **Phase 1: Analytics Dashboard MVP** ⭐ **3 WEEKS**

**Scope**: Dedicated `/analytics` page with natural language query

**Features**:
- ✅ Text input: "Ask anything about network coverage"
- ✅ Example query templates (10-15 pre-built questions)
- ✅ Natural language responses
- ✅ Structured results: Tables, charts, maps
- ✅ Export: CSV, JSON download
- ✅ Query history (recent 10 queries)
- ✅ Loading states with streaming
- ✅ Error handling with helpful messages

**API Endpoints**:
- `POST /api/analytics/query` - Main query endpoint
- `GET /api/analytics/history` - Recent queries (optional)

**Database Functions** (Already Built in Phase 2):
- `get_locations_in_viewport()`
- `find_nearest_locations()`
- `get_density_by_city()`
- `compare_network_coverage()`
- `get_coverage_grid()`
- `get_coverage_percentage()`

**Target Audience**: Power users, analysts, business intelligence

**Success Metrics**:
- ✅ 10+ example queries working
- ✅ <3 second average response time
- ✅ 95% query success rate
- ✅ Export functionality
- ✅ <$20/month API costs initially

---

### **Phase 2: Smart Search Enhancement** (FUTURE)

**Scope**: Augment existing search bar with NLP detection

**Features**:
- Auto-detect natural language vs simple search
- Inline results on main map
- Quick actions: "Show on map", "Export", "Save query"

**Target Audience**: All users

**Estimated Time**: 1 week

---

### **Phase 3: Conversational Map** (FUTURE)

**Scope**: Persistent chat panel on map

**Features**:
- Multi-turn conversations
- Context retention ("show me more", "what about Wales?")
- Follow-up suggestions
- Voice input (optional)

**Target Audience**: Exploratory users

**Estimated Time**: 2-3 weeks

---

## 💰 Cost Analysis

### **Claude API Pricing**

- **Input**: ~$3 per 1M tokens (~$0.003 per 1K tokens)
- **Output**: ~$15 per 1M tokens (~$0.015 per 1K tokens)

**Per Query**:
- Average: ~1,000 input tokens + 500 output tokens
- Cost: ~$0.015 per question

**Monthly Usage Scenarios**:
| Monthly Queries | Cost |
|----------------|------|
| 100 | $1.50 |
| 1,000 | $15 |
| 10,000 | $150 |
| 100,000 | $1,500 |

**Mitigation Strategies**:
1. **Caching**: Cache common questions (Redis)
2. **Rate Limiting**: 10 queries per user per hour (free tier)
3. **Premium Tier**: Unlimited queries for $49/mo
4. **Template Queries**: Free (pre-computed, no LLM call)

**Verdict**: Very affordable for MVP, predictable scaling

---

## 🔧 Technical Implementation Details

### **Phase 1 Week 1: Core Infrastructure**

#### **1. API Route Setup**

```typescript
// app/api/analytics/query/route.ts
export async function POST(request: Request) {
  const { question, context } = await request.json();

  // 1. Authenticate user
  // 2. Rate limit check
  // 3. Call Claude API with function calling
  // 4. Execute PostGIS queries
  // 5. Format response
  // 6. Return natural language + data
}
```

#### **2. Claude Integration**

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Function calling with PostGIS functions
const tools = [
  {
    name: "get_locations_in_viewport",
    description: "Get locations within a bounding box",
    input_schema: {
      type: "object",
      properties: {
        country: { type: "string" },
        west: { type: "number" },
        south: { type: "number" },
        east: { type: "number" },
        north: { type: "number" },
      },
      required: ["country", "west", "south", "east", "north"],
    },
  },
  // ... other PostGIS functions
];
```

#### **3. PostGIS Function Wrappers**

```typescript
// lib/analytics/postgis-tools.ts
export async function executeAnalyticsQuery(
  functionName: string,
  params: Record<string, any>
) {
  const supabase = await createClient();

  switch (functionName) {
    case "get_locations_in_viewport":
      return supabase.rpc("get_locations_in_viewport", params);

    case "find_nearest_locations":
      return supabase.rpc("find_nearest_locations", params);

    // ... other functions
  }
}
```

#### **4. Response Formatting**

```typescript
interface AnalyticsResponse {
  answer: string; // Natural language answer
  data: any[]; // Structured data
  visualization: "map" | "chart" | "table" | "text";
  highlightedLocations?: Location[];
  metadata: {
    queryType: string;
    executionTime: number;
    confidence: number;
  };
  followUpQuestions?: string[];
}
```

---

### **Phase 1 Week 2: Analytics Dashboard**

#### **1. Page Structure**

```typescript
// app/(dashboard)/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div className="analytics-dashboard">
      <QueryInput />
      <ExampleQueries />
      <ResultsPanel />
      <QueryHistory />
    </div>
  );
}
```

#### **2. Query Input Component**

```typescript
// components/analytics/QueryInput.tsx
"use client";

export function QueryInput() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyticsResponse | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    const response = await fetch("/api/analytics/query", {
      method: "POST",
      body: JSON.stringify({ question, context: { country: "gb" } }),
    });
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="query-input">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask anything about network coverage..."
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Ask"}
      </button>
    </div>
  );
}
```

#### **3. Example Queries Component**

```typescript
// components/analytics/ExampleQueries.tsx
const EXAMPLE_QUERIES = [
  {
    category: "Coverage Gaps",
    questions: [
      "Show me coverage gaps in Scotland",
      "Where are underserved areas in Wales?",
      "Which cities have fewer than 3 locations?",
    ],
  },
  {
    category: "Network Comparison",
    questions: [
      "Compare Ria vs Western Union in London",
      "Which network dominates Birmingham?",
      "Show me network overlap in Manchester",
    ],
  },
  {
    category: "Density Analysis",
    questions: [
      "Which cities have the highest location density?",
      "Show me over-saturated areas",
      "Where should we expand next?",
    ],
  },
];
```

#### **4. Results Visualization**

```typescript
// components/analytics/ResultsPanel.tsx
export function ResultsPanel({ result }: { result: AnalyticsResponse }) {
  switch (result.visualization) {
    case "map":
      return <MapVisualization data={result.data} />;
    case "chart":
      return <ChartVisualization data={result.data} />;
    case "table":
      return <TableVisualization data={result.data} />;
    case "text":
      return <TextVisualization answer={result.answer} />;
  }
}
```

---

### **Phase 1 Week 3: Polish & Features**

#### **1. Export Functionality**

```typescript
// components/analytics/ExportButton.tsx
export function ExportButton({ data, format }: { data: any[], format: "csv" | "json" }) {
  const handleExport = () => {
    if (format === "csv") {
      const csv = convertToCSV(data);
      downloadFile(csv, "analytics-export.csv", "text/csv");
    } else {
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, "analytics-export.json", "application/json");
    }
  };

  return <button onClick={handleExport}>Export as {format.toUpperCase()}</button>;
}
```

#### **2. Query History**

```typescript
// components/analytics/QueryHistory.tsx
export function QueryHistory() {
  const [history, setHistory] = useState<Query[]>([]);

  // Load from localStorage or API
  useEffect(() => {
    const savedHistory = localStorage.getItem("analytics-history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <div className="query-history">
      <h3>Recent Queries</h3>
      {history.map((query) => (
        <div key={query.id} onClick={() => rerunQuery(query)}>
          {query.question} <span>{formatTime(query.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}
```

#### **3. Error Handling**

```typescript
// lib/analytics/error-handler.ts
export function formatAnalyticsError(error: Error): string {
  if (error.message.includes("rate limit")) {
    return "You've reached the query limit. Please try again in an hour or upgrade to premium.";
  }

  if (error.message.includes("invalid region")) {
    return "I couldn't identify that region. Could you be more specific? (e.g., 'Greater London', 'North Wales')";
  }

  if (error.message.includes("no data")) {
    return "No locations found matching your criteria. Try broadening your search.";
  }

  return "Sorry, I couldn't process that question. Please try rephrasing or contact support.";
}
```

---

## ⚠️ Technical Challenges & Solutions

### **Challenge 1: Geographic Boundaries**

**Problem**: User asks "Show me Wales" but we don't have Wales boundary polygon.

**Solutions**:
1. **Predefined Regions**: Hardcode major regions
   ```typescript
   const REGIONS = {
     wales: { bounds: [-5.3, 51.3, -2.6, 53.4], postcodes: ["CF", "SA", ...] },
     scotland: { bounds: [-7.6, 54.6, -0.7, 60.9], postcodes: ["AB", "DD", ...] },
     london: { bounds: [-0.5, 51.3, 0.3, 51.7], postcodes: ["E", "N", "NW", ...] },
   };
   ```

2. **Geocoding API**: Use Mapbox Geocoding for on-the-fly boundaries
   ```typescript
   const response = await fetch(
     `https://api.mapbox.com/geocoding/v5/mapbox.places/Wales.json?access_token=${token}`
   );
   const bbox = response.features[0].bbox; // [west, south, east, north]
   ```

3. **User Clarification**: Ask when ambiguous
   ```
   "I found multiple regions named 'Birmingham'. Did you mean:
    - Birmingham, England
    - Birmingham, Alabama (not in our coverage area)"
   ```

---

### **Challenge 2: Ambiguous Queries**

**Problem**: "Show me the best coverage" - Best by what metric?

**Solutions**:
1. **Clarifying Questions**:
   ```
   "What do you mean by 'best coverage'?
    - Most locations
    - Largest geographic area
    - Highest density
    - All of the above"
   ```

2. **Reasonable Defaults + Explanation**:
   ```
   "Based on location count, Western Union has the best coverage (247 locations).
    However, Ria has better geographic spread (larger area covered).
    Would you like to see the breakdown by different metrics?"
   ```

3. **Show All Relevant Metrics**:
   ```
   Network Comparison:
   - Western Union: 247 locs, 1,200 km², 0.21 locs/km²
   - Ria: 189 locs, 1,800 km², 0.11 locs/km²
   - MoneyGram: 156 locs, 950 km², 0.16 locs/km²
   ```

---

### **Challenge 3: Performance**

**Problem**: LLM calls take 1-3 seconds

**Solutions**:
1. **Streaming Responses**:
   ```typescript
   // Stream answer as it's generated
   const stream = await anthropic.messages.stream({...});

   stream.on("text", (text) => {
     appendToAnswer(text); // Show partial answer
   });
   ```

2. **Optimistic UI**:
   ```
   [User submits query]
   → Immediately show: "Analyzing network coverage in London..."
   → Show skeleton chart/table
   → Populate as data arrives
   ```

3. **Query Caching**:
   ```typescript
   // Cache common questions for 1 hour
   const cacheKey = `analytics:${hash(question)}`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);

   // Execute query...
   await redis.setex(cacheKey, 3600, JSON.stringify(result));
   ```

4. **Template Queries** (No LLM):
   ```typescript
   const TEMPLATE_QUERIES = {
     "coverage gaps in scotland": {
       function: "get_coverage_grid",
       params: { country: "gb", region: "scotland", grid_size: 0.5 },
       skipLLM: true, // Direct execution
     },
   };
   ```

---

### **Challenge 4: Data Limitations**

**Problem**: We only have location data, no demographics/population.

**Solutions**:
1. **Honest Responses**:
   ```
   "I don't have population data, but based on location density,
    these cities appear underserved: [list].

    To get population-weighted recommendations, you can upload
    census data in Settings → Data Sources."
   ```

2. **External APIs** (Future):
   - Integrate UK Census API
   - OpenStreetMap Points of Interest
   - UK Office for National Statistics

3. **User Upload** (Future):
   - Allow custom data layers (CSV upload)
   - Join with location data in queries
   - "Upload your population data to get better recommendations"

---

## 🎯 Success Criteria

### **MVP Launch (Phase 1 Complete)**

- ✅ 15+ example queries working correctly
- ✅ <3 second average response time (p95)
- ✅ 95% query success rate (non-ambiguous questions)
- ✅ Export to CSV and JSON functional
- ✅ Query history saving/loading works
- ✅ Error handling for common failure modes
- ✅ <$20/month API costs with <1,000 queries
- ✅ Positive feedback from 5+ power users

### **Product-Market Fit Indicators**

- 🎯 Users running 10+ queries per session (deep engagement)
- 🎯 50% return rate for analytics page (sticky feature)
- 🎯 Positive feedback on query complexity (solving real problems)
- 🎯 Users discovering insights they wouldn't have found manually
- 🎯 Request for additional query types (feature demand)
- 🎯 Willingness to pay for premium tier (monetization validation)

---

## 💼 Business Model

### **Freemium Tier Structure**

**Free Tier**:
- 10 queries per day
- Access to all template queries
- Export to CSV
- Query history (last 10)

**Premium Tier** ($49/month):
- Unlimited queries
- Priority processing (faster responses)
- Export to JSON, Excel, PDF
- Save favorite queries
- Full query history
- Email reports (scheduled)
- API access (for automation)

**Enterprise Tier** ($499/month):
- Everything in Premium
- Custom data sources
- White-label analytics
- Dedicated support
- SLA guarantees
- Custom integrations

---

## 🚀 Go-To-Market Strategy

### **Launch Positioning**

**Tagline**: "Ask anything about your network coverage - get instant insights"

**Key Messages**:
- "No SQL knowledge required - just ask in plain English"
- "From hours of analysis to seconds of conversation"
- "Turn your location data into strategic intelligence"

### **Demo Videos**

Create 3 demo videos showing:
1. **Coverage Gap Analysis** (30 seconds)
   - "Show me coverage gaps in Scotland"
   - Map highlights 18 gap areas
   - "These are your expansion opportunities"

2. **Competitive Analysis** (45 seconds)
   - "Compare Ria vs Western Union in London"
   - Side-by-side charts appear
   - Export data to CSV

3. **Complex Query** (60 seconds)
   - "Show me areas where we have 3+ locations within 1km"
   - "These might be over-saturated. Should we reduce?"
   - Map highlights clusters with recommendations

### **Target Audience**

**Primary**: B2B customers (network operators, expansion planners)
**Secondary**: Analysts, researchers, consultants
**Tertiary**: Curious power users

---

## 📚 Documentation Plan

### **User Documentation**

1. **Query Guide**: "How to Ask Good Questions"
   - Supported query types
   - Example queries by category
   - Tips for complex questions

2. **Interpretation Guide**: "Understanding Your Results"
   - Metric definitions
   - Chart types explained
   - When to use different visualizations

3. **FAQ**: Common Questions
   - "Why can't I ask about population?"
   - "What regions are supported?"
   - "How accurate are distance calculations?"

### **Developer Documentation**

1. **API Reference**: `/api/analytics/query`
   - Request/response schemas
   - Authentication
   - Rate limits
   - Error codes

2. **Function Catalog**: PostGIS Functions
   - Available functions
   - Parameters
   - Return types
   - Example queries

3. **Integration Guide**: "Using Analytics in Your App"
   - Embedding analytics
   - Custom data sources
   - Webhooks (future)

---

## 🔮 Future Enhancements (Post-MVP)

### **Phase 4: Advanced Features**

1. **Multi-Turn Conversations**
   - "Show me coverage in London"
   - "Now compare with Birmingham"
   - "What about just Ria locations?"
   - [Context maintained across turns]

2. **Scheduled Reports**
   - "Email me weekly coverage gap reports"
   - "Alert me when new gaps appear"
   - Automated insights

3. **Predictive Analytics**
   - "Where should we open the next location?"
   - "Predict revenue by location density"
   - ML-powered recommendations

4. **Custom Data Sources**
   - Upload census data
   - Import competitor data
   - Join with sales data
   - "Show me locations with >$100k revenue"

5. **Voice Interface**
   - Speak questions
   - Hear answers
   - Hands-free exploration

6. **Collaborative Analytics**
   - Share queries with team
   - Comment on results
   - Version control for queries

---

## 📊 Monitoring & Analytics

### **Metrics to Track**

**Usage Metrics**:
- Queries per day/week/month
- Unique users querying
- Average queries per session
- Query success rate
- Average response time

**Quality Metrics**:
- User satisfaction (thumbs up/down)
- Follow-up question rate
- Export rate (indicates useful results)
- Repeat user rate
- Premium conversion rate

**Cost Metrics**:
- Claude API costs per query
- Total monthly API spend
- Cost per user
- Revenue per API dollar (premium tier)

**Performance Metrics**:
- p50, p95, p99 response times
- Error rate by query type
- Cache hit rate
- Database query performance

---

## 🎓 Learning & Iteration

### **Beta Testing Plan**

**Week 1-2**: Internal testing
- Test all example queries
- Identify edge cases
- Refine prompts

**Week 3-4**: Closed beta (5-10 users)
- Invite power users
- Collect feedback
- Fix critical bugs

**Week 5-6**: Open beta (50+ users)
- Launch to all authenticated users
- Monitor usage patterns
- Iterate based on data

**Week 7+**: General availability
- Marketing push
- Premium tier launch
- Enterprise sales outreach

---

## ✅ Phase 1 MVP Checklist

### **Week 1: Core Infrastructure**
- [ ] Create `/api/analytics/query` route
- [ ] Set up Anthropic API client
- [ ] Implement function calling with PostGIS tools
- [ ] Create PostGIS function wrappers
- [ ] Build response formatter
- [ ] Add authentication check
- [ ] Implement basic rate limiting
- [ ] Write unit tests for API route

### **Week 2: Analytics Dashboard**
- [ ] Create `/analytics` page layout
- [ ] Build QueryInput component
- [ ] Create ExampleQueries component
- [ ] Build ResultsPanel with visualizations
- [ ] Implement map visualization
- [ ] Implement chart visualization (Recharts)
- [ ] Implement table visualization
- [ ] Add loading states
- [ ] Add error handling UI

### **Week 3: Polish & Features**
- [ ] Implement export functionality (CSV, JSON)
- [ ] Build query history component
- [ ] Add follow-up question suggestions
- [ ] Implement query caching
- [ ] Add confidence scores to responses
- [ ] Create user documentation
- [ ] Write integration tests
- [ ] Performance optimization
- [ ] Beta user testing
- [ ] Launch! 🚀

---

## 🏁 Ready to Start?

This plan provides everything needed to build a killer analytics feature that will differentiate MapTheGap from all competitors.

**Next Steps**:
1. Review and approve this plan
2. Set up Anthropic API account
3. Create `.env` variable for API key
4. Start Week 1 implementation
5. Ship Phase 1 MVP in 3 weeks! 🚀

---

**Let's build the future of location analytics!** 💪
