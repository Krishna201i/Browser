import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  zoomLevel: number;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  darkMode: boolean;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  zoomLevel: 100,
  keyboardNavigation: true,
  focusIndicators: true,
  darkMode: false,
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
};

export function useAccessibility() {
  const [settings, setSettings] =
    useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("kruger-accessibility");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to load accessibility settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("kruger-accessibility", JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = useCallback(
    (settings: AccessibilitySettings) => {
      const root = document.documentElement;
      const body = document.body;

      // High Contrast Mode
      if (settings.highContrast) {
        root.classList.add("high-contrast");
        root.style.setProperty("--accessibility-contrast", "1");
      } else {
        root.classList.remove("high-contrast");
        root.style.setProperty("--accessibility-contrast", "0");
      }

      // Large Text
      if (settings.largeText) {
        root.style.setProperty("--accessibility-font-scale", "1.25");
      } else {
        root.style.setProperty("--accessibility-font-scale", "1");
      }

      // Reduced Motion
      if (settings.reducedMotion) {
        root.classList.add("reduce-motion");
        root.style.setProperty("--accessibility-motion", "0");
      } else {
        root.classList.remove("reduce-motion");
        root.style.setProperty("--accessibility-motion", "1");
      }

      // Screen Reader Support
      if (settings.screenReader) {
        root.setAttribute("aria-live", "polite");
        root.classList.add("screen-reader-mode");
      } else {
        root.removeAttribute("aria-live");
        root.classList.remove("screen-reader-mode");
      }

      // Zoom Level
      body.style.zoom = `${settings.zoomLevel}%`;

      // Keyboard Navigation
      if (settings.keyboardNavigation) {
        root.classList.add("keyboard-navigation");
      } else {
        root.classList.remove("keyboard-navigation");
      }

      // Focus Indicators
      if (settings.focusIndicators) {
        root.classList.add("enhanced-focus");
        root.style.setProperty("--accessibility-focus-width", "3px");
      } else {
        root.classList.remove("enhanced-focus");
        root.style.setProperty("--accessibility-focus-width", "1px");
      }

      // Dark Mode
      if (settings.darkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Typography Settings
      root.style.setProperty(
        "--accessibility-font-size",
        `${settings.fontSize}px`,
      );
      root.style.setProperty(
        "--accessibility-line-height",
        `${settings.lineHeight}`,
      );
      root.style.setProperty(
        "--accessibility-letter-spacing",
        `${settings.letterSpacing}px`,
      );
    },
    [],
  );

  const updateSetting = useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K],
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }));

      // Provide feedback for setting changes
      const settingNames: Record<keyof AccessibilitySettings, string> = {
        highContrast: "High Contrast Mode",
        largeText: "Large Text",
        reducedMotion: "Reduced Motion",
        screenReader: "Screen Reader Support",
        zoomLevel: "Zoom Level",
        keyboardNavigation: "Keyboard Navigation",
        focusIndicators: "Focus Indicators",
        darkMode: "Dark Mode",
        fontSize: "Font Size",
        lineHeight: "Line Height",
        letterSpacing: "Letter Spacing",
      };

      const settingName = settingNames[key];

      if (typeof value === "boolean") {
        toast.success(`${settingName} ${value ? "enabled" : "disabled"}`);
      } else {
        toast.success(`${settingName} updated to ${value}`);
      }
    },
    [],
  );

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    toast.success("Accessibility settings reset to default");
  }, []);

  const toggleHighContrast = useCallback(() => {
    updateSetting("highContrast", !settings.highContrast);
  }, [settings.highContrast, updateSetting]);

  const toggleLargeText = useCallback(() => {
    updateSetting("largeText", !settings.largeText);
  }, [settings.largeText, updateSetting]);

  const toggleReducedMotion = useCallback(() => {
    updateSetting("reducedMotion", !settings.reducedMotion);
  }, [settings.reducedMotion, updateSetting]);

  const toggleScreenReader = useCallback(() => {
    updateSetting("screenReader", !settings.screenReader);
  }, [settings.screenReader, updateSetting]);

  const setZoomLevel = useCallback(
    (level: number) => {
      const clampedLevel = Math.max(50, Math.min(200, level));
      updateSetting("zoomLevel", clampedLevel);
    },
    [updateSetting],
  );

  const increaseFontSize = useCallback(() => {
    const newSize = Math.min(24, settings.fontSize + 1);
    updateSetting("fontSize", newSize);
  }, [settings.fontSize, updateSetting]);

  const decreaseFontSize = useCallback(() => {
    const newSize = Math.max(12, settings.fontSize - 1);
    updateSetting("fontSize", newSize);
  }, [settings.fontSize, updateSetting]);

  const toggleDarkMode = useCallback(() => {
    updateSetting("darkMode", !settings.darkMode);
  }, [settings.darkMode, updateSetting]);

  const resetZoomTo100 = useCallback(() => {
    updateSetting("zoomLevel", 100);
  }, [updateSetting]);

  // Keyboard event handler for accessibility shortcuts
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Plus: Increase zoom
      if ((event.ctrlKey || event.metaKey) && event.key === "=") {
        event.preventDefault();
        setZoomLevel(settings.zoomLevel + 10);
      }

      // Ctrl/Cmd + Minus: Decrease zoom
      if ((event.ctrlKey || event.metaKey) && event.key === "-") {
        event.preventDefault();
        setZoomLevel(settings.zoomLevel - 10);
      }

      // Ctrl/Cmd + 0: Reset zoom
      if ((event.ctrlKey || event.metaKey) && event.key === "0") {
        event.preventDefault();
        setZoomLevel(100);
      }

      // Alt + H: Toggle high contrast
      if (event.altKey && event.key === "h") {
        event.preventDefault();
        toggleHighContrast();
      }

      // Alt + D: Toggle dark mode
      if (event.altKey && event.key === "d") {
        event.preventDefault();
        toggleDarkMode();
      }
    };

    if (settings.keyboardNavigation) {
      window.addEventListener("keydown", handleKeyboard);
      return () => window.removeEventListener("keydown", handleKeyboard);
    }
  }, [settings, setZoomLevel, toggleHighContrast, toggleDarkMode]);

  return {
    settings,
    updateSetting,
    resetSettings,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    toggleScreenReader,
    setZoomLevel,
    increaseFontSize,
    decreaseFontSize,
    toggleDarkMode,
    resetZoomTo100,
  };
}
