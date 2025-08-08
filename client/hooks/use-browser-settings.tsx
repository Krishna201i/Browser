import { useState, useEffect, useCallback } from "react";

export interface BrowserSettings {
  // Appearance
  theme: "light" | "dark";
  zoomLevel: number;
  fontSize: number;

  // Privacy & Security
  blockTrackers: boolean;
  blockAds: boolean;
  forceHttps: boolean;
  antiFingerprintng: boolean;
  secureDns: boolean;
  blockSocialTrackers: boolean;

  // Advanced Security
  blockDangerousScripts: boolean;
  enhancedCookieProtection: boolean;
  hideReferrerInformation: boolean;
  securityLevel: "standard" | "balanced" | "strict" | "paranoid";

  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;

  // Performance & Battery
  batterySaver: boolean;
  performanceMode: "performance" | "balanced" | "power-saver";

  // VPN
  vpnAutoConnect: boolean;
  vpnKillSwitch: boolean;
  vpnDnsLeakProtection: boolean;
  vpnProtocol: "OpenVPN" | "WireGuard" | "IKEv2";

  // History
  saveHistory: boolean;
  excludeIncognito: boolean;
  autoDeleteHistory: boolean;
  historyRetentionDays: number;

  // Device Adaptation
  adaptiveUI: boolean;
  responsiveLayout: boolean;
  touchOptimization: boolean;
  screenSizeOptimization: boolean;

  // Keyboard Shortcuts
  enableKeyboardShortcuts: boolean;
  shortcutScheme: "default" | "vim" | "emacs" | "custom";
  customShortcuts: Record<string, string>;

  // Advanced Features
  enableAI: boolean;
  aiLanguage: string;
  voiceControl: boolean;
  gestureControl: boolean;
  autofillEnabled: boolean;
  passwordManagerEnabled: boolean;
  syncEnabled: boolean;

  // Browser Behavior
  defaultSearchEngine: string;
  homePage: string;
  newTabPage: "home" | "blank" | "custom";
  downloadsPath: string;
  enableNotifications: boolean;
  enablePopupBlocking: boolean;
  enableJavaScript: boolean;
  enableImages: boolean;
  enableCookies: boolean;
}

export const defaultSettings: BrowserSettings = {
  // Appearance
  theme: "dark",
  zoomLevel: 100,
  fontSize: 15,

  // Privacy & Security
  blockTrackers: true,
  blockAds: true,
  forceHttps: true,
  antiFingerprintng: true,
  secureDns: true,
  blockSocialTrackers: true,

  // Advanced Security
  blockDangerousScripts: true,
  enhancedCookieProtection: true,
  hideReferrerInformation: true,
  securityLevel: "balanced",

  // Accessibility
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,

  // Performance & Battery
  batterySaver: false,
  performanceMode: "balanced",

  // VPN
  vpnAutoConnect: false,
  vpnKillSwitch: true,
  vpnDnsLeakProtection: true,
  vpnProtocol: "WireGuard",

  // History
  saveHistory: true,
  excludeIncognito: true,
  autoDeleteHistory: false,
  historyRetentionDays: 90,

  // Device Adaptation
  adaptiveUI: true,
  responsiveLayout: true,
  touchOptimization: true,
  screenSizeOptimization: true,

  // Keyboard Shortcuts
  enableKeyboardShortcuts: true,
  shortcutScheme: "default",
  customShortcuts: {},

  // Advanced Features
  enableAI: true,
  aiLanguage: "en-US",
  voiceControl: true,
  gestureControl: false,
  autofillEnabled: true,
  passwordManagerEnabled: true,
  syncEnabled: false,

  // Browser Behavior
  defaultSearchEngine: "google",
  homePage: "kruger://home",
  newTabPage: "home",
  downloadsPath: "",
  enableNotifications: true,
  enablePopupBlocking: true,
  enableJavaScript: true,
  enableImages: true,
  enableCookies: true,
};

