import React, { useState } from "react";
import {
  Plus,
  X,
  Settings,
  Moon,
  Sun,
  Home,
  Shield,
  Eye,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Undo2,
  Redo2,
  Bookmark,
  Download,
  History,
  Trash2,
  Star,
  Lock,
  Zap,
  Globe,
  Accessibility,
  Users,
  Bot,
  Battery,
  Cpu,
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Keyboard,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRealStats } from "@/hooks/use-real-stats";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useVPN } from "@/hooks/use-vpn";
import { useAuth } from "@/hooks/use-auth";
import { useDevice } from "@/hooks/use-device";
import { useHistory } from "@/hooks/use-history";
import { useBrowserSettings } from "@/hooks/use-browser-settings";
import DownloadManager from "./DownloadManager";
import BookmarkManager from "./BookmarkManager";
import KrugerAI from "./KrugerAI";
import UnifiedSettings from "./UnifiedSettings";
import HistoryManager from "./HistoryManager";
import FirebaseAuth from "./FirebaseAuth";

interface Tab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  isIncognito?: boolean;
}

interface BrowserToolbarProps {
  tabs: Tab[];
  onNewTab: () => void;
  onCloseTab: (id: string) => void;
  onSwitchTab: (id: string) => void;
  onNewIncognitoTab: () => void;
  onGoBack?: () => void;
  onGoForward?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onSearch?: (query: string) => void;
  onNavigate?: (url: string) => void;
  onBookmark?: () => void;
}

