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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { useSearchEngine } from "@/hooks/use-search-engine";

interface IncognitoHomeProps {
  onSearch: (query: string, searchEngine?: string) => void;
}

export default function IncognitoHome({ onSearch }: IncognitoHomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const voice = useVoiceRecognition();
  const { selectedEngine, setSelectedEngine, searchEngines } =
    useSearchEngine();

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
          <Eye className="h-20 w-20 mx-auto mb-4 text-purple-400" />
          <div className="text-6xl font-bold mb-2 text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            KRUGER
          </div>
          <div className="text-xl text-purple-300 font-light tracking-wider">
            Private Browsing Mode
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Your activity won't be saved to this device
          </div>
        </div>

        {/* Search Engine Selector */}
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap justify-center">
            {searchEngines.map((engine) => (
              <Button
                key={engine.id}
                size="sm"
                variant={selectedEngine === engine.id ? "default" : "outline"}
                onClick={() => setSelectedEngine(engine.id)}
                className={`${
                  selectedEngine === engine.id
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
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

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-black/30 backdrop-blur-xl rounded-full p-3 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search privately or enter URL..."
                className="flex-1 border-0 bg-transparent focus:ring-0 text-white placeholder:text-gray-400 text-lg"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleVoiceSearch}
                className={`text-white hover:bg-white/20 ${
                  voice.isListening ? "bg-red-500/50 animate-pulse" : ""
                }`}
                disabled={!voice.isSupported}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                onClick={() => handleSearch()}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {voice.error && (
            <div className="text-red-400 text-sm mt-2 text-center">
              {voice.error}
            </div>
          )}

          {voice.isListening && (
            <div className="text-purple-300 text-sm mt-2 text-center animate-pulse">
              Listening... Speak now
            </div>
          )}
        </div>

        {/* Privacy Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
          <Card className="bg-black/30 backdrop-blur-xl border-white/20">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Protected
              </h3>
              <p className="text-gray-300 text-sm">
                Trackers and ads blocked automatically
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-xl border-white/20">
            <CardContent className="p-6 text-center">
              <Lock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Encrypted
              </h3>
              <p className="text-gray-300 text-sm">
                All connections secured with HTTPS
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-xl border-white/20">
            <CardContent className="p-6 text-center">
              <Trash2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No History
              </h3>
              <p className="text-gray-300 text-sm">
                Data deleted when tab is closed
              </p>
            </CardContent>
          </Card>
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
