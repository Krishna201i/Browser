import React from "react";
import { Search, Mic, Zap, Globe, BookOpen, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SimpleSearchInterfaceProps {
  searchQuery: string;
  selectedEngine: string;
  searchEngines: any[];
  voice: any;
  showSuggestions: boolean;
  searchSuggestions: string[];
  onSearchQueryChange: (query: string) => void;
  onEngineChange: (engine: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onSearch: () => void;
  onVoiceSearch: () => void;
  onSuggestionClick: (suggestion: string) => void;
}

export default function SimpleSearchInterface({
  searchQuery,
  selectedEngine,
  searchEngines,
  voice,
  showSuggestions,
  searchSuggestions,
  onSearchQueryChange,
  onEngineChange,
  onKeyPress,
  onFocus,
  onSearch,
  onVoiceSearch,
  onSuggestionClick,
}: SimpleSearchInterfaceProps) {
  return (
    <div className="w-full max-w-3xl mb-6">
      {/* Simple Search Engine Tabs */}
      <div className="mb-4">
        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            size="sm"
            variant={selectedEngine === "meta" ? "default" : "outline"}
            onClick={() => onEngineChange("meta")}
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
            onClick={() => onEngineChange("google")}
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

      {/* Simple Search Bar with Homepage Theme */}
      <div className="w-full max-w-2xl mx-auto mb-6 relative">
        <div className="search-bar rounded-full p-3 flex items-center gap-3 shadow-2xl bg-black/30 backdrop-blur-md border border-purple-500/30">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyPress={onKeyPress}
            onFocus={onFocus}
            placeholder={
              selectedEngine === "meta"
                ? "Search with AI across multiple engines..."
                : "Search the web or enter URL..."
            }
            className="flex-1 border-0 bg-transparent focus:ring-0 text-lg placeholder:text-white/50 text-white"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={onVoiceSearch}
            className={`text-white hover:text-purple-400 transition-colors ${
              voice.isListening
                ? "text-red-400 animate-pulse bg-red-500/20"
                : ""
            } ${voice.confidence > 0.8 ? "text-green-400" : ""}`}
            disabled={!voice.isSupported}
            title={
              voice.isSupported
                ? `Advanced Voice Search (${voice.language.split("-")[0].toUpperCase()})${voice.confidence > 0 ? ` - Confidence: ${Math.round(voice.confidence * 100)}%` : ""}`
                : "Voice search not supported"
            }
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            onClick={onSearch}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-full shadow-lg"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur-md rounded-lg shadow-xl border border-purple-500/30 max-h-48 overflow-y-auto z-50">
            {searchSuggestions.slice(0, 6).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-purple-600/30 flex items-center gap-3 border-b border-purple-500/20 last:border-b-0 text-white"
              >
                <Search className="h-4 w-4 text-purple-400" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        {/* Search Engine Options (for traditional search) */}
        {selectedEngine !== "meta" && (
          <div className="mt-4">
            <div className="flex gap-2 flex-wrap justify-center">
              {searchEngines
                .filter((engine) => engine.id !== "meta")
                .map((engine) => (
                  <Button
                    key={engine.id}
                    size="sm"
                    variant="ghost"
                    onClick={() => onEngineChange(engine.id)}
                    className={`rounded-full px-4 py-2 transition-all duration-200 ${
                      selectedEngine === engine.id
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-white/70 hover:text-white hover:bg-white/20"
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
          <div className="mt-4">
            <div className="flex items-center justify-center gap-8 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-400" />
                <span>Wikipedia</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span>Brave</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-400" />
                <span>DuckDuckGo</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-400" />
                <span>Google</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
