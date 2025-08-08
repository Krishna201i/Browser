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
import { useWidgets } from "@/hooks/use-widgets";
import DownloadManager from "./DownloadManager";
import BookmarkManager from "./BookmarkManager";
import KrugerAI from "./KrugerAI";

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

  // Collapsible states for settings sections
  const [appearanceOpen, setAppearanceOpen] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [vpnSettingsOpen, setVpnSettingsOpen] = useState(false);
  const [historySettingsOpen, setHistorySettingsOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [browserStatsOpen, setBrowserStatsOpen] = useState(false);

  const { stats, resetStats } = useRealStats();
  const accessibility = useAccessibility();
  const vpn = useVPN();
  const auth = useAuth();
  const device = useDevice();
  const historyHook = useHistory();
  const browserSettings = useBrowserSettings();
  const widgets = useWidgets();

  const toggleTheme = () => {
    const newTheme =
      browserSettings.settings.theme === "light" ? "dark" : "light";
    browserSettings.updateSetting("theme", newTheme);
  };

  // Keyboard shortcuts effect
  React.useEffect(() => {
    if (!browserSettings.settings.enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Check for various shortcuts
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
      } else if (isCtrl && e.key === "d") {
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
      } else if (isAlt && e.key === "h") {
        e.preventDefault();
        accessibility.toggleHighContrast();
      } else if (isAlt && e.key === "d") {
        e.preventDefault();
        toggleTheme();
      } else if ((isCtrl && e.key === "=") || (isCtrl && e.key === "+")) {
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

        <div className="flex-1 bg-background rounded-lg px-3 py-2 text-sm">
          {activeTab ? activeTab.url : "kruger://home"}
        </div>

        {/* Additional Controls */}
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
            className={`text-muted-foreground hover:text-foreground ${
              activeTab && activeTab.url !== "kruger://home"
                ? "hover:text-yellow-500"
                : ""
            }`}
            title="Add to Favorites (Ctrl+D)"
            onClick={() => {
              if (activeTab && activeTab.url !== "kruger://home") {
                onBookmark?.();
                // Visual feedback
                const button = document.querySelector(
                  '[title="Add to Favorites (Ctrl+D)"]',
                );
                if (button) {
                  button.classList.add("text-yellow-500");
                  setTimeout(() => {
                    button.classList.remove("text-yellow-500");
                  }, 1000);
                }
              }
            }}
            disabled={!activeTab || activeTab.url === "kruger://home"}
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>

        {/* Single Small AI Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setKrugerAIOpen(true)}
          className="text-muted-foreground hover:text-foreground bg-gradient-to-r from-cyan-500/10 to-green-500/10 hover:from-cyan-500/20 hover:to-green-500/20 border border-cyan-500/20"
          title="AI Assistant (Ctrl+Shift+A)"
        >
          <Bot className="h-3 w-3" />
        </Button>

        {/* Kruger AI Dialog */}
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
              <SheetTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Kruger Settings
              </SheetTitle>
              <SheetDescription>
                Customize your Kruger browser experience with persistent
                settings
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto mt-6">
              <div className="space-y-4 pr-4">
                {/* Appearance Section - Collapsible */}
                <Collapsible
                  open={appearanceOpen}
                  onOpenChange={setAppearanceOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer">
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
                            ? "Dark"
                            : "Light"}{" "}
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
                        Zoom Level: {browserSettings.settings.zoomLevel}%
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
                            <SelectItem value="100">100%</SelectItem>
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
                          100%
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="font-size">
                        Font Size: {browserSettings.settings.fontSize}px
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
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Privacy & Security Section - Collapsible */}
                <Collapsible open={privacyOpen} onOpenChange={setPrivacyOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Privacy & Security
                    </Label>
                    {privacyOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <Label htmlFor="dns-protection">Secure DNS</Label>
                        </div>
                        <Switch
                          id="dns-protection"
                          checked={browserSettings.settings.secureDns}
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting("secureDns", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <Label htmlFor="social-blocking">
                            Block Social Trackers
                          </Label>
                        </div>
                        <Switch
                          id="social-blocking"
                          checked={browserSettings.settings.blockSocialTrackers}
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting(
                              "blockSocialTrackers",
                              checked,
                            )
                          }
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Advanced Security Section - Collapsible */}
                <Collapsible open={securityOpen} onOpenChange={setSecurityOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Advanced Security
                    </Label>
                    {securityOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="script-blocking">
                          Block Dangerous Scripts
                        </Label>
                        <Switch
                          id="script-blocking"
                          checked={
                            browserSettings.settings.blockDangerousScripts
                          }
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting(
                              "blockDangerousScripts",
                              checked,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="cookie-protection">
                          Enhanced Cookie Protection
                        </Label>
                        <Switch
                          id="cookie-protection"
                          checked={
                            browserSettings.settings.enhancedCookieProtection
                          }
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting(
                              "enhancedCookieProtection",
                              checked,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="referrer-protection">
                          Hide Referrer Information
                        </Label>
                        <Switch
                          id="referrer-protection"
                          checked={
                            browserSettings.settings.hideReferrerInformation
                          }
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting(
                              "hideReferrerInformation",
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
                            <SelectValue placeholder="Select security level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="balanced">
                              Balanced (Recommended)
                            </SelectItem>
                            <SelectItem value="strict">Strict</SelectItem>
                            <SelectItem value="paranoid">
                              Maximum Security
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Accessibility Section - Collapsible */}
                <Collapsible
                  open={accessibilityOpen}
                  onOpenChange={setAccessibilityOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      <Accessibility className="h-4 w-4" />
                      Accessibility
                    </Label>
                    {accessibilityOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="high-contrast">
                          High Contrast Mode
                        </Label>
                        <Switch
                          id="high-contrast"
                          checked={accessibility.settings.highContrast}
                          onCheckedChange={accessibility.toggleHighContrast}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="large-text">Large Text</Label>
                        <Switch
                          id="large-text"
                          checked={accessibility.settings.largeText}
                          onCheckedChange={accessibility.toggleLargeText}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="reduced-motion">Reduce Motion</Label>
                        <Switch
                          id="reduced-motion"
                          checked={accessibility.settings.reducedMotion}
                          onCheckedChange={accessibility.toggleReducedMotion}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="screen-reader">
                          Screen Reader Support
                        </Label>
                        <Switch
                          id="screen-reader"
                          checked={accessibility.settings.screenReader}
                          onCheckedChange={accessibility.toggleScreenReader}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Performance & Battery Section - Collapsible */}
                <Collapsible
                  open={performanceOpen}
                  onOpenChange={setPerformanceOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      <Battery className="h-4 w-4" />
                      Performance & Battery
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
                          // If battery saver is on, disable performance mode
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
                              High Performance{" "}
                              {browserSettings.settings.batterySaver &&
                                "(Disabled in Battery Saver)"}
                            </div>
                          </SelectItem>
                          <SelectItem value="balanced">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Balanced (Recommended)
                            </div>
                          </SelectItem>
                          <SelectItem value="power-saver">
                            <div className="flex items-center gap-2">
                              <Battery className="h-4 w-4" />
                              Power Saver
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {browserSettings.settings.batterySaver && (
                      <div className="text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Battery className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            Battery Saver Active
                          </span>
                        </div>
                        <ul className="text-xs space-y-1">
                          <li>• Reduced background animations</li>
                          <li>• Lower CPU usage</li>
                          <li>• Optimized rendering</li>
                          <li>• Performance mode disabled</li>
                          <li>• Extended battery life</li>
                        </ul>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Keyboard Shortcuts Section - Collapsible */}
                <Collapsible open={keyboardOpen} onOpenChange={setKeyboardOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      <Keyboard className="h-4 w-4" />
                      Keyboard Shortcuts
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
                    <div className="space-y-2">
                      <Label htmlFor="shortcut-scheme">Shortcut Scheme</Label>
                      <Select
                        value={browserSettings.settings.shortcutScheme}
                        onValueChange={(
                          value: "default" | "vim" | "emacs" | "custom",
                        ) =>
                          browserSettings.updateSetting("shortcutScheme", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">
                            Default Browser
                          </SelectItem>
                          <SelectItem value="vim">Vim-style</SelectItem>
                          <SelectItem value="emacs">Emacs-style</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {browserSettings.settings.enableKeyboardShortcuts && (
                      <div className="text-xs text-muted-foreground space-y-1 max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-1">
                          {Object.entries(browserSettings.keyboardShortcuts)
                            .slice(0, 15)
                            .map(([key, shortcut]) => (
                              <div key={key} className="flex justify-between">
                                <span>{shortcut.description}:</span>
                                <span className="font-mono text-xs">
                                  {shortcut.default}
                                </span>
                              </div>
                            ))}
                        </div>
                        <div className="text-center pt-2">
                          <span className="text-xs text-muted-foreground">
                            ...and{" "}
                            {Object.keys(browserSettings.keyboardShortcuts)
                              .length - 15}{" "}
                            more shortcuts
                          </span>
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Device Adaptation Section - Collapsible */}
                <Collapsible open={deviceOpen} onOpenChange={setDeviceOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Device Adaptation
                    </Label>
                    {deviceOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      <div className="grid grid-cols-1 gap-1">
                        <div className="flex items-center gap-2">
                          {device.deviceInfo.type === "mobile" && (
                            <Smartphone className="h-4 w-4" />
                          )}
                          {device.deviceInfo.type === "tablet" && (
                            <Tablet className="h-4 w-4" />
                          )}
                          {device.deviceInfo.type === "laptop" && (
                            <Laptop className="h-4 w-4" />
                          )}
                          {device.deviceInfo.type === "desktop" && (
                            <Monitor className="h-4 w-4" />
                          )}
                          <span>
                            Device:{" "}
                            {device.deviceInfo.type.charAt(0).toUpperCase() +
                              device.deviceInfo.type.slice(1)}
                          </span>
                        </div>
                        <div>
                          Screen: {device.deviceInfo.screenWidth}x
                          {device.deviceInfo.screenHeight}
                        </div>
                        <div>
                          Touch:{" "}
                          {device.deviceInfo.isTouch
                            ? "Supported"
                            : "Not Available"}
                        </div>
                        <div>
                          Orientation:{" "}
                          {device.deviceInfo.screenWidth >
                          device.deviceInfo.screenHeight
                            ? "Landscape"
                            : "Portrait"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="adaptive-ui">Adaptive UI</Label>
                      <Switch
                        id="adaptive-ui"
                        checked={browserSettings.settings.adaptiveUI}
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting("adaptiveUI", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="responsive-layout">
                        Responsive Layout
                      </Label>
                      <Switch
                        id="responsive-layout"
                        checked={browserSettings.settings.responsiveLayout}
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting(
                            "responsiveLayout",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="touch-optimization">
                        Touch Optimization
                      </Label>
                      <Switch
                        id="touch-optimization"
                        checked={browserSettings.settings.touchOptimization}
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting(
                            "touchOptimization",
                            checked,
                          )
                        }
                        disabled={!device.deviceInfo.isTouch}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="screen-optimization">
                        Screen Size Optimization
                      </Label>
                      <Switch
                        id="screen-optimization"
                        checked={
                          browserSettings.settings.screenSizeOptimization
                        }
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting(
                            "screenSizeOptimization",
                            checked,
                          )
                        }
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Advanced VPN Settings - Collapsible */}
                <Collapsible
                  open={vpnSettingsOpen}
                  onOpenChange={setVpnSettingsOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      🛡️ VPN & Privacy
                    </Label>
                    {vpnSettingsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${vpn.settings.isConnected ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          <Label>VPN Status</Label>
                        </div>
                        <Button
                          size="sm"
                          onClick={vpn.toggleConnection}
                          disabled={vpn.isConnecting}
                          className={
                            vpn.settings.isConnected
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          }
                        >
                          {vpn.isConnecting
                            ? "Connecting..."
                            : vpn.settings.isConnected
                              ? "Connected"
                              : "Disconnected"}
                        </Button>
                      </div>

                      {vpn.settings.currentServer && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Server:</span>
                              <span>
                                {vpn.settings.currentServer.flag}{" "}
                                {vpn.settings.currentServer.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className="text-green-500">
                                {vpn.getConnectionStatus()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Upload:</span>
                              <span>
                                {vpn.formatBytes(
                                  vpn.settings.bytesTransferred.upload,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Download:</span>
                              <span>
                                {vpn.formatBytes(
                                  vpn.settings.bytesTransferred.download,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="vpn-protocol">VPN Protocol</Label>
                        <Select
                          value={vpn.settings.protocol}
                          onValueChange={(
                            value: "OpenVPN" | "WireGuard" | "IKEv2",
                          ) => vpn.updateSetting("protocol", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WireGuard">
                              WireGuard (Fastest)
                            </SelectItem>
                            <SelectItem value="OpenVPN">
                              OpenVPN (Most Compatible)
                            </SelectItem>
                            <SelectItem value="IKEv2">
                              IKEv2 (Mobile Optimized)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="vpn-auto-connect">
                          Auto Connect on Startup
                        </Label>
                        <Switch
                          id="vpn-auto-connect"
                          checked={vpn.settings.autoConnect}
                          onCheckedChange={(checked) =>
                            vpn.updateSetting("autoConnect", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="vpn-kill-switch">
                          Kill Switch (Block traffic if VPN drops)
                        </Label>
                        <Switch
                          id="vpn-kill-switch"
                          checked={vpn.settings.killSwitch}
                          onCheckedChange={(checked) =>
                            vpn.updateSetting("killSwitch", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="vpn-dns-leak">
                          DNS Leak Protection
                        </Label>
                        <Switch
                          id="vpn-dns-leak"
                          checked={vpn.settings.dnsLeakProtection}
                          onCheckedChange={(checked) =>
                            vpn.updateSetting("dnsLeakProtection", checked)
                          }
                        />
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        <Globe className="h-4 w-4 mr-2" />
                        Choose Server Location
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* History Management - Collapsible */}
                <Collapsible
                  open={historySettingsOpen}
                  onOpenChange={setHistorySettingsOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Browsing History
                    </Label>
                    {historySettingsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="space-y-3">
                      {/* History Stats */}
                      <div className="bg-muted p-3 rounded-lg text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            Total Sites:{" "}
                            {historyHook.getHistoryStats().totalEntries}
                          </div>
                          <div>
                            Today: {historyHook.getHistoryStats().todayVisits}
                          </div>
                          <div>
                            Unique: {historyHook.getHistoryStats().uniqueSites}
                          </div>
                          <div>
                            Visits: {historyHook.getHistoryStats().totalVisits}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setHistoryOpen(true)}
                      >
                        <History className="h-4 w-4 mr-2" />
                        View Full History ({historyHook.history.length})
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => historyHook.clearHistory("day")}
                        >
                          Clear Today
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (
                              confirm(
                                "Clear all browsing history? This cannot be undone.",
                              )
                            ) {
                              historyHook.clearHistory("all");
                            }
                          }}
                        >
                          Clear All
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="save-history">Save History</Label>
                        <Switch
                          id="save-history"
                          checked={historyHook.settings.saveHistory}
                          onCheckedChange={(checked) =>
                            historyHook.updateSettings("saveHistory", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="exclude-incognito">
                          Exclude Incognito
                        </Label>
                        <Switch
                          id="exclude-incognito"
                          checked={historyHook.settings.excludeIncognito}
                          onCheckedChange={(checked) =>
                            historyHook.updateSettings(
                              "excludeIncognito",
                              checked,
                            )
                          }
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

              {/* Widgets Section - Collapsible */}
              <Collapsible open={widgetsOpen} onOpenChange={setWidgetsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                    🧩 Widgets
                  </Label>
                  {widgetsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-4">
                  {/* Widget Display Preview */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Label className="text-sm font-medium mb-3 block">Widget Preview</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {widgets.settings.enabledWidgets.slice(0, 4).map((widgetId) => {
                        const widgetInfo = widgets.availableWidgets.find(w => w.id === widgetId);
                        const widgetData = widgets.getWidgetData(widgetId, stats);

                        if (!widgetInfo || !widgetData) return null;

                        return (
                          <div key={widgetId} className="bg-background p-3 rounded-lg border text-center">
                            <div className="text-lg mb-1">{widgetInfo.icon}</div>
                            <div className="text-xs text-muted-foreground mb-1">{widgetInfo.title}</div>
                            {widgetData.type === 'clock' && (
                              <div className="text-sm font-mono">{widgetData.data.time}</div>
                            )}
                            {widgetData.type === 'calendar' && (
                              <div className="text-xs">
                                <div className="font-medium">{widgetData.data.day}</div>
                                <div>{widgetData.data.month}</div>
                              </div>
                            )}
                            {widgetData.type === 'counter' && (
                              <div className="text-sm">
                                <div className="font-bold">{widgetData.data.count.toLocaleString()}</div>
                                <div className="text-xs text-green-500">{widgetData.data.trend}</div>
                              </div>
                            )}
                            {widgetData.type === 'stats' && (
                              <div className="text-sm">
                                <div className="font-medium">{widgetData.data.value}</div>
                                <div className="text-xs text-green-500">{widgetData.data.trend}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Widget Configuration */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Available Widgets</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {widgets.availableWidgets.map((widget) => (
                        <div key={widget.id} className="flex items-center justify-between p-2 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{widget.icon}</span>
                            <div>
                              <div className="text-sm font-medium">{widget.title}</div>
                              <div className="text-xs text-muted-foreground">{widget.description}</div>
                            </div>
                          </div>
                          <Switch
                            checked={widgets.settings.enabledWidgets.includes(widget.id)}
                            onCheckedChange={() => widgets.toggleWidget(widget.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clock Settings */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Clock Settings</Label>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="clock-format">24-Hour Format</Label>
                      <Switch
                        id="clock-format"
                        checked={widgets.settings.clockFormat === '24h'}
                        onCheckedChange={(checked) =>
                          widgets.updateSetting('clockFormat', checked ? '24h' : '12h')
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-seconds">Show Seconds</Label>
                      <Switch
                        id="show-seconds"
                        checked={widgets.settings.showSeconds}
                        onCheckedChange={(checked) =>
                          widgets.updateSetting('showSeconds', checked)
                        }
                      />
                    </div>
                  </div>

                  {/* Date Settings */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Date Settings</Label>
                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select
                        value={widgets.settings.dateFormat}
                        onValueChange={(value: 'short' | 'long' | 'iso') =>
                          widgets.updateSetting('dateFormat', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (Jan 1, 2024)</SelectItem>
                          <SelectItem value="long">Long (Monday, January 1, 2024)</SelectItem>
                          <SelectItem value="iso">ISO (2024-01-01)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Widget Display Settings */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Display Settings</Label>
                    <div className="space-y-2">
                      <Label htmlFor="widget-size">Widget Size</Label>
                      <Select
                        value={widgets.settings.widgetSize}
                        onValueChange={(value: 'small' | 'medium' | 'large') =>
                          widgets.updateSetting('widgetSize', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refresh-interval">Refresh Interval</Label>
                      <Select
                        value={widgets.settings.refreshInterval.toString()}
                        onValueChange={(value) =>
                          widgets.updateSetting('refreshInterval', parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">1 second</SelectItem>
                          <SelectItem value="5000">5 seconds</SelectItem>
                          <SelectItem value="10000">10 seconds</SelectItem>
                          <SelectItem value="30000">30 seconds</SelectItem>
                          <SelectItem value="60000">1 minute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Widget Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // Enable all widgets
                        const allIds = widgets.availableWidgets.map(w => w.id);
                        widgets.updateSetting('enabledWidgets', allIds);
                      }}
                    >
                      Enable All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // Disable all widgets
                        widgets.updateSetting('enabledWidgets', []);
                      }}
                    >
                      Disable All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={widgets.resetSettings}
                    >
                      Reset
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Advanced Features - Collapsible */}
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Label className="text-base font-semibold cursor-pointer flex items-center gap-2">
                      ⚙️ Advanced Features
                    </Label>
                    {advancedOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-ai">AI Assistant</Label>
                      <Switch
                        id="enable-ai"
                        checked={browserSettings.settings.enableAI}
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting("enableAI", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="voice-control">Voice Control</Label>
                      <Switch
                        id="voice-control"
                        checked={browserSettings.settings.voiceControl}
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting("voiceControl", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autofill">Autofill</Label>
                      <Switch
                        id="autofill"
                        checked={browserSettings.settings.autofillEnabled}
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting(
                            "autofillEnabled",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-manager">Password Manager</Label>
                      <Switch
                        id="password-manager"
                        checked={
                          browserSettings.settings.passwordManagerEnabled
                        }
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting(
                            "passwordManagerEnabled",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">
                        Enable Notifications
                      </Label>
                      <Switch
                        id="notifications"
                        checked={browserSettings.settings.enableNotifications}
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting(
                            "enableNotifications",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="popup-blocking">Popup Blocking</Label>
                      <Switch
                        id="popup-blocking"
                        checked={browserSettings.settings.enablePopupBlocking}
                        onCheckedChange={(checked) =>
                          browserSettings.updateSetting(
                            "enablePopupBlocking",
                            checked,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="search-engine">
                        Default Search Engine
                      </Label>
                      <Select
                        value={browserSettings.settings.defaultSearchEngine}
                        onValueChange={(value) =>
                          browserSettings.updateSetting(
                            "defaultSearchEngine",
                            value,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="bing">Bing</SelectItem>
                          <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                          <SelectItem value="yahoo">Yahoo</SelectItem>
                          <SelectItem value="startpage">Startpage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const exported = browserSettings.exportSettings();
                          navigator.clipboard.writeText(exported);
                        }}
                      >
                        Export Settings
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const settings = prompt("Paste settings JSON:");
                          if (settings) {
                            browserSettings.importSettings(settings);
                          }
                        }}
                      >
                        Import Settings
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Browser Statistics - Moved to end */}
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
                      <div className="flex justify-between">
                        <span>Searches Performed:</span>
                        <span className="font-medium">
                          {stats.searchesPerformed.toLocaleString()}
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

                {/* About - Simple section at end */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-semibold">
                    About Kruger
                  </Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Version: 2.1.0 (Matrix Edition)</p>
                    <p>Built with privacy and performance in mind</p>
                    <p>© 2024 Kruger Browser</p>
                    <p className="text-xs">
                      🌐 Matrix-level security & ninja performance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
