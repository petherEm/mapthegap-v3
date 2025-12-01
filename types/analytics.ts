// Analytics types for natural language querying with Claude LLM

export type VisualizationType = "map" | "chart" | "table" | "text";

export type ChartType = "pie" | "bar" | "line" | "scatter";

export interface AnalyticsQuery {
  question: string;
  context?: {
    country?: string;
    viewport?: {
      west: number;
      south: number;
      east: number;
      north: number;
    };
    filters?: {
      networks?: string[];
      cities?: string[];
    };
  };
}

export interface AnalyticsResponse {
  answer: string; // Natural language answer from Claude
  data: any[]; // Structured data from PostGIS
  visualization: VisualizationType;
  chartType?: ChartType; // If visualization is "chart"
  highlightedLocations?: {
    id: string;
    lat: number;
    lng: number;
    network_name: string;
    city: string;
  }[];
  metadata: {
    queryType: string; // e.g., "coverage_gap", "density_analysis", "network_comparison"
    executionTime: number; // milliseconds
    confidence: number; // 0-1 score
    functionsUsed: string[]; // PostGIS functions called
  };
  followUpQuestions?: string[];
  exportable: boolean; // Can this be exported to CSV/JSON?
}

export interface QueryHistoryItem {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  executionTime: number;
  favorite?: boolean;
}

// PostGIS function call interface
export interface PostGISFunctionCall {
  name: string;
  params: Record<string, any>;
}

// Example query templates
export interface ExampleQuery {
  category: string;
  question: string;
  description: string;
  icon?: string; // Emoji or icon name
}

export const EXAMPLE_QUERIES: ExampleQuery[] = [
  // Coverage Gaps
  {
    category: "Coverage Gaps",
    question: "Show me coverage gaps in Scotland",
    description: "Identify areas with no money transfer locations",
    icon: "📍",
  },
  {
    category: "Coverage Gaps",
    question: "Where are underserved areas in Wales?",
    description: "Find regions with low location density",
    icon: "🏔️",
  },
  {
    category: "Coverage Gaps",
    question: "Which cities have fewer than 3 locations?",
    description: "Cities that may need expansion",
    icon: "🏙️",
  },

  // Network Comparison
  {
    category: "Network Comparison",
    question: "Compare Ria vs Western Union in London",
    description: "Side-by-side network analysis",
    icon: "⚖️",
  },
  {
    category: "Network Comparison",
    question: "Which network dominates Birmingham?",
    description: "Market share analysis by city",
    icon: "👑",
  },
  {
    category: "Network Comparison",
    question: "Show me network overlap in Manchester",
    description: "Areas where multiple networks operate",
    icon: "🔄",
  },

  // Density Analysis
  {
    category: "Density Analysis",
    question: "Which cities have the highest location density?",
    description: "Locations per square kilometer ranking",
    icon: "📊",
  },
  {
    category: "Density Analysis",
    question: "Show me over-saturated areas",
    description: "Areas with too many locations",
    icon: "⚠️",
  },
  {
    category: "Density Analysis",
    question: "Where should we expand next?",
    description: "Strategic expansion recommendations",
    icon: "🎯",
  },

  // Distance Analysis
  {
    category: "Distance Analysis",
    question: "Find Ria locations more than 5km from any competitor",
    description: "Isolated locations analysis",
    icon: "📏",
  },
  {
    category: "Distance Analysis",
    question: "What's the average distance between Ria and Western Union in Birmingham?",
    description: "Competitive proximity analysis",
    icon: "🧭",
  },
  {
    category: "Distance Analysis",
    question: "Show me locations within 2km of London city center",
    description: "Distance from landmark/point",
    icon: "📍",
  },

  // Simple Queries
  {
    category: "Simple Queries",
    question: "How many Ria locations are in Wales?",
    description: "Basic count query",
    icon: "🔢",
  },
  {
    category: "Simple Queries",
    question: "Show me all MoneyGram locations in London",
    description: "Filtered location list",
    icon: "📋",
  },
  {
    category: "Simple Queries",
    question: "What's the total number of locations in Scotland?",
    description: "Overall statistics",
    icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  },
];

// Group example queries by category
export function getExampleQueriesByCategory(): Record<string, ExampleQuery[]> {
  return EXAMPLE_QUERIES.reduce((acc, query) => {
    if (!acc[query.category]) {
      acc[query.category] = [];
    }
    acc[query.category].push(query);
    return acc;
  }, {} as Record<string, ExampleQuery[]>);
}

// Error types for analytics
export interface AnalyticsError {
  code: string;
  message: string;
  userMessage: string; // Friendly message for users
  suggestion?: string; // How to fix or rephrase
}

export const ANALYTICS_ERRORS = {
  RATE_LIMIT: {
    code: "RATE_LIMIT",
    message: "Rate limit exceeded",
    userMessage: "You've reached the query limit. Please try again in an hour or upgrade to premium.",
    suggestion: "Try using example queries or come back later.",
  },
  INVALID_REGION: {
    code: "INVALID_REGION",
    message: "Region not recognized",
    userMessage: "I couldn't identify that region. Could you be more specific?",
    suggestion: "Try using full region names like 'Greater London' or 'North Wales'.",
  },
  NO_DATA: {
    code: "NO_DATA",
    message: "No data found",
    userMessage: "No locations found matching your criteria.",
    suggestion: "Try broadening your search or check if the region name is correct.",
  },
  API_ERROR: {
    code: "API_ERROR",
    message: "API error",
    userMessage: "Sorry, I couldn't process that question right now.",
    suggestion: "Please try again or contact support if the issue persists.",
  },
  AMBIGUOUS_QUERY: {
    code: "AMBIGUOUS_QUERY",
    message: "Query is ambiguous",
    userMessage: "Your question could mean different things. Could you clarify?",
    suggestion: "Be more specific about what you want to know.",
  },
} as const;
