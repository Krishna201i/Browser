import * as React from "react";
import { useState, useCallback, useRef } from "react";

type VoiceLanguage =
  | "en-US"
  | "en-GB"
  | "es-ES"
  | "fr-FR"
  | "de-DE"
  | "it-IT"
  | "pt-BR"
  | "ru-RU"
  | "ja-JP"
  | "ko-KR"
  | "zh-CN"
  | "hi-IN";

type VoiceCommand =
  | "search"
  | "open"
  | "navigate"
  | "close"
  | "new_tab"
  | "incognito"
  | "settings";

interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  confidence: number;
  language: VoiceLanguage;
  detectedCommand: VoiceCommand | null;
  interimResults: string;
}

interface VoiceRecognitionHook extends VoiceRecognitionState {
  startListening: (
    language?: VoiceLanguage,
    continuous?: boolean,
  ) => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  setLanguage: (language: VoiceLanguage) => void;
  getSupportedLanguages: () => { code: VoiceLanguage; name: string }[];
}

const voiceCommands: Record<string, VoiceCommand> = {
  search: "search",
  find: "search",
  "look for": "search",
  google: "search",
  open: "open",
  "go to": "open",
  visit: "open",
  navigate: "navigate",
  close: "close",
  "close tab": "close",
  "new tab": "new_tab",
  "open tab": "new_tab",
  incognito: "incognito",
  private: "incognito",
  settings: "settings",
  preferences: "settings",
};

const supportedLanguages = [
  { code: "en-US" as VoiceLanguage, name: "English (US)" },
  { code: "en-GB" as VoiceLanguage, name: "English (UK)" },
  { code: "es-ES" as VoiceLanguage, name: "Spanish" },
  { code: "fr-FR" as VoiceLanguage, name: "French" },
  { code: "de-DE" as VoiceLanguage, name: "German" },
  { code: "it-IT" as VoiceLanguage, name: "Italian" },
  { code: "pt-BR" as VoiceLanguage, name: "Portuguese" },
  { code: "ru-RU" as VoiceLanguage, name: "Russian" },
  { code: "ja-JP" as VoiceLanguage, name: "Japanese" },
  { code: "ko-KR" as VoiceLanguage, name: "Korean" },
  { code: "zh-CN" as VoiceLanguage, name: "Chinese" },
  { code: "hi-IN" as VoiceLanguage, name: "Hindi" },
];

export const useVoiceRecognition = (): VoiceRecognitionHook => {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: "",
    isSupported:
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
    error: null,
    confidence: 0,
    language: "en-US",
    detectedCommand: null,
    interimResults: "",
  });

  const recognitionRef = useRef<any>(null);

  const detectCommand = useCallback((text: string): VoiceCommand | null => {
    const lowerText = text.toLowerCase();
    for (const [phrase, command] of Object.entries(voiceCommands)) {
      if (lowerText.includes(phrase)) {
        return command;
      }
    }
    return null;
  }, []);

  const startListening = useCallback(
    async (
      language: VoiceLanguage = state.language,
      continuous: boolean = false,
    ) => {
      if (!state.isSupported) {
        setState((prev) => ({
          ...prev,
          error: "Speech recognition is not supported in this browser",
        }));
        return;
      }

      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });

        setState((prev) => ({
          ...prev,
          error: null,
          isListening: true,
          transcript: "",
          interimResults: "",
          language,
          detectedCommand: null,
          confidence: 0,
        }));

        const SpeechRecognition =
          window.webkitSpeechRecognition || window.SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();

        const recognition = recognitionRef.current;
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 3;

        recognition.onstart = () => {
          setState((prev) => ({ ...prev, isListening: true, error: null }));
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";
          let maxConfidence = 0;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence || 0;

            if (result.isFinal) {
              finalTranscript += transcript;
              maxConfidence = Math.max(maxConfidence, confidence);
            } else {
              interimTranscript += transcript;
            }
          }

          const fullTranscript = finalTranscript || interimTranscript;
          const detectedCommand = detectCommand(fullTranscript);

          setState((prev) => ({
            ...prev,
            transcript: finalTranscript,
            interimResults: interimTranscript,
            confidence: maxConfidence,
            detectedCommand,
          }));
        };

        recognition.onend = () => {
          setState((prev) => ({ ...prev, isListening: false }));
        };

        recognition.onerror = (event: any) => {
          let errorMessage = "Speech recognition error occurred";

          switch (event.error) {
            case "not-allowed":
              errorMessage =
                "🎤 Microphone access denied. Please allow microphone permissions.";
              break;
            case "no-speech":
              errorMessage =
                "🔇 No speech detected. Please speak clearly and try again.";
              break;
            case "audio-capture":
              errorMessage =
                "🎧 No microphone found. Please check your audio settings.";
              break;
            case "network":
              errorMessage =
                "🌐 Network error occurred. Please check your internet connection.";
              break;
            case "service-not-allowed":
              errorMessage =
                "🚫 Speech recognition service not allowed. Check browser settings.";
              break;
            case "bad-grammar":
              errorMessage =
                "📝 Speech not recognized. Try speaking more clearly.";
              break;
            default:
              errorMessage = `⚠️ Speech recognition error: ${event.error}`;
          }

          setState((prev) => ({
            ...prev,
            isListening: false,
            error: errorMessage,
          }));
        };

        recognition.start();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isListening: false,
          error: "🔒 Microphone permission denied or not available",
        }));
      }
    },
    [state.isSupported, state.language, detectCommand],
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: "",
      interimResults: "",
      error: null,
      confidence: 0,
      detectedCommand: null,
    }));
  }, []);

  const setLanguage = useCallback((language: VoiceLanguage) => {
    setState((prev) => ({ ...prev, language }));
  }, []);

  const getSupportedLanguages = useCallback(() => {
    return supportedLanguages;
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
    getSupportedLanguages,
  };
};

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
