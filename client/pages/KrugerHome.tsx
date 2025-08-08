import * as React from "react";
import { useState, useEffect } from "react";
import {
  Search,
  Mic,
  Shield,
  Clock,
  Zap,
  TrendingUp,
  Users,
  Globe,
  History,
  Bookmark,
  Grid3x3,
  X,
  Star,
  BookOpen,
} from "lucide-react";
// import StartupAnimation from "@/components/StartupAnimation";
// import AuthDialog from "@/components/AuthDialog";
// import InteractiveVPN from "@/components/InteractiveVPN";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { useRealStats } from "@/hooks/use-real-stats";
import { useMostVisited } from "@/hooks/use-most-visited";
import { useMetaSearch } from "@/hooks/use-meta-search";
import { useVPN } from "@/hooks/use-vpn";
import { useAuth } from "@/hooks/use-auth";
import { useWidgets } from "@/hooks/use-widgets";
import DynamicBackground from "@/components/DynamicBackground";

interface KrugerHomeProps {
  onSearch: (query: string, searchEngine?: string) => void;
}

export default function KrugerHome({ onSearch }: KrugerHomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quickAccessOpen, setQuickAccessOpen] = useState(false);
  const [backgroundVariant] = useState<"matrix">("matrix");
  const [showStartupAnimation, setShowStartupAnimation] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const voice = useVoiceRecognition();
  const { stats, addSiteVisited, addSearchPerformed, startSession } =
    useRealStats();
  const { mostVisited, addVisit, removeSite } = useMostVisited();
  const { selectedEngine, setSelectedEngine, searchEngines } = useMetaSearch();
  const { settings: vpnSettings, toggleConnection, isConnecting } = useVPN();
  const { isAuthenticated, user, signInWithEmail } = useAuth();
  const widgets = useWidgets();

  const quickActions = [
    { name: "Latest News", icon: "📰", url: "https://news.google.com" },
    { name: "Weather", icon: "🌤️", url: "https://weather.com" },
    { name: "Gmail", icon: "📧", url: "https://gmail.com" },
    { name: "YouTube", icon: "📺", url: "https://youtube.com" },
    { name: "GitHub", icon: "💻", url: "https://github.com" },
    { name: "Stack Overflow", icon: "���", url: "https://stackoverflow.com" },
  ];

  // Initialize session on component mount
  useEffect(() => {
    startSession();
  }, [startSession]);

  // Matrix theme is now permanent - no cycling

  // Advanced voice recognition effect
  useEffect(() => {
    if (voice.transcript && !voice.isListening) {
      // Handle voice commands
      if (voice.detectedCommand) {
        switch (voice.detectedCommand) {
          case "new_tab":
            // Could trigger new tab creation
            break;
          case "incognito":
            // Could trigger incognito tab
            break;
          case "settings":
            // Could open settings
            break;
          case "close":
            // Could close current tab
            break;
          case "search":
          case "open":
          default:
            // Extract search query (remove command words)
            let searchQuery = voice.transcript
              .replace(
                /^(search|find|look for|google|open|go to|visit)\s+/i,
                "",
              )
              .trim();
            if (searchQuery) {
              setSearchQuery(searchQuery);
              handleSearch(searchQuery);
            }
            break;
        }
      } else {
        // No command detected, treat as search
        setSearchQuery(voice.transcript);
        handleSearch(voice.transcript);
      }
      voice.resetTranscript();
    }
  }, [voice.transcript, voice.isListening, voice.detectedCommand]);

  // Search suggestions
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length > 2) {
      const suggestions = [
        `${searchQuery} tutorial`,
        `${searchQuery} news`,
        `${searchQuery} reviews`,
        `${searchQuery} 2024`,
        `${searchQuery} guide`,
        `how to ${searchQuery}`,
        `${searchQuery} vs`,
        `best ${searchQuery}`,
      ];
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      // Track the search
      addSearchPerformed();

      // Check if it's a URL (site visit) or search query
      const isUrl = /^https?:\/\//.test(query) || /^\w+\.\w+/.test(query);
      if (isUrl) {
        addSiteVisited(); // Track as site visit
      }

      onSearch(query, selectedEngine);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleVoiceSearch = async () => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      await voice.startListening();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleQuickAction = (url: string) => {
    // Track site visit for quick actions
    addSiteVisited();
    onSearch(url);
  };

  return (
    <>
      {/* Startup Animation */}
      {showStartupAnimation && (
        <StartupAnimation
          onComplete={() => {
            console.log("KrugerHome: Received onComplete, hiding animation");
            setShowStartupAnimation(false);
          }}
        />
      )}

      {/* Auth Dialog */}
      {/* <AuthDialog isOpen={authDialogOpen} onOpenChange={setAuthDialogOpen} /> */}

      <div className="min-h-screen relative overflow-hidden">
        {/* Dynamic Background - Changes every 30 seconds */}
        <DynamicBackground
          variant={backgroundVariant}
          intensity="high"
          isActive={true}
        />

        {/* Top Action Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          {/* Quick Access Button - Moved to top-left */}
          <div className="flex gap-2">
            <Sheet open={quickAccessOpen} onOpenChange={setQuickAccessOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-4 py-2"
                  size="sm"
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Quick Access
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[500px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Grid3x3 className="h-5 w-5" />
                    Quick Access
                  </SheetTitle>
                  <SheetDescription>
                    Access your favorite websites and most visited sites
                  </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="favorites" className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="favorites"
                      className="flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Favorites
                    </TabsTrigger>
                    <TabsTrigger
                      value="most-visited"
                      className="flex items-center gap-2"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Most Visited
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="favorites" className="mt-4">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {quickActions.map((action) => (
                        <Button
                          key={action.name}
                          variant="outline"
                          onClick={() => {
                            handleQuickAction(action.url);
                            setQuickAccessOpen(false);
                          }}
                          className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted"
                        >
                          <span className="text-2xl">{action.icon}</span>
                          <span className="text-sm text-center">
                            {action.name}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="most-visited" className="mt-4">
                    {mostVisited.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                        {mostVisited.map((site) => (
                          <div
                            key={site.id}
                            className="group relative p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer"
                            onClick={() => {
                              handleQuickAction(site.url);
                              setQuickAccessOpen(false);
                            }}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSite(site.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="flex flex-col items-center gap-2">
                              <img
                                src={site.favicon}
                                alt={site.title}
                                className="w-8 h-8 rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://www.google.com/s2/favicons?domain=example.com&sz=32`;
                                }}
                              />
                              <div className="text-xs text-center">
                                <div
                                  className="font-medium truncate max-w-full"
                                  title={site.title}
                                >
                                  {site.title}
                                </div>
                                <div className="text-muted-foreground mt-1">
                                  {site.visitCount} visits
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No visited sites yet</p>
                        <p className="text-sm">
                          Start browsing to see your most visited sites here
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex gap-2">
            {/* Enhanced Auth Button */}
            {/* {!isAuthenticated ? (
              <Button
                onClick={() => setAuthDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
                size="sm"
              >
                🔐 Sign In
              </Button>
            ) : (
              <div className="bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 text-white/80 text-xs font-medium flex items-center gap-2 border border-white/10">
                👤 {user?.name}
              </div>
            )} */}

            {/* Interactive VPN */}
            {/* <InteractiveVPN /> */}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          {/* Kruger Logo with Chakra Effects */}
          <div className="mb-8 text-center animate-float relative">
            <div className="relative">
              {/* Chakra aura behind logo */}
              <div className="absolute inset-0 text-7xl md:text-8xl font-bold text-cyan-400/30 blur-sm animate-chakra-pulse">
                KRUGER
              </div>
              <div className="relative text-7xl md:text-8xl font-bold text-white mb-4 text-gradient drop-shadow-2xl">
                KRUGER
              </div>
            </div>
            <div className="text-lg md:text-xl text-white/90 text-center font-light tracking-wider">
              Privacy-First Browser
            </div>
          </div>

          {/* Enhanced Search Interface */}
          <div className="w-full max-w-3xl mb-6">
            {/* Simple Search Engine Tabs */}
            <div className="mb-4">
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  size="sm"
                  variant={selectedEngine === "meta" ? "default" : "outline"}
                  onClick={() => setSelectedEngine("meta")}
                  className={`${
                    selectedEngine === "meta"
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  }`}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  AI Meta Search
                </Button>
                <Button
                  size="sm"
                  variant={selectedEngine !== "meta" ? "default" : "outline"}
                  onClick={() => setSelectedEngine("google")}
                  className={`${
                    selectedEngine !== "meta"
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  }`}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Traditional Search
                </Button>
              </div>
            </div>

            {/* Enhanced Search Bar with Modern Design */}
            <div className="w-full max-w-5xl mx-auto mb-8 relative group">
              {/* Background gradient glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

              {/* Animated border gradient */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-sm transition-all duration-500"></div>

              <div className="relative search-bar-glass rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] sm:p-4">
                {/* Search Input Section */}
                <div className="flex items-center gap-4">
                  {/* Search Icon */}
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl">
                    <Search className="h-6 w-6 text-white/90" />
                  </div>

                  {/* Input Field */}
                  <div className="flex-1 relative">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() =>
                        setShowSuggestions(searchSuggestions.length > 0)
                      }
                      placeholder={
                        selectedEngine === "meta"
                          ? "Search with AI across multiple engines..."
                          : "Search the web or enter URL..."
                      }
                      className="text-xl h-16 px-6 border-0 bg-white/5 rounded-2xl focus:bg-white/10 focus:ring-2 focus:ring-purple-400/50 placeholder:text-white/50 text-white font-medium transition-all duration-300 backdrop-blur-sm"
                    />

                    {/* AI Enhancement Badge */}
                    {selectedEngine === "meta" && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-xs text-white font-medium shadow-lg">
                          <Zap className="h-3 w-3 animate-pulse" />
                          <span>AI Enhanced</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {/* Voice Search Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleVoiceSearch}
                      className={`h-14 w-14 rounded-2xl transition-all duration-300 border-2 ${
                        voice.isListening
                          ? "text-red-400 animate-pulse bg-red-500/20 border-red-400/50 shadow-lg shadow-red-500/25"
                          : "text-white/80 hover:text-white hover:bg-white/10 border-white/20 hover:border-white/40"
                      } ${voice.confidence > 0.8 ? "text-green-400 bg-green-500/20 border-green-400/50" : ""}`}
                      disabled={!voice.isSupported}
                      title={
                        voice.isSupported
                          ? `Advanced Voice Search (${voice.language.split("-")[0].toUpperCase()})${voice.confidence > 0 ? ` - Confidence: ${Math.round(voice.confidence * 100)}%` : ""}`
                          : "Voice search not supported"
                      }
                    >
                      <Mic className="h-6 w-6" />
                    </Button>

                    {/* Search Button */}
                    <Button
                      onClick={() => handleSearch()}
                      className={`h-14 px-8 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-300 transform ${
                        searchQuery.trim()
                          ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 border-0"
                          : "bg-white/10 text-white/50 border border-white/20 cursor-not-allowed"
                      }`}
                      disabled={!searchQuery.trim()}
                    >
                      <Search className="h-5 w-5 mr-3" />
                      Search
                    </Button>
                  </div>
                </div>

                {/* Search Engine Pills */}
                {selectedEngine !== "meta" && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex gap-2 flex-wrap justify-center">
                      {searchEngines
                        .filter((engine) => engine.id !== "meta")
                        .map((engine) => (
                          <Button
                            key={engine.id}
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEngine(engine.id)}
                            className={`rounded-full px-4 py-2 transition-all duration-200 border ${
                              selectedEngine === engine.id
                                ? "bg-white/20 text-white border-white/40 shadow-lg"
                                : "text-white/70 hover:text-white hover:bg-white/10 border-white/20 hover:border-white/30"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${engine.color} mr-2 opacity-80`}
                            ></div>
                            {engine.name}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}

                {/* AI Search Sources */}
                {selectedEngine === "meta" && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                        <BookOpen className="h-4 w-4 text-orange-400" />
                        <span>Wikipedia</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                        <Shield className="h-4 w-4 text-orange-500" />
                        <span>Brave</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                        <Globe className="h-4 w-4 text-green-400" />
                        <span>DuckDuckGo</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                        <Search className="h-4 w-4 text-blue-400" />
                        <span>Google</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Engine Options (for traditional search) */}
                {selectedEngine !== "meta" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2 flex-wrap justify-center">
                      {searchEngines
                        .filter((engine) => engine.id !== "meta")
                        .map((engine) => (
                          <Button
                            key={engine.id}
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEngine(engine.id)}
                            className={`rounded-full px-4 py-2 transition-all duration-200 ${
                              selectedEngine === engine.id
                                ? "bg-gray-900 text-white shadow-md"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${engine.color} mr-2`}
                            ></div>
                            {engine.name}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}

                {/* AI Search Features (for meta search) */}
                {selectedEngine === "meta" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-orange-500" />
                        <span>Wikipedia</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-orange-600" />
                        <span>Brave</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        <span>DuckDuckGo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-blue-500" />
                        <span>Google</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 max-h-64 overflow-y-auto z-50">
                {searchSuggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full text-left px-6 py-4 hover:bg-white/10 flex items-center gap-4 border-b border-white/10 last:border-b-0 transition-all duration-200 group"
                  >
                    <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                      <Search className="h-4 w-4 text-white/70 group-hover:text-white" />
                    </div>
                    <span className="text-white/80 group-hover:text-white font-medium">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Enhanced Voice Recognition Status */}
            {voice.error && (
              <div className="absolute top-full left-0 right-0 mt-4 text-red-300 text-sm text-center bg-red-500/20 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-red-400/30">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">{voice.error}</span>
                </div>
              </div>
            )}

            {voice.isListening && (
              <div className="absolute top-full left-0 right-0 mt-4 text-white text-sm text-center bg-blue-500/20 backdrop-blur-xl rounded-2xl p-4 animate-pulse shadow-xl border border-blue-400/30">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-30"></div>
                  </div>
                  <span className="font-medium">
                    🎤 Listening in {voice.language.split("-")[0].toUpperCase()}
                    ...
                  </span>
                </div>
                {voice.interimResults && (
                  <div className="mt-3 text-white/80 italic font-medium bg-white/10 rounded-xl p-2">
                    "{voice.interimResults}"
                  </div>
                )}
                {voice.detectedCommand && (
                  <div className="mt-2 text-green-300 font-semibold bg-green-500/20 rounded-xl p-2">
                    Command detected: {voice.detectedCommand.replace("_", " ")}
                  </div>
                )}
              </div>
            )}

            {voice.confidence > 0 && !voice.isListening && (
              <div className="absolute top-full left-0 right-0 mt-4 text-green-300 text-sm text-center bg-green-500/20 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-green-400/30">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-medium">Recognition confidence: {Math.round(voice.confidence * 100)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Real-time Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-6xl mb-8">
            {/* Trackers Blocked Card */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl border border-red-300/20 hover:border-red-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 backdrop-blur-sm mb-3 group-hover:bg-red-500/30 transition-colors duration-300">
                  <Shield className="h-6 w-6 text-red-400 group-hover:text-red-300 transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-red-100 transition-colors duration-300">
                  {stats.trackersBlocked.toLocaleString()}
                </div>
                <div className="text-xs text-red-200/80 font-medium uppercase tracking-wider">
                  Trackers Blocked
                </div>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Bandwidth Saved Card */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-xl border border-emerald-300/20 hover:border-emerald-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 backdrop-blur-sm mb-3 group-hover:bg-emerald-500/30 transition-colors duration-300">
                  <Zap className="h-6 w-6 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-100 transition-colors duration-300">
                  {stats.bandwidthSaved}
                </div>
                <div className="text-xs text-emerald-200/80 font-medium uppercase tracking-wider">
                  Bandwidth Saved
                </div>
                <div
                  className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>
            </div>

            {/* Time Saved Card */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-300/20 hover:border-blue-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 backdrop-blur-sm mb-3 group-hover:bg-blue-500/30 transition-colors duration-300">
                  <Clock className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">
                  {stats.timeSaved}
                </div>
                <div className="text-xs text-blue-200/80 font-medium uppercase tracking-wider">
                  Time Saved
                </div>
                <div
                  className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl border border-purple-300/20 hover:border-purple-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 backdrop-blur-sm mb-3 group-hover:bg-purple-500/30 transition-colors duration-300">
                  <Users className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors duration-300">
                  {stats.activeUsers.toLocaleString()}
                </div>
                <div className="text-xs text-purple-200/80 font-medium uppercase tracking-wider">
                  Active Users
                </div>
                <div
                  className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
                  style={{ animationDelay: "1.5s" }}
                ></div>
              </div>
            </div>

            {/* Sites Visited Card */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl border border-orange-300/20 hover:border-orange-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 backdrop-blur-sm mb-3 group-hover:bg-orange-500/30 transition-colors duration-300">
                  <Globe className="h-6 w-6 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-orange-100 transition-colors duration-300">
                  {stats.sitesVisited.toLocaleString()}
                </div>
                <div className="text-xs text-orange-200/80 font-medium uppercase tracking-wider">
                  Sites Visited
                </div>
                <div
                  className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"
                  style={{ animationDelay: "2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Name - Bottom Left Corner */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 text-white/80 text-xs font-medium animate-pulse">
            🌐{" "}
            {backgroundVariant.charAt(0).toUpperCase() +
              backgroundVariant.slice(1)}{" "}
            Theme
          </div>
        </div>
      </div>
    </>
  );
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
