import * as React from "react";
import { useState, useEffect } from "react";

export type SearchEngine =
  | "google"
  | "bing"
  | "yahoo"
  | "duckduckgo"
  | "brave"
  | "yandex";

export interface SearchEngineInfo {
  id: SearchEngine;
  name: string;
  url: string;
  color: string;
}

export const searchEngines: SearchEngineInfo[] = [
  {
    id: "google",
    name: "Google",
    url: "https://google.com/search?q=",
    color: "bg-blue-500",
  },
  {
    id: "bing",
    name: "Bing",
    url: "https://bing.com/search?q=",
    color: "bg-green-500",
  },
  {
    id: "yahoo",
    name: "Yahoo",
    url: "https://yahoo.com/search?p=",
    color: "bg-purple-500",
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
  {
    id: "yandex",
    name: "Yandex",
    url: "https://yandex.com/search/?text=",
    color: "bg-red-500",
  },
];

const STORAGE_KEY = "kruger-search-engine";

export const useSearchEngine = () => {
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && searchEngines.find((engine) => engine.id === saved)) {
        return saved as SearchEngine;
      }
    } catch (error) {
      console.error("Error loading search engine from localStorage:", error);
    }
    return "google"; // Default fallback
  });

  // Save to localStorage whenever search engine changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, selectedEngine);
    } catch (error) {
      console.error("Error saving search engine to localStorage:", error);
    }
  }, [selectedEngine]);

  const getSearchUrl = (query: string, engine?: SearchEngine): string => {
    const engineToUse = engine || selectedEngine;
    const engineInfo = searchEngines.find((e) => e.id === engineToUse);
    if (!engineInfo) {
      // Fallback to Google if engine not found
      return `https://google.com/search?q=${encodeURIComponent(query)}`;
    }
    return engineInfo.url + encodeURIComponent(query);
  };

  const getEngineInfo = (engine?: SearchEngine): SearchEngineInfo => {
    const engineToUse = engine || selectedEngine;
    return searchEngines.find((e) => e.id === engineToUse) || searchEngines[0];
  };

  return {
    selectedEngine,
    setSelectedEngine,
    searchEngines,
    getSearchUrl,
    getEngineInfo,
  };
};
