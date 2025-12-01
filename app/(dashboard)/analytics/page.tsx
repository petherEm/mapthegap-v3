"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getExampleQueriesByCategory } from "@/types/analytics";
import type { AnalyticsResponse } from "@/types/analytics";

// Helper function to render markdown-style text
function MarkdownText({ text }: { text: string }) {
  const renderLine = (line: string, index: number) => {
    // Convert **bold** to <strong>
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const rendered = parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-neutral-50">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });

    // Check if line starts with "- " for bullet point
    if (line.trim().startsWith("- ")) {
      return (
        <li key={index} className="ml-4">
          {rendered}
        </li>
      );
    }

    // Regular line
    return (
      <div key={index}>
        {rendered}
      </div>
    );
  };

  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exampleQueries = getExampleQueriesByCategory();

  const handleSubmit = async (questionText?: string) => {
    const queryText = questionText || question;

    if (!queryText.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analytics/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: queryText,
          context: {
            country: "gb",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Failed to process question");
      } else {
        setResult(data);
        if (questionText) {
          setQuestion(questionText);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
    handleSubmit(exampleQuestion);
  };

  const handleExport = (format: "csv" | "json") => {
    if (!result?.data || result.data.length === 0) return;

    if (format === "json") {
      const json = JSON.stringify(result.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const headers = Object.keys(result.data[0]);
      const csvRows = [headers.join(",")];

      for (const row of result.data) {
        const values = headers.map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        });
        csvRows.push(values.join(","));
      }

      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-full overflow-auto bg-neutral-950 text-neutral-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-violet-400 hover:text-violet-300 transition-colors mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-neutral-400">
            Ask anything about network coverage and get instant insights powered by AI
          </p>
        </div>

        {/* Query Input */}
        <div className="bg-neutral-900 rounded-lg p-6 mb-8">
          <label className="block text-sm font-medium mb-3">
            Ask a Question
          </label>
          <div className="flex gap-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="e.g., Show me coverage gaps in Scotland..."
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-md px-4 py-3 text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              rows={3}
              disabled={loading}
            />
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !question.trim()}
              className="px-6 py-3 bg-violet-500 hover:bg-violet-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-semibold rounded-md transition-colors h-fit"
            >
              {loading ? "Analyzing..." : "Ask"}
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Press Enter to submit • Shift+Enter for new line
          </p>
        </div>

        {/* Example Queries */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Example Queries</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(exampleQueries).map(([category, queries]) => (
              <div key={category} className="bg-neutral-900 rounded-lg p-4">
                <h3 className="font-semibold text-violet-400 mb-3">{category}</h3>
                <div className="space-y-2">
                  {queries.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExampleClick(query.question)}
                      className="w-full text-left text-sm text-neutral-300 hover:text-violet-400 transition-colors p-2 rounded hover:bg-neutral-800"
                      disabled={loading}
                    >
                      <span className="mr-2">{query.icon}</span>
                      {query.question}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <p className="text-sm text-red-400">
              <strong>Error:</strong> {error}
            </p>
            {error.includes("API key") && (
              <p className="text-xs text-red-300 mt-2">
                Add your Anthropic API key to <code>.env.local</code> to enable analytics.
              </p>
            )}
          </div>
        )}

        {/* Results Display */}
        {result && !error && (
          <div className="bg-neutral-900 rounded-lg p-6 mb-8">
            {/* Answer */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Answer</h2>
              <div className="text-neutral-200 leading-relaxed">
                <MarkdownText text={result.answer} />
              </div>
            </div>

            {/* Data Table */}
            {result.data && result.data.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Data ({result.data.length} rows)</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport("csv")}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-sm rounded transition-colors"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => handleExport("json")}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-sm rounded transition-colors"
                    >
                      Export JSON
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-700">
                        {Object.keys(result.data[0]).map((key) => (
                          <th
                            key={key}
                            className="text-left py-2 px-3 font-semibold text-neutral-300"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.slice(0, 10).map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-neutral-800 hover:bg-neutral-800/50"
                        >
                          {Object.values(row).map((value, cellIdx) => (
                            <td key={cellIdx} className="py-2 px-3 text-neutral-400">
                              {typeof value === "number"
                                ? value.toFixed(2)
                                : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.data.length > 10 && (
                    <p className="text-xs text-neutral-500 mt-2">
                      Showing first 10 of {result.data.length} rows. Export to see all data.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t border-neutral-800 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Query Type:</span>
                  <span className="ml-2 text-neutral-300 capitalize">
                    {result.metadata.queryType.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Execution Time:</span>
                  <span className="ml-2 text-neutral-300">
                    {result.metadata.executionTime}ms
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Confidence:</span>
                  <span className="ml-2 text-neutral-300">
                    {(result.metadata.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Functions Used:</span>
                  <span className="ml-2 text-neutral-300">
                    {result.metadata.functionsUsed.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Follow-up Questions */}
            {result.followUpQuestions && result.followUpQuestions.length > 0 && (
              <div className="mt-6 pt-4 border-t border-neutral-800">
                <h3 className="text-sm font-semibold mb-2 text-neutral-400">
                  Follow-up Questions:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.followUpQuestions.map((followUp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExampleClick(followUp)}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-sm rounded transition-colors"
                      disabled={loading}
                    >
                      {followUp}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <div className="bg-neutral-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">How it Works</h2>
          <ul className="text-sm text-neutral-400 space-y-2">
            <li>
              • <strong className="text-neutral-300">Ask naturally:</strong> Type your question in plain English
            </li>
            <li>
              • <strong className="text-neutral-300">AI understands:</strong> Claude analyzes your intent
            </li>
            <li>
              • <strong className="text-neutral-300">PostGIS executes:</strong> Spatial queries run on your data
            </li>
            <li>
              • <strong className="text-neutral-300">Get insights:</strong> Natural language answers + exportable data
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
