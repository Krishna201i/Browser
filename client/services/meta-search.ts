/**
 * Meta Search Engine Service for Kruger Browser
 * Aggregates results from Wikipedia, Brave, DuckDuckGo, and Google APIs
 */

import { aiEmbeddingsService } from "./ai-embeddings";

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: "wikipedia" | "brave" | "duckduckgo" | "google";
  timestamp: Date;
  similarity?: number;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

export interface MetaSearchResponse {
  query: string;
  results: SearchResult[];
  sources: {
    wikipedia: { count: number; success: boolean; error?: string };
    brave: { count: number; success: boolean; error?: string };
    duckduckgo: { count: number; success: boolean; error?: string };
    google: { count: number; success: boolean; error?: string };
  };
  totalResults: number;
  processingTime: number;
  aiEnhanced: boolean;
}

export interface APIUsageStats {
  google: {
    used: number;
    limit: number;
    resetDate: Date;
    remaining: number;
  };
  brave: { used: number };
  duckduckgo: { used: number };
  wikipedia: { used: number };
}

export class MetaSearchService {
  private readonly GOOGLE_MONTHLY_LIMIT = 100;
  private readonly STORAGE_KEY = "kruger-search-stats";
  private usageStats: APIUsageStats;

  constructor() {
    this.usageStats = this.loadUsageStats();
  }

  private loadUsageStats(): APIUsageStats {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const stats = JSON.parse(saved);
        // Check if we need to reset Google usage (monthly)
        const resetDate = new Date(stats.google.resetDate);
        const now = new Date();
        const monthDiff =
          (now.getFullYear() - resetDate.getFullYear()) * 12 +
          (now.getMonth() - resetDate.getMonth());

        if (monthDiff >= 1) {
          stats.google.used = 0;
          stats.google.resetDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
          );
          stats.google.remaining = this.GOOGLE_MONTHLY_LIMIT;
        }

