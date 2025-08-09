import { useState, useEffect, useCallback, useRef } from "react";
import { useBrowserSettings } from "./use-browser-settings";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  category: "navigation" | "tabs" | "search" | "browser" | "accessibility" | "custom";
}

export interface ShortcutScheme {
  name: string;
  description: string;
  shortcuts: KeyboardShortcut[];
}

export function useKeyboardShortcuts() {
  const browserSettings = useBrowserSettings();
  const [isShortcutHelpVisible, setIsShortcutHelpVisible] = useState(false);
  const [lastPressedKeys, setLastPressedKeys] = useState<string[]>([]);
  const [showShortcutFeedback, setShowShortcutFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const pressedKeys = useRef<Set<string>>(new Set());
  const shortcutTimeout = useRef<NodeJS.Timeout | null>(null);

  // Default shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: "l",
      ctrl: true,
      description: "Focus address bar",
      action: () => console.log("Focus address bar"),
      category: "navigation",
    },
    {
      key: "r",
      ctrl: true,
      description: "Reload page",
      action: () => console.log("Reload page"),
      category: "navigation",
    },
    {
      key: "r",
      ctrl: true,
      shift: true,
      description: "Hard reload",
      action: () => console.log("Hard reload"),
      category: "navigation",
    },
    {
      key: "ArrowLeft",
      alt: true,
      description: "Go back",
      action: () => console.log("Go back"),
      category: "navigation",
    },
    {
      key: "ArrowRight",
      alt: true,
      description: "Go forward",
      action: () => console.log("Go forward"),
      category: "navigation",
    },

    // Tabs
    {
      key: "t",
      ctrl: true,
      description: "New tab",
      action: () => console.log("New tab"),
      category: "tabs",
    },
    {
      key: "w",
      ctrl: true,
      description: "Close tab",
      action: () => console.log("Close tab"),
      category: "tabs",
    },
    {
      key: "Tab",
      ctrl: true,
      description: "Next tab",
      action: () => console.log("Next tab"),
      category: "tabs",
    },
    {
      key: "Tab",
      ctrl: true,
      shift: true,
      description: "Previous tab",
      action: () => console.log("Previous tab"),
      category: "tabs",
    },

    // Search
    {
      key: "f",
      ctrl: true,
      description: "Find in page",
      action: () => console.log("Find in page"),
      category: "search",
    },
    {
      key: "g",
      ctrl: true,
      description: "Find next",
      action: () => console.log("Find next"),
      category: "search",
    },
    {
      key: "g",
      ctrl: true,
      shift: true,
      description: "Find previous",
      action: () => console.log("Find previous"),
      category: "search",
    },

    // Browser
    {
      key: "d",
      ctrl: true,
      description: "Bookmark page",
      action: () => console.log("Bookmark page"),
      category: "browser",
    },
    {
      key: "j",
      ctrl: true,
      description: "Downloads",
      action: () => console.log("Downloads"),
      category: "browser",
    },
    {
      key: "h",
      ctrl: true,
      description: "History",
      action: () => console.log("History"),
      category: "browser",
    },
    {
      key: ",",
      ctrl: true,
      description: "Settings",
      action: () => console.log("Settings"),
      category: "browser",
    },

    // Accessibility
    {
      key: "=",
      ctrl: true,
      description: "Zoom in",
      action: () => {
        const newZoom = Math.min(200, browserSettings.settings.zoomLevel + 10);
        browserSettings.updateSetting("zoomLevel", newZoom);
        showFeedback("Zoom in");
      },
      category: "accessibility",
    },
    {
      key: "-",
      ctrl: true,
      description: "Zoom out",
      action: () => {
        const newZoom = Math.max(75, browserSettings.settings.zoomLevel - 10);
        browserSettings.updateSetting("zoomLevel", newZoom);
        showFeedback("Zoom out");
      },
      category: "accessibility",
    },
    {
      key: "0",
      ctrl: true,
      description: "Reset zoom",
      action: () => {
        browserSettings.updateSetting("zoomLevel", 100);
        showFeedback("Reset zoom");
      },
      category: "accessibility",
    },
  ];

  // Vim shortcuts
  const vimShortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: "h",
      description: "Go back",
      action: () => console.log("Go back"),
      category: "navigation",
    },
    {
      key: "l",
      description: "Go forward",
      action: () => console.log("Go forward"),
      category: "navigation",
    },
    {
      key: "j",
      description: "Scroll down",
      action: () => console.log("Scroll down"),
      category: "navigation",
    },
    {
      key: "k",
      description: "Scroll up",
      action: () => console.log("Scroll up"),
      category: "navigation",
    },
    {
      key: "gg",
      description: "Go to top",
      action: () => console.log("Go to top"),
      category: "navigation",
    },
    {
      key: "G",
      description: "Go to bottom",
      action: () => console.log("Go to bottom"),
      category: "navigation",
    },

    // Tabs
    {
      key: "t",
      description: "New tab",
      action: () => console.log("New tab"),
      category: "tabs",
    },
    {
      key: "q",
      description: "Close tab",
      action: () => console.log("Close tab"),
      category: "tabs",
    },
    {
      key: "n",
      description: "Next tab",
      action: () => console.log("Next tab"),
      category: "tabs",
    },
    {
      key: "p",
      description: "Previous tab",
      action: () => console.log("Previous tab"),
      category: "tabs",
    },

    // Search
    {
      key: "/",
      description: "Find in page",
      action: () => console.log("Find in page"),
      category: "search",
    },
    {
      key: "n",
      description: "Find next",
      action: () => console.log("Find next"),
      category: "search",
    },
    {
      key: "N",
      description: "Find previous",
      action: () => console.log("Find previous"),
      category: "search",
    },
  ];

  // Emacs shortcuts
  const emacsShortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: "b",
      ctrl: true,
      description: "Go back",
      action: () => console.log("Go back"),
      category: "navigation",
    },
    {
      key: "f",
      ctrl: true,
      description: "Go forward",
      action: () => console.log("Go forward"),
      category: "navigation",
    },
    {
      key: "n",
      ctrl: true,
      description: "Scroll down",
      action: () => console.log("Scroll down"),
      category: "navigation",
    },
    {
      key: "p",
      ctrl: true,
      description: "Scroll up",
      action: () => console.log("Scroll up"),
      category: "navigation",
    },

    // Tabs
    {
      key: "t",
      ctrl: true,
      description: "New tab",
      action: () => console.log("New tab"),
      category: "tabs",
    },
    {
      key: "k",
      ctrl: true,
      description: "Close tab",
      action: () => console.log("Close tab"),
      category: "tabs",
    },
    {
      key: "n",
      ctrl: true,
      description: "Next tab",
      action: () => console.log("Next tab"),
      category: "tabs",
    },
    {
      key: "p",
      ctrl: true,
      description: "Previous tab",
      action: () => console.log("Previous tab"),
      category: "tabs",
    },
  ];

  const shortcutSchemes: Record<string, ShortcutScheme> = {
    default: {
      name: "Default",
      description: "Standard browser shortcuts",
      shortcuts: defaultShortcuts,
    },
    vim: {
      name: "Vim",
      description: "Vim-style navigation",
      shortcuts: vimShortcuts,
    },
    emacs: {
      name: "Emacs",
      description: "Emacs-style shortcuts",
      shortcuts: emacsShortcuts,
    },
  };

  const getCurrentShortcuts = (): KeyboardShortcut[] => {
    const scheme = browserSettings.settings.shortcutScheme;
    const baseShortcuts = shortcutSchemes[scheme]?.shortcuts || defaultShortcuts;
    
    // Merge with custom shortcuts
    const customShortcuts: KeyboardShortcut[] = Object.entries(
      browserSettings.settings.customShortcuts
    ).map(([key, action]) => ({
      key,
      description: `Custom: ${action}`,
      action: () => console.log(`Custom action: ${action}`),
      category: "custom" as const,
    }));

    return [...baseShortcuts, ...customShortcuts];
  };

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setShowShortcutFeedback(true);
    
    if (shortcutTimeout.current) {
      clearTimeout(shortcutTimeout.current);
    }
    
    shortcutTimeout.current = setTimeout(() => {
      setShowShortcutFeedback(false);
    }, 2000);
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!browserSettings.settings.enableKeyboardShortcuts) return;

    const key = event.key.toLowerCase();
    const isCtrl = event.ctrlKey;
    const isShift = event.shiftKey;
    const isAlt = event.altKey;
    const isMeta = event.metaKey;

    // Update pressed keys
    pressedKeys.current.add(key);
    setLastPressedKeys(Array.from(pressedKeys.current));

    // Check for shortcuts
    const shortcuts = getCurrentShortcuts();
    const matchedShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === key;
      const ctrlMatch = shortcut.ctrl === isCtrl;
      const shiftMatch = shortcut.shift === isShift;
      const altMatch = shortcut.alt === isAlt;
      const metaMatch = shortcut.meta === isMeta;

      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
    });

    if (matchedShortcut) {
      event.preventDefault();
      matchedShortcut.action();
      showFeedback(matchedShortcut.description);
    }

    // Special shortcuts
    if (isCtrl && isShift && key === "?") {
      event.preventDefault();
      setIsShortcutHelpVisible(true);
    }
  }, [browserSettings.settings.enableKeyboardShortcuts, browserSettings.settings.shortcutScheme]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    pressedKeys.current.delete(key);
    setLastPressedKeys(Array.from(pressedKeys.current));
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const addCustomShortcut = useCallback((key: string, action: string) => {
    const customShortcuts = { ...browserSettings.settings.customShortcuts };
    customShortcuts[key] = action;
    browserSettings.updateSetting("customShortcuts", customShortcuts);
  }, [browserSettings]);

  const removeCustomShortcut = useCallback((key: string) => {
    const customShortcuts = { ...browserSettings.settings.customShortcuts };
    delete customShortcuts[key];
    browserSettings.updateSetting("customShortcuts", customShortcuts);
  }, [browserSettings]);

  const formatKeyCombo = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    
    if (shortcut.ctrl) parts.push("Ctrl");
    if (shortcut.shift) parts.push("Shift");
    if (shortcut.alt) parts.push("Alt");
    if (shortcut.meta) parts.push("Cmd");
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(" + ");
  };

  return {
    shortcuts: getCurrentShortcuts(),
    shortcutSchemes,
    isShortcutHelpVisible,
    setIsShortcutHelpVisible,
    showShortcutFeedback,
    feedbackMessage,
    lastPressedKeys,
    addCustomShortcut,
    removeCustomShortcut,
    formatKeyCombo,
  };
}