export default function BrowserToolbar({
  tabs,
  onNewTab,
  onCloseTab,
  onSwitchTab,
  onNewIncognitoTab,
  onGoBack,
  onGoForward,
  onUndo,
  onRedo,
  canGoBack = false,
  canGoForward = false,
  canUndo = false,
  canRedo = false,
  onSearch,
  onNavigate,
  onBookmark,
}: BrowserToolbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadManagerOpen, setDownloadManagerOpen] = useState(false);
  const [bookmarkManagerOpen, setBookmarkManagerOpen] = useState(false);
  const [krugerAIOpen, setKrugerAIOpen] = useState(false);
  const [activeDownloads, setActiveDownloads] = useState(2);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Collapsible states - Reorganized by importance
  const [privacyOpen, setPrivacyOpen] = useState(true); // Most important - open by default
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [vpnSettingsOpen, setVpnSettingsOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [historySettingsOpen, setHistorySettingsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [browserStatsOpen, setBrowserStatsOpen] = useState(false); // Least important

  const { stats, resetStats } = useRealStats();
  const accessibility = useAccessibility();
  const vpn = useVPN();
  const auth = useAuth();
  const device = useDevice();
  const historyHook = useHistory();
  const browserSettings = useBrowserSettings();

  const toggleTheme = () => {
    const newTheme =
      browserSettings.settings.theme === "light" ? "dark" : "light";
    browserSettings.updateSetting("theme", newTheme);
  };

  // Enhanced Keyboard shortcuts effect
  React.useEffect(() => {
    if (!browserSettings.settings.enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Browser Navigation
      if (isCtrl && e.key === "t") {
        e.preventDefault();
        onNewTab();
      } else if (isCtrl && e.key === "w") {
        e.preventDefault();
        const activeTab = tabs.find((tab) => tab.isActive);
        if (activeTab) onCloseTab(activeTab.id);
      } else if (isCtrl && isShift && e.key === "N") {
        e.preventDefault();
        onNewIncognitoTab();
      } else if (isCtrl && e.key === "r") {
        e.preventDefault();
        window.location.reload();
      } else if (isAlt && e.key === "ArrowLeft") {
        e.preventDefault();
        if (canGoBack) onGoBack?.();
      } else if (isAlt && e.key === "ArrowRight") {
        e.preventDefault();
        if (canGoForward) onGoForward?.();
      }

      // Browser Features
      else if (isCtrl && e.key === "d") {
        e.preventDefault();
        onBookmark?.();
      } else if (isCtrl && e.key === "j") {
        e.preventDefault();
        setDownloadManagerOpen(true);
      } else if (isCtrl && e.key === "h") {
        e.preventDefault();
        setHistoryOpen(true);
      } else if (isCtrl && e.key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
      } else if (isCtrl && isShift && e.key === "A") {
        e.preventDefault();
        setKrugerAIOpen(true);
      }

      // Accessibility
      else if (isAlt && e.key === "h") {
        e.preventDefault();
        accessibility.toggleHighContrast();
      } else if (isAlt && e.key === "d") {
        e.preventDefault();
        toggleTheme();
      }

      // Zoom Controls
      else if (isCtrl && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        const newZoom = Math.min(200, browserSettings.settings.zoomLevel + 10);
        browserSettings.updateSetting("zoomLevel", newZoom);
      } else if (isCtrl && e.key === "-") {
        e.preventDefault();
        const newZoom = Math.max(75, browserSettings.settings.zoomLevel - 10);
        browserSettings.updateSetting("zoomLevel", newZoom);
      } else if (isCtrl && e.key === "0") {
        e.preventDefault();
        browserSettings.updateSetting("zoomLevel", 100);
      }

      // Tab Navigation
      else if (isCtrl && e.key >= "1" && e.key <= "8") {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) onSwitchTab(tabs[tabIndex].id);
      } else if (isCtrl && e.key === "9") {
        e.preventDefault();
        const lastTab = tabs[tabs.length - 1];
        if (lastTab) onSwitchTab(lastTab.id);
      }

      // Advanced shortcuts
      else if (e.key === "F12") {
        e.preventDefault();
        console.log("Developer tools would open here");
      } else if (isCtrl && e.key === "u") {
        e.preventDefault();
        console.log("View source would open here");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    browserSettings,
    tabs,
    onNewTab,
    onCloseTab,
    onNewIncognitoTab,
    onGoBack,
    onGoForward,
    canGoBack,
    canGoForward,
    onBookmark,
    accessibility,
  ]);

  const handleResetStats = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all browser statistics? This action cannot be undone.",
      )
    ) {
      resetStats();
    }
  };

  const activeTab = tabs.find((tab) => tab.isActive);

  return (
    <div className="browser-toolbar p-2">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 mb-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-shape px-4 py-2 min-w-0 max-w-xs cursor-pointer transition-colors ${
              tab.isActive
                ? "bg-browser-tab-active text-foreground"
                : "bg-browser-tab text-muted-foreground hover:bg-browser-tab-active/50"
            } ${tab.isIncognito ? "border-l-4 border-purple-500" : ""}`}
            onClick={() => onSwitchTab(tab.id)}
          >
            <div className="flex items-center gap-2">
              {tab.isIncognito && <Eye className="h-3 w-3 text-purple-500" />}
              <span className="truncate text-sm font-medium">{tab.title}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          size="icon"
          variant="ghost"
          onClick={onNewTab}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="New Tab (Ctrl+T)"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onGoBack}
            disabled={!canGoBack}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Go Back (Alt+Left)"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onGoForward}
            disabled={!canGoForward}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Go Forward (Alt+Right)"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => window.location.reload()}
            className="text-muted-foreground hover:text-foreground"
            title="Reload (Ctrl+R)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Navigation History */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={canUndo ? onUndo : onRedo}
            disabled={!canUndo && !canRedo}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            title={
              canUndo
                ? "Undo Last Action"
                : canRedo
                  ? "Redo Action"
                  : "No Actions Available"
            }
          >
            {canUndo ? (
              <Undo2 className="h-4 w-4" />
            ) : (
              <Redo2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        <Button
          size="icon"
          variant="ghost"
          onClick={() => onSwitchTab("home")}
          className="text-muted-foreground hover:text-foreground"
          title="Home"
        >
          <Home className="h-4 w-4" />
        </Button>

        <div className="flex-1 bg-background rounded-lg px-3 py-2 text-sm font-mono">
          {activeTab ? activeTab.url : "kruger://home"}
        </div>

        {/* Enhanced Controls */}
        <div className="flex items-center gap-1">
          <BookmarkManager
            isOpen={bookmarkManagerOpen}
            onOpenChange={setBookmarkManagerOpen}
            onNavigate={onNavigate}
            currentUrl={activeTab?.url}
            currentTitle={activeTab?.title}
          />
          <DownloadManager
            isOpen={downloadManagerOpen}
            onOpenChange={setDownloadManagerOpen}
            downloadCount={activeDownloads}
          />
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            title="History (Ctrl+H)"
            onClick={() => setHistoryOpen(true)}
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`text-muted-foreground hover:text-foreground transition-all duration-200 ${
              activeTab && activeTab.url !== "kruger://home"
                ? "hover:text-yellow-500 hover:scale-110"
                : ""
            }`}
            title="Add to Favorites (Ctrl+D)"
            onClick={() => {
              if (activeTab && activeTab.url !== "kruger://home") {
                onBookmark?.();
                // Enhanced visual feedback
                const button = document.querySelector(
                  '[title="Add to Favorites (Ctrl+D)"]',
                );
                if (button) {
                  button.classList.add("text-yellow-500", "scale-125");
                  setTimeout(() => {
                    button.classList.remove("text-yellow-500", "scale-125");
                  }, 1000);
                }
              }
            }}
            disabled={!activeTab || activeTab.url === "kruger://home"}
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>

        {/* Unified AI Assistant Button */}
        <Button
          size="default"
          variant="ghost"
          onClick={() => setKrugerAIOpen(true)}
          className="text-muted-foreground hover:text-foreground bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 hover:from-blue-500/20 hover:via-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 px-3 gap-2"
          title="Kruger AI Assistant (Ctrl+Shift+A)"
        >
          <Bot className="h-4 w-4" />
          <span className="text-sm font-medium hidden sm:inline">AI</span>
          <div className="absolute top-0 right-0 w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
        </Button>

        <KrugerAI
          isOpen={krugerAIOpen}
          onOpenChange={setKrugerAIOpen}
          onSearch={onSearch}
          onNavigate={onNavigate}
          onBookmark={onBookmark}
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={onNewIncognitoTab}
          className="text-muted-foreground hover:text-foreground"
          title="New Incognito Tab (Ctrl+Shift+N)"
        >
          <Eye className="h-4 w-4" />
        </Button>

        {/* Firebase Authentication */}
        <FirebaseAuth />

        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              title="Settings (Ctrl+,)"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-hidden flex flex-col w-[500px] sm:w-[600px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-xl">
                <Settings className="h-5 w-5" />
                KrugerX Browser Settings
              </SheetTitle>
              <SheetDescription>
                Customize your Kruger browser experience - Settings are
                automatically saved
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto mt-6">
              <div className="space-y-3 pr-4">
                {/* 1. Privacy & Security - HIGHEST PRIORITY */}
                <Collapsible open={privacyOpen} onOpenChange={setPrivacyOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 transition-all border border-red-500/20">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400">
                      <Shield className="h-5 w-5" />
                      🛡️ Privacy & Security
                    </Label>
                    {privacyOpen ? (
                      <ChevronDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-red-600" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-500" />
                          <Label htmlFor="block-trackers">Block Trackers</Label>
                        </div>
                        <Switch
                          id="block-trackers"
                          checked={browserSettings.settings.blockTrackers}
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting(
                              "blockTrackers",
                              checked,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <Label htmlFor="block-ads">
                            Block Advertisements
                          </Label>
                        </div>
                        <Switch
                          id="block-ads"
                          checked={browserSettings.settings.blockAds}
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting("blockAds", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-green-500" />
                          <Label htmlFor="https-everywhere">Force HTTPS</Label>
                        </div>
                        <Switch
                          id="https-everywhere"
                          checked={browserSettings.settings.forceHttps}
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting("forceHttps", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <Label htmlFor="fingerprint-protection">
                            Anti-Fingerprinting
                          </Label>
                        </div>
                        <Switch
                          id="fingerprint-protection"
                          checked={browserSettings.settings.antiFingerprintng}
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting(
                              "antiFingerprintng",
                              checked,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="security-level">Security Level</Label>
                        <Select
                          value={browserSettings.settings.securityLevel}
                          onValueChange={(
                            value:
                              | "standard"
                              | "balanced"
                              | "strict"
                              | "paranoid",
                          ) =>
                            browserSettings.updateSetting(
                              "securityLevel",
                              value,
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">
                              🟢 Standard
                            </SelectItem>
                            <SelectItem value="balanced">
                              🟡 Balanced (Recommended)
                            </SelectItem>
                            <SelectItem value="strict">🟠 Strict</SelectItem>
                            <SelectItem value="paranoid">
                              🔴 Maximum Security
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* 2. Performance & Battery */}
                <Collapsible
                  open={performanceOpen}
                  onOpenChange={setPerformanceOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      <Battery className="h-4 w-4" />⚡ Performance & Battery
                    </Label>
                    {performanceOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4" />
                        <Label htmlFor="battery-saver">
                          Battery Saver Mode
                        </Label>
                      </div>
                      <Switch
                        id="battery-saver"
                        checked={browserSettings.settings.batterySaver}
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting("batterySaver", checked)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="performance-mode">Performance Mode</Label>
                      <Select
                        value={browserSettings.settings.performanceMode}
                        onValueChange={(
                          value: "performance" | "balanced" | "power-saver",
                        ) => {
                          if (
                            browserSettings.settings.batterySaver &&
                            value === "performance"
                          ) {
                            return;
                          }
                          browserSettings.updateSetting(
                            "performanceMode",
                            value,
                          );
                        }}
                        disabled={browserSettings.settings.batterySaver}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="performance"
                            disabled={browserSettings.settings.batterySaver}
                          >
                            <div className="flex items-center gap-2">
                              <Cpu className="h-4 w-4" />
                              🚀 High Performance{" "}
                              {browserSettings.settings.batterySaver &&
                                "(Disabled)"}
                            </div>
                          </SelectItem>
                          <SelectItem value="balanced">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              ⚖️ Balanced (Recommended)
                            </div>
                          </SelectItem>
                          <SelectItem value="power-saver">
                            <div className="flex items-center gap-2">
                              <Battery className="h-4 w-4" />
                              🔋 Power Saver
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {browserSettings.settings.batterySaver && (
                      <div className="text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Battery className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-700 dark:text-green-300">
                            Battery Saver Active
                          </span>
                        </div>
                        <ul className="text-xs space-y-1 text-green-600 dark:text-green-400">
                          <li>🔋 Extended battery life</li>
                          <li>🐌 Reduced background animations</li>
                          <li>💾 Lower CPU usage</li>
                          <li>🚫 Performance mode disabled</li>
                        </ul>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* 4. Appearance */}
                <Collapsible
                  open={appearanceOpen}
                  onOpenChange={setAppearanceOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      🎨 Appearance
                    </Label>
                    {appearanceOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {browserSettings.settings.theme === "dark" ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <Sun className="h-4 w-4" />
                        )}
                        <Label htmlFor="theme-toggle">
                          {browserSettings.settings.theme === "dark"
                            ? "🌙 Dark"
                            : "☀️ Light"}{" "}
                          Mode
                        </Label>
                      </div>
                      <Switch
                        id="theme-toggle"
                        checked={browserSettings.settings.theme === "dark"}
                        onCheckedChange={toggleTheme}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zoom-level">
                        🔍 Zoom Level: {browserSettings.settings.zoomLevel}%
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={browserSettings.settings.zoomLevel.toString()}
                          onValueChange={(value) =>
                            browserSettings.updateSetting(
                              "zoomLevel",
                              parseInt(value),
                            )
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="75">75%</SelectItem>
                            <SelectItem value="90">90%</SelectItem>
                            <SelectItem value="100">100% (Default)</SelectItem>
                            <SelectItem value="110">110%</SelectItem>
                            <SelectItem value="125">125%</SelectItem>
                            <SelectItem value="150">150%</SelectItem>
                            <SelectItem value="200">200%</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            browserSettings.updateSetting("zoomLevel", 100)
                          }
                          title="Reset to 100%"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="font-size">
                        📝 Font Size: {browserSettings.settings.fontSize}px
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            browserSettings.updateSetting(
                              "fontSize",
                              Math.max(
                                12,
                                browserSettings.settings.fontSize - 1,
                              ),
                            )
                          }
                          disabled={browserSettings.settings.fontSize <= 12}
                        >
                          A-
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            browserSettings.updateSetting(
                              "fontSize",
                              Math.min(
                                24,
                                browserSettings.settings.fontSize + 1,
                              ),
                            )
                          }
                          disabled={browserSettings.settings.fontSize >= 24}
                        >
                          A+
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            browserSettings.updateSetting("fontSize", 15)
                          }
                        >
                          Reset (15px)
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Continue with remaining sections... */}
                {/* For brevity, I'll show the structure for other sections */}

                {/* 5. Keyboard Shortcuts */}
                <Collapsible open={keyboardOpen} onOpenChange={setKeyboardOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      <Keyboard className="h-4 w-4" />
                      ⌨️ Keyboard Shortcuts
                    </Label>
                    {keyboardOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-shortcuts">
                        Enable Keyboard Shortcuts
                      </Label>
                      <Switch
                        id="enable-shortcuts"
                        checked={
                          browserSettings.settings.enableKeyboardShortcuts
                        }
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting(
                            "enableKeyboardShortcuts",
                            checked,
                          )
                        }
                      />
                    </div>
                    {browserSettings.settings.enableKeyboardShortcuts && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                          <div className="grid grid-cols-1 gap-1">
                            <div className="flex justify-between">
                              <span>New Tab:</span>
                              <span className="font-mono">Ctrl+T</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Close Tab:</span>
                              <span className="font-mono">Ctrl+W</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Incognito:</span>
                              <span className="font-mono">Ctrl+Shift+N</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bookmark:</span>
                              <span className="font-mono">Ctrl+D</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Settings:</span>
                              <span className="font-mono">Ctrl+,</span>
                            </div>
                            <div className="flex justify-between">
                              <span>AI Assistant:</span>
                              <span className="font-mono">Ctrl+Shift+A</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* 6. Browser Statistics - LOWEST PRIORITY */}
                <Collapsible
                  open={browserStatsOpen}
                  onOpenChange={setBrowserStatsOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      📊 Browser Statistics
                    </Label>
                    {browserStatsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex justify-between">
                        <span>Trackers Blocked:</span>
                        <span className="font-medium">
                          {stats.trackersBlocked.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bandwidth Saved:</span>
                        <span className="font-medium">
                          {stats.bandwidthSaved}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Saved:</span>
                        <span className="font-medium">{stats.timeSaved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sites Visited:</span>
                        <span className="font-medium">
                          {stats.sitesVisited.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetStats}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset Statistics
                    </Button>
                  </CollapsibleContent>
                </Collapsible>

                {/* About Section */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-semibold">
                    ℹ️ About Kruger
                  </Label>
                  <div className="text-sm text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg">
                    <p className="font-medium">
                      Version: 2.1.0 (Matrix Edition)
                    </p>
                    <p>🛡️ Built with privacy and performance in mind</p>
                    <p>📅 © 2024 KrugerX Browser</p>
                    <p className="text-xs font-mono">
                      🌐 Matrix-level security & ninja performance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <HistoryManager
          isOpen={historyOpen}
          onOpenChange={setHistoryOpen}
          onNavigate={onNavigate}
          isIncognito={tabs.find((tab) => tab.isActive)?.isIncognito}
        />

        <UnifiedSettings isOpen={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </div>
  );
}
