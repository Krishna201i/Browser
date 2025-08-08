/**
 * Meta Search Hook for Kruger Browser
 * Replaces the old search engine system with AI-enhanced meta search
 */

import { useState, useEffect, useCallback } from "react";
import {
  metaSearchService,
  MetaSearchResponse,
  SearchResult,
  APIUsageStats,
} from "../services/meta-search";

export type SearchMode =
  | "meta"
  | "wikipedia"
  | "duckduckgo"
  | "brave"
  | "google";

export interface SearchSettings {
  aiEnhanced: boolean;
  fallbackEnabled: boolean;
  maxResults: number;
  selectedEngine: string;
  enabledSources: {
    wikipedia: boolean;
    brave: boolean;
    duckduckgo: boolean;
    google: boolean;
  };
}

export interface SearchState {
  isSearching: boolean;
  lastQuery: string;
  lastResults: MetaSearchResponse | null;
  error: string | null;
  usageStats: APIUsageStats;
}

const STORAGE_KEY = "kruger-meta-search-settings";

const defaultSettings: SearchSettings = {
  aiEnhanced: true,
  fallbackEnabled: true,
  maxResults: 20,
  selectedEngine: "meta",
  enabledSources: {
    wikipedia: true,
    brave: true,
    duckduckgo: true,
    google: true,
  },
};

export const useMetaSearch = () => {
  const [settings, setSettings] = useState<SearchSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error("Error loading meta search settings:", error);
    }
    return defaultSettings;
  });

  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    lastQuery: "",
    lastResults: null,
    error: null,
    usageStats: metaSearchService.getUsageStats(),
  });

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving meta search settings:", error);
    }
  }, [settings]);

  // Update usage stats periodically
  useEffect(() => {
    const updateStats = () => {
      setSearchState((prev) => ({
        ...prev,
        usageStats: metaSearchService.getUsageStats(),
      }));
    };

    const interval = setInterval(updateStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SearchSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const search = useCallback(
    async (query: string): Promise<MetaSearchResponse> => {
      if (!query.trim()) {
        throw new Error("Search query cannot be empty");
      }

      setSearchState((prev) => ({
        ...prev,
        isSearching: true,
        error: null,
        lastQuery: query,
      }));

      try {
        const results = await metaSearchService.search(
          query,
          settings.aiEnhanced,
        );

        // Filter results based on enabled sources
        const filteredResults: SearchResult[] = results.results.filter(
          (result) => {
            return settings.enabledSources[result.source];
          },
        );

        // Limit results if needed
        const limitedResults = filteredResults.slice(0, settings.maxResults);

        const finalResults: MetaSearchResponse = {
          ...results,
          results: limitedResults,
          totalResults: limitedResults.length,
        };

        setSearchState((prev) => ({
          ...prev,
          isSearching: false,
          lastResults: finalResults,
          usageStats: metaSearchService.getUsageStats(),
          error: null, // Clear any previous errors
        }));

        return finalResults;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Search failed due to network restrictions";

        setSearchState((prev) => ({
          ...prev,
          isSearching: false,
          error: `Search failed: ${errorMessage}. Try using individual search engines directly.`,
          usageStats: metaSearchService.getUsageStats(),
        }));

        // Don't re-throw error to prevent unhandled promise rejections
        console.warn("Meta search failed:", errorMessage);
        return null;
      }
    },
    [settings],
  );

  const getSearchUrl = useCallback(
    (query: string, source?: SearchMode): string => {
      const encodedQuery = encodeURIComponent(query);

      switch (source) {
        case "wikipedia":
          return `https://en.wikipedia.org/wiki/Special:Search?search=${encodedQuery}`;
        case "brave":
          return `https://search.brave.com/search?q=${encodedQuery}`;
        case "duckduckgo":
          return `https://duckduckgo.com/?q=${encodedQuery}`;
        case "google":
          return `https://www.google.com/search?q=${encodedQuery}`;
        case "meta":
        default:
          // Use meta search by default
          return `kruger://search?q=${encodedQuery}`;
      }
    },
    [],
  );

  const clearSearchHistory = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      lastQuery: "",
      lastResults: null,
      error: null,
    }));
  }, []);

  const resetGoogleUsage = useCallback(() => {
    metaSearchService.resetGoogleUsage();
    setSearchState((prev) => ({
      ...prev,
      usageStats: metaSearchService.getUsageStats(),
    }));
  }, []);

  const canUseGoogle = useCallback((): boolean => {
    return metaSearchService.canUseGoogle();
  }, []);

  const getRecommendedFallback = useCallback((): SearchMode => {
    // Recommend fallback search engines when Google is unavailable
    if (settings.enabledSources.duckduckgo) return "duckduckgo";
    if (settings.enabledSources.brave) return "brave";
    if (settings.enabledSources.wikipedia) return "wikipedia";
    return "meta";
  }, [settings.enabledSources]);

  const isSourceEnabled = useCallback(
    (source: keyof SearchSettings["enabledSources"]): boolean => {
      return settings.enabledSources[source];
    },
    [settings.enabledSources],
  );

  const getEnabledSourcesCount = useCallback((): number => {
    return Object.values(settings.enabledSources).filter(Boolean).length;
  }, [settings.enabledSources]);

  return {
    // Settings
    settings,
    updateSettings,

    // Search state
    searchState,

    // Search functions
    search,
    getSearchUrl,
    clearSearchHistory,

    // Google API management
    resetGoogleUsage,
    canUseGoogle,

    // Utilities
    getRecommendedFallback,
    isSourceEnabled,
    getEnabledSourcesCount,

    // Legacy compatibility with working engine switching
    selectedEngine: settings.selectedEngine,
    setSelectedEngine: (engine: string) => {
      updateSettings({ selectedEngine: engine });
    },
    searchEngines: [
      {
        id: "meta",
        name: "Meta Search (AI Enhanced)",
        url: "kruger://search?q=",
        color: "bg-gradient-to-r from-blue-500 to-purple-600",
      },
      {
        id: "google",
        name: "Google",
        url: "https://google.com/search?q=",
        color: "bg-blue-500",
      },
      {
        id: "duckduckgo",
        name: "DuckDuckGo",
        url: "https://duckduckgo.com/?q=",
        color: "bg-orange-500",
      },
      {
        id: "brave",
        name: "Brave Search",
        url: "https://search.brave.com/search?q=",
        color: "bg-orange-600",
      },
    ],
    getEngineInfo: () => ({
      id: "meta" as const,
      name: "Meta Search (AI Enhanced)",
      url: "kruger://search?q=",
      color: "bg-gradient-to-r from-blue-500 to-purple-600",
    }),
  };
};