// Keyboard shortcuts configuration
export const keyboardShortcuts = {
  // Navigation
  new_tab: { default: "Ctrl+T", description: "Open new tab" },
  close_tab: { default: "Ctrl+W", description: "Close current tab" },
  new_incognito: { default: "Ctrl+Shift+N", description: "Open incognito tab" },
  reload: { default: "Ctrl+R", description: "Reload page" },
  force_reload: { default: "Ctrl+Shift+R", description: "Force reload page" },
  go_back: { default: "Alt+Left", description: "Go back" },
  go_forward: { default: "Alt+Right", description: "Go forward" },
  home: { default: "Alt+Home", description: "Go to home page" },

  // Search & Address Bar
  focus_address: { default: "Ctrl+L", description: "Focus address bar" },
  search: { default: "Ctrl+K", description: "Focus search" },
  voice_search: { default: "Ctrl+Shift+V", description: "Voice search" },

  // Bookmarks & History
  bookmark_page: { default: "Ctrl+D", description: "Bookmark current page" },
  bookmark_manager: {
    default: "Ctrl+Shift+O",
    description: "Open bookmark manager",
  },
  history: { default: "Ctrl+H", description: "Open history" },
  downloads: { default: "Ctrl+J", description: "Open downloads" },

  // Zoom & View
  zoom_in: { default: "Ctrl+=", description: "Zoom in" },
  zoom_out: { default: "Ctrl+-", description: "Zoom out" },
  zoom_reset: { default: "Ctrl+0", description: "Reset zoom" },
  fullscreen: { default: "F11", description: "Toggle fullscreen" },

  // Accessibility
  high_contrast: { default: "Alt+H", description: "Toggle high contrast" },
  dark_mode: { default: "Alt+D", description: "Toggle dark mode" },
  large_text: { default: "Alt+T", description: "Toggle large text" },

  // Developer & Advanced
  developer_tools: { default: "F12", description: "Open developer tools" },
  view_source: { default: "Ctrl+U", description: "View page source" },
  settings: { default: "Ctrl+,", description: "Open settings" },

  // AI & Features
  ai_assistant: { default: "Ctrl+Shift+A", description: "Open AI assistant" },
  vpn_toggle: { default: "Ctrl+Shift+V", description: "Toggle VPN" },
  incognito_toggle: {
    default: "Ctrl+Shift+P",
    description: "Toggle private mode",
  },

  // Tab Management
  next_tab: { default: "Ctrl+Tab", description: "Switch to next tab" },
  prev_tab: {
    default: "Ctrl+Shift+Tab",
    description: "Switch to previous tab",
  },
  tab_1: { default: "Ctrl+1", description: "Switch to tab 1" },
  tab_2: { default: "Ctrl+2", description: "Switch to tab 2" },
  tab_3: { default: "Ctrl+3", description: "Switch to tab 3" },
  tab_4: { default: "Ctrl+4", description: "Switch to tab 4" },
  tab_5: { default: "Ctrl+5", description: "Switch to tab 5" },
  tab_6: { default: "Ctrl+6", description: "Switch to tab 6" },
  tab_7: { default: "Ctrl+7", description: "Switch to tab 7" },
  tab_8: { default: "Ctrl+8", description: "Switch to tab 8" },
  last_tab: { default: "Ctrl+9", description: "Switch to last tab" },

  // Quick Actions
  quick_access: { default: "Ctrl+Q", description: "Open quick access" },
  find_in_page: { default: "Ctrl+F", description: "Find in page" },
  print: { default: "Ctrl+P", description: "Print page" },
  save_page: { default: "Ctrl+S", description: "Save page" },
};

export function useBrowserSettings() {
  const [settings, setSettings] = useState<BrowserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("kruger-browser-settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(
          "kruger-browser-settings",
          JSON.stringify(settings),
        );
        applySettings(settings);
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  }, [settings, isLoading]);

  // Apply settings to DOM and browser
  const applySettings = useCallback((newSettings: BrowserSettings) => {
    const root = document.documentElement;
    const body = document.body;

    // Apply theme
    root.classList.remove("light", "dark");
    root.classList.add(newSettings.theme);

    // Apply zoom
    body.style.zoom = `${newSettings.zoomLevel}%`;

    // Apply font size
    root.style.fontSize = `${newSettings.fontSize}px`;

    // Apply accessibility settings
    if (newSettings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    if (newSettings.largeText) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }

    if (newSettings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Apply performance settings
    if (newSettings.batterySaver) {
      root.classList.add("battery-saver");
    } else {
      root.classList.remove("battery-saver");
    }

    // Apply responsive design settings
    if (newSettings.adaptiveUI) {
      root.classList.add("adaptive-ui");
    } else {
      root.classList.remove("adaptive-ui");
    }
  }, []);

  const updateSetting = useCallback(
    <K extends keyof BrowserSettings>(key: K, value: BrowserSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateMultipleSettings = useCallback(
    (updates: Partial<BrowserSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((settingsJson: string) => {
    try {
      const imported = JSON.parse(settingsJson);
      setSettings({ ...defaultSettings, ...imported });
      return true;
    } catch (error) {
      console.error("Failed to import settings:", error);
      return false;
    }
  }, []);

  // Get current keyboard shortcut for an action
  const getShortcut = useCallback(
    (action: string) => {
      return (
        settings.customShortcuts[action] ||
        keyboardShortcuts[action]?.default ||
        ""
      );
    },
    [settings.customShortcuts],
  );

  // Set custom keyboard shortcut
  const setShortcut = useCallback(
    (action: string, shortcut: string) => {
      updateSetting("customShortcuts", {
        ...settings.customShortcuts,
        [action]: shortcut,
      });
    },
    [settings.customShortcuts, updateSetting],
  );

  return {
    settings,
    isLoading,
    updateSetting,
    updateMultipleSettings,
    resetSettings,
    exportSettings,
    importSettings,
    getShortcut,
    setShortcut,
    keyboardShortcuts,
    applySettings,
  };
}
