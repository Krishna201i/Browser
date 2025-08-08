/**
 * Meta Search Page Component
 * Modern, user-friendly search interface for the Kruger Browser
 */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Settings,
  RefreshCw,
  TrendingUp,
  Zap,
  AlertCircle,
  Clock,
  BookOpen,
  Shield,
  Globe,
  Bot,
  Sparkles,
  Layers,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMetaSearch } from "@/hooks/use-meta-search";
import { useBrowserSettings } from "@/hooks/use-browser-settings";
import MetaSearchResults from "@/components/MetaSearchResults";
import { MetaSearchResponse } from "../services/meta-search";

interface MetaSearchPageProps {
  onNavigate?: (url: string) => void;
}

export default function MetaSearchPage({ onNavigate }: MetaSearchPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<MetaSearchResponse | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const {
    settings,
    updateSettings,
    searchState,
    search,
    canUseGoogle,
    getEnabledSourcesCount,
  } = useMetaSearch();

  const browserSettings = useBrowserSettings();

  const toggleTheme = () => {
    const newTheme =
      browserSettings.settings.theme === "light" ? "dark" : "light";
    browserSettings.updateSetting("theme", newTheme);
  };

  // Get initial query from URL parameters and auto-search
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== searchQuery) {
      setSearchQuery(q);
      // Immediately perform search to show results
      handleSearch(q);
    }
  }, [searchParams]);

  // Also auto-search on component mount if query exists
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !results && !searchState.isSearching) {
      handleSearch(q);
    }
  }, []);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    const searchResults = await search(searchTerm);
    if (searchResults) {
      setResults(searchResults);
      // Update URL
      setSearchParams({ q: searchTerm });

      // Scroll to top when new results are loaded
      setTimeout(() => {
        const scrollArea = document.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (scrollArea) {
          scrollArea.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    } else {
      // Search failed, but error is already handled in the hook
      console.warn("Search returned no results due to network restrictions");
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleRefresh = () => {
    if (searchQuery) {
      handleSearch();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <ScrollArea className="h-full scroll-smooth">
        <div className="relative z-10 p-6 space-y-8 pb-20">
          {/* Modern Search Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-white/20 shadow-xl">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                AI Meta Search Engine
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Search across Wikipedia, Brave, DuckDuckGo, and Google with
              AI-powered semantic ranking
            </p>
          </div>

          {/* Enhanced Search Interface */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              {/* Glowing border effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

              <Card className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="p-6">
                  <form onSubmit={handleInputSubmit} className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <Search className="h-5 w-5 text-gray-400" />
                        {searchState.isSearching && (
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-1 h-1 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                          </div>
                        )}
                      </div>
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onPaste={(e) => {
                          // Handle paste events properly
                          const pastedText = e.clipboardData.getData("text");
                          if (pastedText) {
                            setSearchQuery(pastedText);
                            // Auto-search on paste if enabled
                            setTimeout(() => handleSearch(pastedText), 100);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Handle keyboard shortcuts
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearch();
                          } else if (e.key === "Escape") {
                            setSearchQuery("");
                          }
                        }}
                        placeholder="Enter your search query or paste text..."
                        className="pl-16 pr-32 h-16 text-lg bg-gray-50/50 dark:bg-slate-700/50 border-0 focus:ring-2 focus:ring-purple-500/50 rounded-xl"
                        disabled={searchState.isSearching}
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={searchState.isSearching || !searchQuery}
                          className="h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600"
                          title="Refresh Search"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${searchState.isSearching ? "animate-spin" : ""}`}
                          />
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            searchState.isSearching || !searchQuery.trim()
                          }
                          className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {searchState.isSearching ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Search className="h-4 w-4 mr-2" />
                          )}
                          Search
                        </Button>
                      </div>
                    </div>

                    {/* Search Features */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {settings.aiEnhanced && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 rounded-full">
                              <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              <span className="text-purple-600 dark:text-purple-400 font-medium">
                                AI Enhanced
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-full">
                            <Layers className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {getEnabledSourcesCount()} sources
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={toggleTheme}
                          className="rounded-lg border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                          title={`Switch to ${browserSettings.settings.theme === "light" ? "dark" : "light"} mode`}
                        >
                          {browserSettings.settings.theme === "light" ? (
                            <Moon className="h-4 w-4" />
                          ) : (
                            <Sun className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSettings(!showSettings)}
                          className="rounded-lg border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </form>

                  {/* Source Icons */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                    <div className="flex items-center justify-center gap-8 text-sm">
                      <div className="flex items-center gap-2 text-orange-600">
                        <BookOpen className="h-4 w-4" />
                        <span>Wikipedia</span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-700">
                        <Shield className="h-4 w-4" />
                        <span>Brave</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <Globe className="h-4 w-4" />
                        <span>DuckDuckGo</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Search className="h-4 w-4" />
                        <span>Google</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Status Information */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Processing</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {results
                      ? `${results.processingTime.toFixed(0)}ms`
                      : "Ready to search"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Results</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {results
                      ? `${results.totalResults} found`
                      : "No search yet"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertCircle
                      className={`h-4 w-4 ${canUseGoogle() ? "text-green-500" : "text-orange-500"}`}
                    />
                    <span className="font-medium">Google API</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {searchState.usageStats.google.remaining}/
                    {searchState.usageStats.google.limit} remaining
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Search Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Enhancement */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        AI Features
                      </Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <div>
                            <Label
                              htmlFor="ai-enhanced"
                              className="font-medium"
                            >
                              AI Enhanced Ranking
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Use semantic similarity for better results
                            </p>
                          </div>
                          <Switch
                            id="ai-enhanced"
                            checked={settings.aiEnhanced}
                            onCheckedChange={(checked) =>
                              updateSettings({ aiEnhanced: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <div>
                            <Label htmlFor="fallback" className="font-medium">
                              Auto Fallback
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Retry with other sources on failure
                            </p>
                          </div>
                          <Switch
                            id="fallback"
                            checked={settings.fallbackEnabled}
                            onCheckedChange={(checked) =>
                              updateSettings({ fallbackEnabled: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Search Sources */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        Search Sources
                      </Label>
                      <div className="space-y-3">
                        {Object.entries(settings.enabledSources).map(
                          ([source, enabled]) => (
                            <div
                              key={source}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {source === "wikipedia" && (
                                  <BookOpen className="h-4 w-4 text-orange-500" />
                                )}
                                {source === "brave" && (
                                  <Shield className="h-4 w-4 text-orange-600" />
                                )}
                                {source === "duckduckgo" && (
                                  <Globe className="h-4 w-4 text-green-500" />
                                )}
                                {source === "google" && (
                                  <Search className="h-4 w-4 text-blue-500" />
                                )}
                                <Label
                                  htmlFor={source}
                                  className="capitalize cursor-pointer font-medium"
                                >
                                  {source}
                                </Label>
                              </div>
                              <Switch
                                id={source}
                                checked={enabled}
                                onCheckedChange={(checked) =>
                                  updateSettings({
                                    enabledSources: {
                                      ...settings.enabledSources,
                                      [source]: checked,
                                    },
                                  })
                                }
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Usage Statistics */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      API Usage Statistics
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(searchState.usageStats).map(
                        ([source, stats]) => (
                          <div
                            key={source}
                            className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-lg"
                          >
                            <div className="font-medium capitalize text-sm text-gray-600 dark:text-gray-300">
                              {source}
                            </div>
                            <div className="text-2xl font-bold text-primary mt-1">
                              {"used" in stats ? stats.used : 0}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {"limit" in stats
                                ? `/ ${stats.limit}`
                                : "searches"}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Error */}
          {searchState.error && (
            <div className="max-w-4xl mx-auto">
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                        Network Restrictions
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                        Due to browser security policies (CORS), direct API
                        access to external search engines is limited. The search
                        results below will redirect you to the respective search
                        engines.
                      </p>
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        Error: {searchState.error}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Loading State */}
          {searchState.isSearching && (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                      <RefreshCw className="h-10 w-10 animate-spin text-white" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-2xl opacity-30 animate-ping"></div>
                  </div>
                  <h3 className="font-bold mb-3 text-xl bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                    Searching "{searchQuery}"
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    AI-enhanced search across {getEnabledSourcesCount()} sources
                  </p>

                  {/* Progress indicators */}
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <span className="text-orange-600">Wikipedia</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                      <span className="text-green-600">DuckDuckGo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce delay-200"></div>
                      <span className="text-orange-700">Brave</span>
                    </div>
                    {canUseGoogle() && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                        <span className="text-blue-600">Google</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    This may take a few seconds...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Results */}
          {results && (
            <div className="max-w-6xl mx-auto">
              <MetaSearchResults results={results} onNavigate={onNavigate} />
            </div>
          )}

          {/* Show direct search links if no results but have query */}
          {!results && !searchState.isSearching && searchQuery && (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Search "{searchQuery}"
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Click below to search on your preferred search engine
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
                          "_blank",
                        )
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search on Google
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(
                          `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`,
                          "_blank",
                        )
                      }
                      variant="outline"
                      className="w-full"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Search on DuckDuckGo
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(
                          `https://search.brave.com/search?q=${encodeURIComponent(searchQuery)}`,
                          "_blank",
                        )
                      }
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Search on Brave
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(
                          `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(searchQuery)}`,
                          "_blank",
                        )
                      }
                      className="w-full bg-slate-600 hover:bg-slate-700"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Search Wikipedia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Welcome State */}
          {!results && !searchState.isSearching && !searchQuery && (
            <div className="max-w-4xl mx-auto">
              <Card className="text-center py-16 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0">
                <CardContent>
                  <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to AI Meta Search
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                    Experience the future of search with AI-powered semantic
                    ranking across multiple search engines. Get the best results
                    from Wikipedia, Brave, DuckDuckGo, and Google in one unified
                    interface.
                  </p>
                  <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span>AI-powered ranking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Fast meta search</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-green-500" />
                      <span>Multiple sources</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
