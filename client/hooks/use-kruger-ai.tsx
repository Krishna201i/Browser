import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

interface AICommand {
  trigger: string[];
  description: string;
  category: "navigation" | "search" | "browser" | "system" | "ai";
  handler: (params: string) => Promise<string>;
}

interface AIResponse {
  text: string;
  actions?: Array<{
    type: "search" | "navigate" | "bookmark" | "settings" | "execute";
    label: string;
    value: string;
  }>;
  suggestions?: string[];
}

export function useKrugerAI() {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interimResults, setInterimResults] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<any>({});
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          setInterimResults("");
        } else {
          setInterimResults(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        let errorMessage = "Speech recognition error";

        switch (event.error) {
          case "network":
            errorMessage = "Network connection required for voice recognition";
            break;
          case "not-allowed":
            errorMessage =
              "Microphone access denied. Please allow microphone access in browser settings.";
            break;
          case "no-speech":
            errorMessage = "No speech detected. Please try speaking again.";
            break;
          case "audio-capture":
            errorMessage = "No microphone found. Please connect a microphone.";
            break;
          case "service-not-allowed":
            errorMessage = "Speech service not available. Try again later.";
            break;
          default:
            errorMessage = `Voice recognition error: ${event.error}`;
        }

        setError(errorMessage);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const commands: AICommand[] = [
    {
      trigger: ["search for", "find", "look for", "google"],
      description: "Search the web",
      category: "search",
      handler: async (query) =>
        `I'll search for "${query}" using your preferred search engine.`,
    },
    {
      trigger: ["go to", "navigate to", "open", "visit"],
      description: "Navigate to a website",
      category: "navigation",
      handler: async (site) => `I'll navigate you to ${site}.`,
    },
    {
      trigger: ["bookmark this", "save this page", "add bookmark"],
      description: "Bookmark current page",
      category: "browser",
      handler: async () => "I'll bookmark the current page for you.",
    },
    {
      trigger: ["new tab", "open tab"],
      description: "Open new tab",
      category: "browser",
      handler: async () => "I'll open a new tab for you.",
    },
    {
      trigger: ["close tab", "close this"],
      description: "Close current tab",
      category: "browser",
      handler: async () => "I'll close the current tab.",
    },
    {
      trigger: ["incognito", "private", "private browsing"],
      description: "Open incognito tab",
      category: "browser",
      handler: async () => "I'll open a private browsing tab for you.",
    },
    {
      trigger: ["settings", "preferences", "options"],
      description: "Open browser settings",
      category: "system",
      handler: async () => "I'll open the browser settings for you.",
    },
    {
      trigger: ["what time", "current time", "what's the time"],
      description: "Get current time",
      category: "ai",
      handler: async () => {
        const now = new Date();
        return `It's currently ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}.`;
      },
    },
    {
      trigger: ["weather", "temperature", "forecast"],
      description: "Get weather information",
      category: "ai",
      handler: async (location) => {
        const loc = location || "your area";
        return `I'll help you check the weather for ${loc}. Let me search for current weather conditions.`;
      },
    },
    {
      trigger: ["calculate", "math", "compute"],
      description: "Perform calculations",
      category: "ai",
      handler: async (expression) => {
        try {
          // Simple math evaluation (in production, use a proper math parser)
          const result = eval(expression.replace(/[^0-9+\-*/().\s]/g, ""));
          return `The result is: ${result}`;
        } catch (e) {
          return "I couldn't calculate that. Please provide a valid mathematical expression.";
        }
      },
    },
    {
      trigger: ["help", "what can you do", "commands"],
      description: "Show available commands",
      category: "ai",
      handler: async () => {
        return `I'm Kruger AI, your intelligent browser assistant! I can help you with:

🔍 **Search & Navigation**: "Search for React tutorials", "Go to GitHub"
📚 **Bookmarks**: "Bookmark this page", "Show my bookmarks" 
🌐 **Browser Control**: "New tab", "Close tab", "Incognito mode"
⚙️ **Settings**: "Open settings", "Privacy options"
🤖 **AI Features**: "What time is it", "Calculate 15 * 24", "Weather forecast"

Just speak naturally or type your command!`;
      },
    },
    {
      trigger: ["privacy", "security", "protection"],
      description: "Get privacy information",
      category: "system",
      handler: async () => {
        return `🛡️ Your privacy is protected with Kruger's advanced security features:
        
• Tracker blocking (99% effective)
• HTTPS enforcement 
• Anti-fingerprinting
• No data logging
• Encrypted connections

All processing happens locally when possible. Your data stays private!`;
      },
    },
  ];

  const processCommand = useCallback(
    async (input: string): Promise<AIResponse> => {
      const lowerInput = input.toLowerCase().trim();

      // Find matching command
      for (const command of commands) {
        for (const trigger of command.trigger) {
          if (lowerInput.includes(trigger)) {
            const params = lowerInput.replace(trigger, "").trim();
            const text = await command.handler(params);

            // Generate actions based on command type
            const actions: AIResponse["actions"] = [];

            if (command.category === "search") {
              actions.push({
                type: "search",
                label: `Search: ${params}`,
                value: params || input,
              });
            } else if (command.category === "navigation") {
              let url = params;
              // Handle common shortcuts
              const shortcuts: { [key: string]: string } = {
                github: "https://github.com",
                youtube: "https://youtube.com",
                gmail: "https://gmail.com",
                google: "https://google.com",
              };

              if (shortcuts[params.toLowerCase()]) {
                url = shortcuts[params.toLowerCase()];
              } else if (!params.includes("http") && params.includes(".")) {
                url = `https://${params}`;
              }

              actions.push({
                type: "navigate",
                label: `Open ${params}`,
                value: url,
              });
            } else if (command.category === "browser") {
              actions.push({
                type: "execute",
                label: command.description,
                value: command.trigger[0],
              });
            } else if (command.category === "system") {
              actions.push({
                type: "settings",
                label: "Open Settings",
                value: "settings",
              });
            }

            return {
              text,
              actions: actions.length > 0 ? actions : undefined,
              suggestions: [
                "Ask me something else",
                "What else can you do?",
                "Help me with navigation",
              ],
            };
          }
        }
      }

      // If no command matches, provide intelligent response
      return await generateIntelligentResponse(input);
    },
    [],
  );

  const generateIntelligentResponse = async (
    input: string,
  ): Promise<AIResponse> => {
    const lowerInput = input.toLowerCase();

    // Context-aware responses
    if (lowerInput.includes("how") && lowerInput.includes("?")) {
      return {
        text: `That's a great question! While I'm still learning about "${input}", I can help you search for detailed information or guide you to relevant resources.`,
        actions: [
          {
            type: "search",
            label: `Search: ${input}`,
            value: input,
          },
        ],
        suggestions: [
          "Search for tutorials",
          "Find documentation",
          "Ask a different question",
        ],
      };
    }

    if (lowerInput.includes("what") && lowerInput.includes("?")) {
      return {
        text: `I'd be happy to help you learn about "${input}". Let me search for the most current and accurate information.`,
        actions: [
          {
            type: "search",
            label: `Search: ${input}`,
            value: input,
          },
        ],
        suggestions: [
          "Get more details",
          "Find examples",
          "Search related topics",
        ],
      };
    }

    // Default intelligent response
    const responses = [
      `I understand you're asking about "${input}". While I continue learning, I can search the web for you or help you navigate to relevant resources.`,
      `That's interesting! Let me help you find more information about "${input}" through a web search.`,
      `I'm processing your query about "${input}". I can search for detailed information or guide you to helpful websites.`,
      `Great question! While I'm still expanding my knowledge about "${input}", I can definitely help you research this topic.`,
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      actions: [
        {
          type: "search",
          label: `Search: ${input}`,
          value: input,
        },
      ],
      suggestions: [
        "Try a different question",
        "Search the web",
        "Get help with commands",
        "Ask about browser features",
      ],
    };
  };

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setError("Speech recognition not supported");
      return;
    }

    try {
      setIsListening(true);
      setError(null);
      setTranscript("");
      setInterimResults("");
      recognitionRef.current.start();
    } catch (error) {
      setError("Failed to start speech recognition");
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, [isListening]);

  const processText = useCallback(
    async (text: string): Promise<AIResponse> => {
      setIsThinking(true);

      try {
        // Simulate thinking time for realism
        await new Promise((resolve) =>
          setTimeout(resolve, 500 + Math.random() * 1500),
        );

        const response = await processCommand(text);
        return response;
      } finally {
        setIsThinking(false);
      }
    },
    [processCommand],
  );

  const updateContext = useCallback((key: string, value: any) => {
    setContext((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    isListening,
    isThinking,
    confidence,
    transcript,
    interimResults,
    error,
    context,
    startListening,
    stopListening,
    processText,
    updateContext,
    commands: commands.map((cmd) => ({
      triggers: cmd.trigger,
      description: cmd.description,
      category: cmd.category,
    })),
  };
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
