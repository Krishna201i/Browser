/**
 * Meta Search Results Component
 * Displays AI-enhanced search results from multiple sources
 */

import React from "react";
import {
  Search,
  ExternalLink,
  Clock,
  Zap,
  Globe,
  BookOpen,
  Shield,
  TrendingUp,
  Star,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MetaSearchResponse, SearchResult } from "../services/meta-search";

interface MetaSearchResultsProps {
  results: MetaSearchResponse;
  onNavigate?: (url: string) => void;
  className?: string;
}

const sourceIcons = {
  wikipedia: BookOpen,
  brave: Shield,
  duckduckgo: Globe,
  google: Search,
};

const sourceColors = {
  wikipedia:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  brave:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  duckduckgo:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  google: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

export default function MetaSearchResults({
  results,
  onNavigate,
  className = "",
}: MetaSearchResultsProps) {
  const handleResultClick = (result: SearchResult) => {
    if (onNavigate) {
      onNavigate(result.url);
    } else {
      window.open(result.url, "_blank");
    }
  };

  const formatProcessingTime = (time: number): string => {
    return time < 1000
      ? `${Math.round(time)}ms`
      : `${(time / 1000).toFixed(2)}s`;
  };

  const getSourceStats = () => {
    const stats = Object.entries(results.sources).map(([source, data]) => ({
      source: source as keyof typeof results.sources,
      count: data.count,
      success: data.success,
      error: data.error,
    }));
    return stats;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Modern Search Info Header */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                <Search className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                "{results.query}"
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatProcessingTime(results.processingTime)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">
                  {results.totalResults} results found
                </span>
              </div>
              {results.aiEnhanced && (
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 rounded-full">
                  <Star className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-purple-600 dark:text-purple-400 font-medium text-sm">
                    AI Enhanced
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getSourceStats().map(({ source, count, success }) => (
                <div
                  key={source}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${success ? sourceColors[source] : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}
                >
                  {React.createElement(sourceIcons[source], {
                    className: "h-3 w-3",
                  })}
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <ScrollArea className="h-[70vh]">
        <div className="space-y-4 pr-4">
          {results.results.map((result, index) => (
            <Card
              key={result.id}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-l-2 border-l-transparent hover:border-l-blue-500 hover:bg-white/90 dark:hover:bg-slate-800/90 backdrop-blur-sm group"
              onClick={() => handleResultClick(result)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Result Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground hover:text-blue-600 transition-colors overflow-hidden text-ellipsis">
                          {result.title}
                        </h3>
                        {result.similarity && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {Math.round(result.similarity * 100)}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="truncate">{result.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Source Badge */}
                    <Badge className={sourceColors[result.source]}>
                      {React.createElement(sourceIcons[result.source], {
                        className: "h-3 w-3 mr-1",
                      })}
                      {result.source}
                    </Badge>
                  </div>

                  {/* Snippet */}
                  <p
                    className="text-sm text-muted-foreground leading-relaxed overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {result.snippet}
                  </p>

                  {/* Thumbnail if available */}
                  {result.thumbnail && (
                    <div className="flex justify-center">
                      <img
                        src={result.thumbnail}
                        alt={result.title}
                        className="max-h-32 max-w-full rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Metadata */}
                  {result.metadata &&
                    Object.keys(result.metadata).length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {result.metadata.type && (
                          <Badge variant="outline" className="text-xs">
                            {result.metadata.type}
                          </Badge>
                        )}
                        {result.metadata.rank && (
                          <span>Rank: {result.metadata.rank}</span>
                        )}
                        {result.metadata.wordCount && (
                          <span>{result.metadata.wordCount} words</span>
                        )}
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}

          {results.results.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  Try different keywords or check your spelling.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Source Errors (if any) */}
      {getSourceStats().some((stat) => !stat.success && stat.error) && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 text-sm">
              Search Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-sm">
              {getSourceStats()
                .filter((stat) => !stat.success && stat.error)
                .map(({ source, error }) => (
                  <div
                    key={source}
                    className="text-orange-700 dark:text-orange-300"
                  >
                    <strong className="capitalize">{source}:</strong> {error}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
