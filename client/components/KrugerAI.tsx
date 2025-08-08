import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Zap,
  Search,
  Globe,
  Shield,
  Code,
  BookOpen,
  Calculator,
  Clock,
  MapPin,
  TrendingUp,
  MessageCircle,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  thinking?: boolean;
  suggestions?: string[];
  actions?: Array<{
    type: "search" | "navigate" | "bookmark" | "settings";
    label: string;
    value: string;
  }>;
}

interface KrugerAIProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearch?: (query: string) => void;
  onNavigate?: (url: string) => void;
  onBookmark?: () => void;
}

export default function KrugerAI({
  isOpen,
  onOpenChange,
  onSearch,
  onNavigate,
  onBookmark,
}: KrugerAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      type: "ai",
      content: `🥷 **Kruger AI** at your service!\n\nI'm your advanced AI assistant built with ninja-like precision. I can help you with:\n\n• **Web Search & Navigation** - Find anything on the internet\n• **Privacy & Security** - Keep your browsing safe\n• **Bookmark Management** - Organize your favorite sites\n• **Browser Controls** - Voice commands and shortcuts\n• **General Knowledge** - Ask me anything!\n\nTry saying "Search for React tutorials" or "What's the weather like?" to get started.`,
      timestamp: new Date(),
      suggestions: [
        "Search for React tutorials",
        "What can you help me with?",
        "Search for something",
        "Show me voice commands",
        "What's the time?",
        "Navigate to GitHub",
      ],
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    // Simulate AI thinking
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    const lowerMessage = userMessage.toLowerCase();

    // Search queries
    if (
      lowerMessage.includes("search") ||
      lowerMessage.includes("find") ||
      lowerMessage.includes("look for")
    ) {
      const searchQuery = userMessage.replace(
        /^(search for?|find|look for)\s*/i,
        "",
      );
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `🔍 I'll search for "${searchQuery}" using our AI-enhanced meta search engine. This combines results from Wikipedia, Brave, DuckDuckGo, and Google with semantic ranking for the best results.`,
        timestamp: new Date(),
        actions: [
          {
            type: "search",
            label: `Search: ${searchQuery}`,
            value: searchQuery,
          },
        ],
        suggestions: [
          "Refine this search",
          "Use AI-enhanced ranking",
          "Search specific sources",
          "Get meta search tips",
        ],
      };
    }

    // Navigation commands
    if (
      lowerMessage.includes("go to") ||
      lowerMessage.includes("navigate") ||
      lowerMessage.includes("open")
    ) {
      const site = userMessage.replace(/^(go to|navigate to|open)\s*/i, "");
      let url = site;

      // Handle common site shortcuts
      const shortcuts: { [key: string]: string } = {
        github: "https://github.com",
        youtube: "https://youtube.com",
        gmail: "https://gmail.com",
        google: "https://google.com",
        facebook: "https://facebook.com",
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
        reddit: "https://reddit.com",
        stackoverflow: "https://stackoverflow.com",
      };

      if (shortcuts[site.toLowerCase()]) {
        url = shortcuts[site.toLowerCase()];
      } else if (!site.includes("http") && !site.includes(".")) {
        url = `https://${site}.com`;
      } else if (!site.includes("http")) {
        url = `https://${site}`;
      }

      return {
        id: Date.now().toString(),
        type: "ai",
        content: `🚀 I'll navigate you to **${site}**. This site will open in your current tab with all Kruger's privacy protections active.`,
        timestamp: new Date(),
        actions: [
          {
            type: "navigate",
            label: `Open ${site}`,
            value: url,
          },
        ],
        suggestions: [
          "Bookmark this site",
          "Check site security",
          "Search within this site",
        ],
      };
    }

    // Bookmark commands
    if (
      lowerMessage.includes("bookmark") ||
      lowerMessage.includes("save this page")
    ) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `📚 I'll help you bookmark the current page. Your bookmarks are organized intelligently and synced securely across your devices.`,
        timestamp: new Date(),
        actions: [
          {
            type: "bookmark",
            label: "Bookmark Current Page",
            value: "current",
          },
        ],
        suggestions: [
          "Organize my bookmarks",
          "Show favorite bookmarks",
          "Create bookmark folder",
        ],
      };
    }

    // Privacy and security questions
    if (
      lowerMessage.includes("privacy") ||
      lowerMessage.includes("security") ||
      lowerMessage.includes("safe")
    ) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `🛡️ **Kruger Security Features:**\n\n• **Tracker Blocking** - Automatically blocks 99% of trackers\n• **HTTPS Everywhere** - Forces secure connections\n• **No Logging** - Your browsing history stays private\n• **Fingerprint Protection** - Prevents browser fingerprinting\n• **Ad Blocking** - Built-in ad blocker saves bandwidth\n\nYour privacy is my top priority. All data is processed locally when possible.`,
        timestamp: new Date(),
        actions: [
          {
            type: "settings",
            label: "Open Privacy Settings",
            value: "privacy",
          },
        ],
        suggestions: [
          "Check current security status",
          "Enable incognito mode",
          "Review permissions",
        ],
      };
    }

    // Weather queries
    if (lowerMessage.includes("weather")) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `🌤️ I can help you check the weather! Let me search for current weather conditions in your area.`,
        timestamp: new Date(),
        actions: [
          {
            type: "search",
            label: "Check Weather",
            value: "current weather",
          },
        ],
        suggestions: [
          "7-day forecast",
          "Weather alerts",
          "Weather in another city",
        ],
      };
    }

    // Time and date
    if (lowerMessage.includes("time") || lowerMessage.includes("date")) {
      const now = new Date();
      return {
        id: Date.now().toString(),
        type: "ai",
        content: `🕐 **Current Time & Date:**\n\n**Time:** ${now.toLocaleTimeString()}\n**Date:** ${now.toLocaleDateString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        )}\n\nIs there anything else you'd like to know about time zones or scheduling?`,
        timestamp: new Date(),
        suggestions: ["World clock", "Set a reminder", "Different time zones"],
      };
    }

    // Calculations
    if (
      lowerMessage.includes("calculate") ||
      lowerMessage.includes("math") ||
      /\d+[\+\-\*\/]\d+/.test(lowerMessage)
    ) {
      const mathExpression = lowerMessage.match(/\d+[\+\-\*\/\d\s]+/)?.[0];
      if (mathExpression) {
        try {
          // Simple math evaluation (in real app, use a proper math parser)
          const result = eval(mathExpression.replace(/[^0-9+\-*/().\s]/g, ""));
          return {
            id: Date.now().toString(),
            type: "ai",
            content: `🧮 **Calculation Result:**\n\n${mathExpression} = **${result}**\n\nNeed more complex calculations? I can help with advanced math, unit conversions, and more!`,
            timestamp: new Date(),
            suggestions: [
              "More calculations",
              "Unit converter",
              "Scientific calculator",
            ],
          };
        } catch (e) {
          // Fall through to general response
        }
      }
    }

    // Default response with personality
    const responses = [
      `🥷 I understand you're asking about "${userMessage}". While I don't have specific information about that right now, I can use our AI-enhanced meta search to find comprehensive results from multiple sources.`,
      `⚡ That's an interesting question! Let me suggest some ways I can help you find the answer to "${userMessage}" using our intelligent search system.`,
      `🌟 I'm still learning about "${userMessage}", but I can definitely help you search across Wikipedia, Brave, DuckDuckGo, and Google with AI ranking for the best results.`,
      `🔥 Great question! While I may not have all the details about "${userMessage}" in my current knowledge base, I can use our meta search engine to find comprehensive information.`,
    ];

    return {
      id: Date.now().toString(),
      type: "ai",
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      actions: [
        {
          type: "search",
          label: `Search: ${userMessage}`,
          value: userMessage,
        },
      ],
      suggestions: [
        "Ask something else",
        "Use meta search",
        "Get AI search tips",
      ],
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsThinking(true);

    // Get AI response
    try {
      const aiResponse = await getAIResponse(inputValue);
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "ai",
        content:
          "🚫 Sorry, I encountered an error processing your request. Please try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsThinking(false);
  };

  const handleAction = (action: NonNullable<ChatMessage["actions"]>[0]) => {
    switch (action.type) {
      case "search":
        if (onSearch) {
          onSearch(action.value);
          toast.success(`Searching for: ${action.value}`);
        }
        break;
      case "navigate":
        if (onNavigate) {
          onNavigate(action.value);
          toast.success(`Navigating to: ${action.value}`);
        }
        break;
      case "bookmark":
        if (onBookmark) {
          onBookmark();
          toast.success("Bookmark action triggered");
        }
        break;
      case "settings":
        toast.success("Opening settings...");
        break;
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast.success("Voice input activated");
      // In a real implementation, this would use the Speech Recognition API
      setTimeout(() => {
        setIsListening(false);
        setInputValue("What's the weather like today?");
      }, 3000);
    } else {
      toast.success("Voice input deactivated");
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-6 w-6 text-blue-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            Kruger AI Assistant
          </SheetTitle>
          <SheetDescription>
            Your intelligent ninja companion for web browsing
          </SheetDescription>
        </SheetHeader>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 mt-4 mb-4">
          <div className="space-y-4 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className={`text-xs ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    }`}
                  >
                    {message.type === "user" ? "U" : "🥷"}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex-1 space-y-2 ${message.type === "user" ? "text-right" : ""}`}
                >
                  <Card
                    className={`${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-muted"
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>

                      {message.actions && (
                        <div className="mt-3 space-y-2">
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              className="mr-2 mb-2"
                              onClick={() => handleAction(action)}
                            >
                              {action.type === "search" && (
                                <Search className="h-3 w-3 mr-1" />
                              )}
                              {action.type === "navigate" && (
                                <Globe className="h-3 w-3 mr-1" />
                              )}
                              {action.type === "bookmark" && (
                                <BookOpen className="h-3 w-3 mr-1" />
                              )}
                              {action.type === "settings" && (
                                <Shield className="h-3 w-3 mr-1" />
                              )}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}

                      {message.suggestions && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            Suggestions:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {message.suggestions.map((suggestion, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="cursor-pointer hover:bg-opacity-80 text-xs"
                                onClick={() => handleSuggestion(suggestion)}
                              >
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <div className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                    🥷
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Kruger AI is thinking...
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSuggestion("What can you help me with?")}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Help
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSuggestion("Show my privacy status")}
            >
              <Shield className="h-3 w-3 mr-1" />
              Privacy
            </Button>
            <Button size="sm" variant="outline" onClick={clearChat}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask Kruger AI anything..."
              disabled={isThinking}
            />
            {isListening && (
              <div className="absolute inset-0 bg-red-500/10 border border-red-500 rounded-md flex items-center justify-center">
                <MicOff className="h-4 w-4 text-red-500 animate-pulse" />
              </div>
            )}
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={handleVoiceInput}
            className={
              isListening ? "bg-red-500 text-white hover:bg-red-600" : ""
            }
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isThinking}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Bar */}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {isListening
            ? "🎤 Listening..."
            : "🥷 Ready to assist • Type or speak your command"}
        </div>
      </SheetContent>
    </Sheet>
  );
}
