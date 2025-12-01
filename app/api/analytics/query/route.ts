import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { executePostGISFunction, POSTGIS_TOOLS, detectRegion } from "@/lib/analytics/postgis-tools";
import type { AnalyticsQuery, AnalyticsResponse, PostGISFunctionCall } from "@/types/analytics";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to use analytics." },
        { status: 401 }
      );
    }

    // 2. Get request body
    const body: AnalyticsQuery = await request.json();
    const { question, context } = body;

    if (!question || question.trim() === "") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // 3. Check for API key
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_api_key_here") {
      return NextResponse.json(
        {
          error: "Analytics feature not configured",
          message: "Please add your Anthropic API key to .env.local to enable natural language analytics."
        },
        { status: 503 }
      );
    }

    // 4. Detect region from question if not provided
    let regionBounds = null;
    if (!context?.viewport) {
      const detectedRegion = detectRegion(question);
      if (detectedRegion) {
        regionBounds = detectedRegion.bounds;
      }
    }

    // 5. Build system prompt
    const systemPrompt = `You are a geographic data analyst for MapTheGap, a location intelligence platform.

You help users analyze money transfer location data across countries using PostGIS spatial functions.

Current context:
- Country: ${context?.country || "gb"}
- Available networks: Ria, Western Union, MoneyGram, Poczta Polska
${regionBounds ? `- Detected region bounds: ${regionBounds.join(", ")}` : ""}

Your tasks:
1. Understand the user's question about location data
2. Choose the appropriate PostGIS function(s) to answer it
3. Execute the function(s) to get data
4. Provide a clear, concise answer in natural language
5. Suggest follow-up questions if relevant

Available PostGIS functions:
- get_locations_in_viewport: Get locations in a bounding box
- find_nearest_locations: Find N nearest locations to a point
- get_density_by_city: Calculate location density per city
- compare_network_coverage: Compare networks by coverage metrics
- get_coverage_grid: Generate grid for coverage gap analysis
- get_coverage_percentage: Calculate % of country covered

Guidelines:
- Be concise but informative
- Use numbers and statistics when available
- Highlight key insights
- If data is missing, say so honestly
- Suggest specific follow-up questions based on results`;

    // 6. Call Claude with function calling
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5", // Claude Sonnet 4.5
      max_tokens: 4096,
      tools: POSTGIS_TOOLS,
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
      system: systemPrompt,
    });

    // 7. Process function calls
    const functionsUsed: string[] = [];
    let finalAnswer = "";
    let queryData: any[] = [];
    let visualization: "map" | "chart" | "table" | "text" = "text";

    for (const block of response.content) {
      if (block.type === "tool_use") {
        // Execute PostGIS function
        functionsUsed.push(block.name);

        const functionCall: PostGISFunctionCall = {
          name: block.name,
          params: block.input as Record<string, any>,
        };

        const { data, error } = await executePostGISFunction(functionCall);

        if (error) {
          console.error(`PostGIS function error:`, error);
          return NextResponse.json(
            { error: `Database query failed: ${error.message}` },
            { status: 500 }
          );
        }

        queryData = data || [];

        // Continue conversation with function result
        const followUpResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-5", // Claude Sonnet 4.5
          max_tokens: 2048,
          tools: POSTGIS_TOOLS,
          messages: [
            {
              role: "user",
              content: question,
            },
            {
              role: "assistant",
              content: response.content,
            },
            {
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: JSON.stringify(data),
                },
              ],
            },
          ],
          system: systemPrompt,
        });

        // Extract final text answer
        for (const followUpBlock of followUpResponse.content) {
          if (followUpBlock.type === "text") {
            finalAnswer = followUpBlock.text;
          }
        }
      } else if (block.type === "text") {
        finalAnswer = block.text;
      }
    }

    // 8. Determine visualization type based on function used
    if (functionsUsed.includes("get_coverage_grid")) {
      visualization = "map";
    } else if (functionsUsed.includes("compare_network_coverage") || functionsUsed.includes("get_density_by_city")) {
      visualization = "chart";
    } else if (functionsUsed.includes("get_locations_in_viewport") || functionsUsed.includes("find_nearest_locations")) {
      visualization = "table";
    }

    // 9. Generate follow-up questions
    const followUpQuestions: string[] = [];
    if (functionsUsed.includes("compare_network_coverage")) {
      followUpQuestions.push("Show me coverage gaps for the leading network");
      followUpQuestions.push("Which cities have the highest density?");
    } else if (functionsUsed.includes("get_coverage_grid")) {
      followUpQuestions.push("What's the total coverage percentage?");
      followUpQuestions.push("Which network should expand into gap areas?");
    }

    // 10. Build response
    const executionTime = Date.now() - startTime;

    const analyticsResponse: AnalyticsResponse = {
      answer: finalAnswer || "I couldn't process that question. Please try rephrasing.",
      data: queryData,
      visualization,
      metadata: {
        queryType: functionsUsed[0] || "unknown",
        executionTime,
        confidence: 0.95, // TODO: Implement actual confidence scoring
        functionsUsed,
      },
      followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
      exportable: queryData.length > 0,
    };

    return NextResponse.json(analyticsResponse);

  } catch (error) {
    console.error("Analytics query error:", error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {
          error: "AI service error",
          message: error.message
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Unexpected error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
