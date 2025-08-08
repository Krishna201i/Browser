import React from "react";
import { Search, Mic, Zap, Globe, BookOpen, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ModernSearchBarProps {
  searchQuery: string;
  selectedEngine: string;
  searchEngines: any[];
  voice: any;
  onSearchQueryChange: (query: string) => void;
  onEngineChange: (engine: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onSearch: () => void;
  onVoiceSearch: () => void;
}

export default function ModernSearchBar({
  searchQuery,
  selectedEngine,
  searchEngines,
  voice,
  onSearchQueryChange,
  onEngineChange,
  onKeyPress,
  onFocus,
  onSearch,
  onVoiceSearch,
}: ModernSearchBarProps) {
  return (
    <div className="w-full max-w-5xl mb-6 space-y-6">
      {/* Search Mode Selector */}
      <div className="flex justify-center">
        <div className="inline-flex bg-black/20 backdrop-blur-md rounded-2xl p-2 border border-white/10 shadow-2xl">
          <Button
            onClick={() => onEngineChange("meta")}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              selectedEngine === "meta"
                ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-white shadow-lg transform scale-105"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Zap className="h-5 w-5 mr-2" />
            AI Meta Search
          </Button>
          <Button
            onClick={() => onEngineChange("google")}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              selectedEngine !== "meta"
                ? "bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg transform scale-105"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Globe className="h-5 w-5 mr-2" />
            Traditional Search
          </Button>
        </div>
      </div>

      {/* Modern Search Card */}
      <div className="relative group">
        {/* Animated background glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-pink-400/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-700 animate-pulse"></div>

        <div className="relative">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Search Input Section */}
            <div className="relative">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                <Search className="h-6 w-6 text-white/60" />
              </div>

              <Input
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyPress={onKeyPress}
                onFocus={onFocus}
                placeholder={
                  selectedEngine === "meta"
                    ? "Ask anything, search everything..."
                    : "Search the web or enter URL..."
                }
                className="w-full h-20 pl-16 pr-32 text-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300"
              />

              {/* Action Buttons */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onVoiceSearch}
                  className={`h-14 w-14 rounded-2xl transition-all duration-300 ${
                    voice.isListening
                      ? "bg-red-500/20 text-red-400 animate-pulse border-2 border-red-400/50"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-2 border-white/10"
                  }`}
                  disabled={!voice.isSupported}
                  title="Voice Search"
                >
                  <Mic className="h-6 w-6" />
                </Button>

                <Button
                  onClick={onSearch}
                  disabled={!searchQuery.trim()}
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  <Search className="h-5 w-5 mr-2" />
                  GO
                </Button>
              </div>
            </div>

            {/* Search Features Indicator */}
            <div className="mt-6 pt-6 border-t border-white/10">
              {selectedEngine === "meta" ? (
                <div className="flex items-center justify-center gap-8">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">AI Enhanced</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-100"></div>
                    <span className="text-sm font-medium">Multi-Source</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                    <span className="text-sm font-medium">Smart Ranking</span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap justify-center">
                  {searchEngines
                    .filter((engine) => engine.id !== "meta")
                    .map((engine) => (
                      <Button
                        key={engine.id}
                        size="sm"
                        onClick={() => onEngineChange(engine.id)}
                        className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                          selectedEngine === engine.id
                            ? "bg-white/20 text-white border-2 border-white/30 shadow-lg"
                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-2 border-white/10"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${engine.color} mr-2`}
                        ></div>
                        {engine.name}
                      </Button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
