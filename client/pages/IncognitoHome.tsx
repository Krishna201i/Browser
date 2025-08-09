import * as React from "react";
import { useState, useEffect } from "react";
import {
  Search,
  Mic,
  Eye,
  Shield,
  Lock,
  Trash2,
  Clock,
  Globe,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { useMetaSearch } from "@/hooks/use-meta-search";

interface IncognitoHomeProps {
  onSearch: (query: string, searchEngine?: string) => void;
}

export default function IncognitoHome({ onSearch }: IncognitoHomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const voice = useVoiceRecognition();
  const { settings, updateSettings } = useMetaSearch();
  const selectedEngine = settings.selectedEngine;
  const setSelectedEngine = (engine: string) => updateSettings({ selectedEngine: engine });

  const quickLinks = [
    { name: "ProtonMail", url: "https://protonmail.com", icon: "📧" },
    { name: "Signal", url: "https://signal.org", icon: "💬" },
    { name: "Tor Project", url: "https://torproject.org", icon: "🧅" },
    { name: "Privacy Tools", url: "https://privacytools.io", icon: "🔒" },
  ];

  useEffect(() => {
    if (voice.transcript && !voice.isListening) {
      setSearchQuery(voice.transcript);
      handleSearch(voice.transcript);
      voice.resetTranscript();
    }
  }, [voice.transcript, voice.isListening]);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      onSearch(query, selectedEngine);
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-white">
        {/* Incognito Logo */}
        <div className="mb-8 text-center animate-float">
          <Eye className="h-20 w-20 mx-auto mb-4 text-purple-400 animate-pulse" />
          <div className="text-6xl font-bold mb-2 text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-glow">
            KRUGERX
          </div>
          <div className="text-xl text-purple-300 font-light tracking-wider animate-fade-in">
            Private Browsing Mode
          </div>
          <div className="text-sm text-red-400/80 mt-2 animate-pulse">
            🔒 Enhanced Privacy Protection
          </div>
        </div>



        {/* Modern Enhanced Search Bar for Incognito */}
        <div className="w-full max-w-4xl mx-auto mb-8 relative">
          {/* Animated background glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-red-400/20 via-purple-500/20 to-pink-400/20 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
          
          {/* Main search container */}
          <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            {/* Search Engine Selector */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-black/40 backdrop-blur-md rounded-2xl p-2 border border-white/10 shadow-xl">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedEngine("meta")}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedEngine === "meta"
                      ? "bg-gradient-to-r from-red-400 to-purple-500 text-white shadow-lg transform scale-105"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Private AI Search
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedEngine("google")}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedEngine !== "meta"
                      ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg transform scale-105"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Private Search
                </Button>
              </div>
            </div>

            {/* Enhanced Search Input */}
            <div className="relative group">
              {/* Search icon */}
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                <Search className="h-6 w-6 text-white/60 group-focus-within:text-red-400 transition-colors duration-300" />
              </div>

              {/* Main input */}
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search privately or enter URL..."
                className="w-full h-16 pl-16 pr-40 text-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:border-red-400/50 focus:ring-4 focus:ring-red-400/20 transition-all duration-300"
              />

              {/* Private indicator */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
                  <Shield className="h-3 w-3" />
                  <span className="font-medium">Private</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
                {/* Voice search button */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleVoiceSearch}
                  className={`h-12 w-12 rounded-2xl transition-all duration-300 ${
                    voice.isListening
                      ? "bg-red-500/20 text-red-400 animate-pulse border-2 border-red-400/50"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-2 border-white/10"
                  }`}
                  disabled={!voice.isSupported}
                  title="Private Voice Search"
                >
                  <Mic className="h-5 w-5" />
                </Button>

                {/* Search button */}
                <Button
                  onClick={() => handleSearch()}
                  disabled={!searchQuery.trim()}
                  className="h-12 px-8 rounded-2xl bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  <Search className="h-5 w-5 mr-2" />
                  GO
                </Button>
              </div>
            </div>

            {/* Privacy Features */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-center gap-8 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-400" />
                  <span>No Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-400" />
                  <span>VPN Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-pink-400" />
                  <span>Private Mode</span>
                </div>
              </div>
            </div>

            {/* Voice feedback */}
            {voice.error && (
              <div className="mt-4 text-red-400 text-sm text-center bg-red-400/10 rounded-lg p-2">
                {voice.error}
              </div>
            )}

            {voice.isListening && (
              <div className="mt-4 text-purple-300 text-sm text-center animate-pulse bg-purple-400/10 rounded-lg p-2">
                🎤 Listening... Speak now
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="w-full max-w-4xl">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Privacy-Focused Sites
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Button
                key={link.name}
                variant="outline"
                onClick={() => onSearch(link.url)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">{link.icon}</span>
                <span className="text-sm">{link.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 text-center text-gray-400 text-xs max-w-2xl">
          <p>
            Incognito mode prevents Kruger from saving your browsing history,
            cookies, and site data. Your activity might still be visible to your
            employer, school, or internet service provider.
          </p>
        </div>
      </div>
    </div>
  );
}
