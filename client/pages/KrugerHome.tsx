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
import StartupAnimation from "@/components/StartupAnimation";
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
  const [showStartupAnimation, setShowStartupAnimation] = useState(true);
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
            console.log("KrugerHome: Startup animation completed");
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
          {/* KrugerX Logo with Enhanced Chakra Effects */}
          <div className="mb-8 text-center animate-float relative">
            <div className="relative">
              {/* Enhanced Chakra aura behind logo */}
              <div className="absolute inset-0 text-7xl md:text-8xl font-bold text-cyan-400/20 blur-sm animate-chakra-pulse">
                KRUGERX
              </div>
              <div className="absolute inset-0 text-7xl md:text-8xl font-bold text-purple-400/20 blur-sm animate-chakra-pulse" style={{ animationDelay: "0.5s" }}>
                KRUGERX
              </div>
              <div className="relative text-7xl md:text-8xl font-bold text-white mb-4 text-gradient drop-shadow-2xl animate-glow">
                KRUGERX
              </div>
            </div>
            <div className="text-lg md:text-xl text-white/90 text-center font-light tracking-wider animate-fade-in">
              Next-Generation Privacy Browser
            </div>
            <div className="text-sm text-cyan-400/80 text-center font-medium tracking-wide mt-2 animate-pulse">
              Powered by AI • Built for Privacy
            </div>
          </div>

          {/* Modern Enhanced Search Bar */}
          <div className="w-full max-w-4xl mx-auto mb-8 relative">
            {/* Animated background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-400/20 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
            
            {/* Main search container */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              {/* Search Engine Selector */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-black/20 backdrop-blur-md rounded-2xl p-2 border border-white/10 shadow-xl">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedEngine("meta")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      selectedEngine === "meta"
                        ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-white shadow-lg transform scale-105"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    AI Meta Search
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedEngine("google")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      selectedEngine !== "meta"
                        ? "bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg transform scale-105"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Traditional Search
                  </Button>
                </div>
              </div>

              {/* Enhanced Search Input */}
              <div className="relative group">
                {/* Search icon */}
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                  <Search className="h-6 w-6 text-white/60 group-focus-within:text-cyan-400 transition-colors duration-300" />
                </div>

                {/* Main input */}
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
                  placeholder={
                    selectedEngine === "meta"
                      ? "Ask anything, search everything with AI..."
                      : "Search the web or enter URL..."
                  }
                  className="w-full h-16 pl-16 pr-40 text-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300"
                />

                {/* AI Enhanced indicator */}
                {selectedEngine === "meta" && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                      <Zap className="h-3 w-3" />
                      <span className="font-medium">AI Enhanced</span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 md:gap-3">
                  {/* Voice search button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleVoiceSearch}
                    className={`h-10 w-10 md:h-12 md:w-12 rounded-2xl transition-all duration-300 ${
                      voice.isListening
                        ? "bg-red-500/20 text-red-400 animate-pulse border-2 border-red-400/50"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-2 border-white/10"
                    } ${voice.confidence > 0.8 ? "text-green-400 bg-green-400/20" : ""}`}
                    disabled={!voice.isSupported}
                    title={
                      voice.isSupported
                        ? `Voice Search (${voice.language.split("-")[0].toUpperCase()})${voice.confidence > 0 ? ` - Confidence: ${Math.round(voice.confidence * 100)}%` : ""}`
                        : "Voice search not supported"
                    }
                  >
                    <Mic className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>

                  {/* Search button */}
                  <Button
                    onClick={() => handleSearch()}
                    disabled={!searchQuery.trim()}
                    className="h-10 px-6 md:h-12 md:px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none focus:ring-4 focus:ring-emerald-400/30"
                  >
                    <Search className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">GO</span>
                    <span className="sm:hidden">→</span>
                  </Button>
                </div>
              </div>

              {/* Search suggestions dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="mt-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        handleSearch(suggestion);
                      }}
                      className="w-full px-6 py-4 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center gap-3"
                    >
                      <Search className="h-4 w-4 text-white/50" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Search Engine Options (for traditional search) */}
              {selectedEngine !== "meta" && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex gap-3 flex-wrap justify-center">
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
                              ? "bg-white/20 text-white shadow-md border border-white/30"
                              : "text-white/70 hover:text-white hover:bg-white/10"
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
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center justify-center gap-8 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-orange-400" />
                      <span>Multi-Source</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span>Privacy-First</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      <span>AI-Powered</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Voice Recognition Status */}
          {voice.error && (
            <div className="absolute top-full left-0 right-0 mt-2 text-red-400 text-sm text-center bg-white/95 rounded-lg p-3 shadow-lg border border-red-200">
              {voice.error}
            </div>
          )}

          {voice.isListening && (
            <div className="absolute top-full left-0 right-0 mt-2 text-blue-600 text-sm text-center bg-white/95 rounded-lg p-3 animate-pulse shadow-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>
                  🎤 Listening in {voice.language.split("-")[0].toUpperCase()}
                  ...
                </span>
              </div>
              {voice.interimResults && (
                <div className="mt-2 text-gray-600 italic">
                  "{voice.interimResults}"
                </div>
              )}
              {voice.detectedCommand && (
                <div className="mt-1 text-green-600 font-medium">
                  Command detected: {voice.detectedCommand.replace("_", " ")}
                </div>
              )}
            </div>
          )}

          {voice.confidence > 0 && !voice.isListening && (
            <div className="absolute top-full left-0 right-0 mt-2 text-green-600 text-xs text-center bg-green-50 rounded-lg p-2 shadow-lg border border-green-200">
              Recognition confidence: {Math.round(voice.confidence * 100)}%
            </div>
          )}
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