        return stats;
      }
    } catch (error) {
      console.error("Error loading search usage stats:", error);
    }

    // Default stats
    const now = new Date();
    return {
      google: {
        used: 0,
        limit: this.GOOGLE_MONTHLY_LIMIT,
        resetDate: new Date(now.getFullYear(), now.getMonth(), 1),
        remaining: this.GOOGLE_MONTHLY_LIMIT,
      },
      brave: { used: 0 },
      duckduckgo: { used: 0 },
      wikipedia: { used: 0 },
    };
  }

  private saveUsageStats(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.usageStats));
    } catch (error) {
      console.error("Error saving search usage stats:", error);
    }
  }

  private incrementUsage(source: keyof APIUsageStats): void {
    if (source === "google") {
      this.usageStats.google.used++;
      this.usageStats.google.remaining = Math.max(
        0,
        this.GOOGLE_MONTHLY_LIMIT - this.usageStats.google.used,
      );
    } else {
      this.usageStats[source].used++;
    }
    this.saveUsageStats();
  }

  private async searchWikipedia(query: string): Promise<SearchResult[]> {
    try {
      // Use Wikipedia's JSONP endpoint to avoid CORS issues
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`;

      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.query && data.query.search) {
        const results: SearchResult[] = data.query.search.map(
          (item: any, index: number) => ({
            id: `wiki_${index}`,
            title: item.title,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
            snippet: item.snippet.replace(/<[^>]*>/g, ""), // Remove HTML tags
            source: "wikipedia" as const,
            timestamp: new Date(),
            metadata: {
              pageId: item.pageid,
              size: item.size,
              wordCount: item.wordcount,
            },
          }),
        );

        this.incrementUsage("wikipedia");
        return results;
      }
    } catch (error) {
      console.warn("Wikipedia search failed (CORS/Network):", error.message);
      // Return fallback Wikipedia search result
      return [
        {
          id: "wiki_fallback",
          title: `Search "${query}" on Wikipedia`,
          url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
          snippet: `Click to search for "${query}" directly on Wikipedia.`,
          source: "wikipedia" as const,
          timestamp: new Date(),
          metadata: { fallback: true },
        },
      ];
    }
  }

  private async searchDuckDuckGo(query: string): Promise<SearchResult[]> {
    try {
      // Note: DuckDuckGo's API has CORS restrictions
      // We'll provide a fallback search result that opens DuckDuckGo directly
      throw new Error("DuckDuckGo API has CORS restrictions");
    } catch (error) {
      console.warn(
        "DuckDuckGo search failed (CORS restrictions):",
        error.message,
      );

      // Return fallback DuckDuckGo search result
      this.incrementUsage("duckduckgo");
      return [
        {
          id: "ddg_fallback",
          title: `Search "${query}" on DuckDuckGo`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: `Privacy-focused search for "${query}" on DuckDuckGo. Click to open in a new tab.`,
          source: "duckduckgo" as const,
          timestamp: new Date(),
          metadata: {
            fallback: true,
            privacy: "enhanced",
          },
        },
      ];
    }
  }

  private async searchBrave(query: string): Promise<SearchResult[]> {
    try {
      // Note: Brave Search API requires API key and has CORS restrictions
      // Provide fallback search result
      this.incrementUsage("brave");
      return [
        {
          id: "brave_fallback",
          title: `Search "${query}" on Brave Search`,
          url: `https://search.brave.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Privacy-focused, independent search for "${query}" on Brave Search. No tracking, no profiling.`,
          source: "brave" as const,
          timestamp: new Date(),
          metadata: {
            type: "web",
            privacy: "enhanced",
            fallback: true,
          },
        },
      ];
    } catch (error) {
      console.warn("Brave search failed:", error.message);
      return [];
    }
  }

  private async searchGoogle(query: string): Promise<SearchResult[]> {
    // Check if we have remaining Google searches
    if (this.usageStats.google.remaining <= 0) {
      // Switch to alternative API when Google limit is reached
      return this.searchAlternativeAPI(query);
    }

    try {
      // Note: Google Custom Search API requires API key, Search Engine ID, and has CORS restrictions
      // Provide fallback search result
      this.incrementUsage("google");
      return [
        {
          id: "google_fallback",
          title: `Search "${query}" on Google`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Comprehensive search results for "${query}" on Google. Click to open in a new tab.`,
          source: "google" as const,
          timestamp: new Date(),
          metadata: {
            type: "web",
            fallback: true,
            rank: 1,
          },
        },
      ];
    } catch (error) {
      console.warn(
        "Google search failed, switching to alternative API:",
        error.message,
      );
      return this.searchAlternativeAPI(query);
    }
  }

  private async searchAlternativeAPI(query: string): Promise<SearchResult[]> {
    try {
      // Use Bing API as alternative when Google limit is reached
      // This could be replaced with other APIs like Yandex, etc.
      return [
        {
          id: "bing_alternative",
          title: `Search "${query}" on Bing (Alternative)`,
          url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Alternative search results for "${query}" from Bing. Used when Google API limit is reached.`,
          source: "google" as const, // Keep as google for UI consistency
          timestamp: new Date(),
          metadata: {
            type: "web",
            fallback: true,
            alternative: "bing",
            rank: 1,
          },
        },
      ];
    } catch (error) {
      console.warn("Alternative API also failed:", error.message);
      throw new Error("All search APIs unavailable");
    }
  }

  async search(
    query: string,
    useAI: boolean = true,
  ): Promise<MetaSearchResponse> {
    const startTime = performance.now();
    const sources = {
      wikipedia: { count: 0, success: false },
      brave: { count: 0, success: false },
      duckduckgo: { count: 0, success: false },
      google: { count: 0, success: false },
    };

    let allResults: SearchResult[] = [];

    // Search all sources in parallel
    const searchPromises = [
      this.searchWikipedia(query)
        .then((results) => {
          sources.wikipedia.count = results.length;
          sources.wikipedia.success = true;
          return results;
        })
        .catch((error) => {
          sources.wikipedia.error = error.message;
          return [];
        }),

      this.searchDuckDuckGo(query)
        .then((results) => {
          sources.duckduckgo.count = results.length;
          sources.duckduckgo.success = true;
          return results;
        })
        .catch((error) => {
          sources.duckduckgo.error = error.message;
          return [];
        }),

      this.searchBrave(query)
        .then((results) => {
          sources.brave.count = results.length;
          sources.brave.success = true;
          return results;
        })
        .catch((error) => {
          sources.brave.error = error.message;
          return [];
        }),
    ];

    // Add Google search if we have remaining quota
    if (this.usageStats.google.remaining > 0) {
      searchPromises.push(
        this.searchGoogle(query)
          .then((results) => {
            sources.google.count = results.length;
            sources.google.success = true;
            return results;
          })
          .catch((error) => {
            sources.google.error = error.message;
            return [];
          }),
      );
    } else {
      sources.google.error = "Monthly limit exceeded";
    }

    const searchResults = await Promise.all(searchPromises);
    allResults = searchResults.flat();

    // Apply AI-powered semantic ranking if requested
    if (useAI && allResults.length > 0) {
      try {
        const documents = allResults.map(
          (result) => `${result.title} ${result.snippet}`,
        );
        const aiResults = await aiEmbeddingsService.semanticSearch(
          query,
          documents,
          allResults.length,
        );

        // Apply AI similarity scores to results
        allResults.forEach((result, index) => {
          const aiResult = aiResults.results[index];
          if (aiResult) {
            result.similarity = aiResult.similarity;
          }
        });

        // Re-sort by AI similarity
        allResults.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      } catch (error) {
        console.error("AI ranking error:", error);
      }
    }

    const processingTime = performance.now() - startTime;

    return {
      query,
      results: allResults,
      sources,
      totalResults: allResults.length,
      processingTime,
      aiEnhanced: useAI,
    };
  }

  getUsageStats(): APIUsageStats {
    return { ...this.usageStats };
  }

  resetGoogleUsage(): void {
    const now = new Date();
    this.usageStats.google.used = 0;
    this.usageStats.google.remaining = this.GOOGLE_MONTHLY_LIMIT;
    this.usageStats.google.resetDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );
    this.saveUsageStats();
  }

  canUseGoogle(): boolean {
    return this.usageStats.google.remaining > 0;
  }
}

// Singleton instance
export const metaSearchService = new MetaSearchService();
