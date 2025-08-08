import * as React from "react";
import { useState } from "react";
import {
  Settings,
  Shield,
  Zap,
  Moon,
  Sun,
  Lock,
  Globe,
  Accessibility,
  Battery,
  Cpu,
  Wifi,
  Monitor,
  Smartphone,
  Keyboard,
  Trash2,
  RotateCcw,
  Eye,
  Search,
  Download,
  History,
  Bookmark,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Home,
  ArrowLeft,
  ChevronRight,
  Activity,
  Volume2,
  Bell,
  Palette,
  Database,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealStats } from "@/hooks/use-real-stats";
import { useBrowserSettings } from "@/hooks/use-browser-settings";
import { useAccessibility } from "@/hooks/use-accessibility";

interface UnifiedSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsSection =
  | "overview"
  | "privacy"
  | "appearance"
  | "performance"
  | "accessibility"
  | "advanced"
  | "statistics";

export default function UnifiedSettings({
  isOpen,
  onOpenChange,
}: UnifiedSettingsProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("overview");
  const { stats, resetStats } = useRealStats();
  const browserSettings = useBrowserSettings();
  const accessibility = useAccessibility();

  const sections = [
    { id: "overview", label: "Overview", icon: Home, color: "bg-blue-500" },
    {
      id: "privacy",
      label: "Privacy & Security",
      icon: Shield,
      color: "bg-red-500",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      color: "bg-purple-500",
    },
    {
      id: "performance",
      label: "Performance",
      icon: Zap,
      color: "bg-yellow-500",
    },
    {
      id: "accessibility",
      label: "Accessibility",
      icon: Accessibility,
      color: "bg-green-500",
    },
    { id: "advanced", label: "Advanced", icon: Code, color: "bg-orange-500" },
    {
      id: "statistics",
      label: "Statistics",
      icon: TrendingUp,
      color: "bg-indigo-500",
    },
  ];

  const handleResetStats = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all browser statistics? This action cannot be undone.",
      )
    ) {
      resetStats();
    }
  };

  const toggleTheme = () => {
    const newTheme =
      browserSettings.settings.theme === "light" ? "dark" : "light";
    browserSettings.updateSetting("theme", newTheme);
  };

  const handleResetAllSettings = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all settings to default? This action cannot be undone.",
      )
    ) {
      browserSettings.resetSettings();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <Shield className="h-5 w-5" />
            </div>
            Welcome to Kruger Browser
          </CardTitle>
          <CardDescription className="text-base">
            Your privacy-focused browser with Matrix-inspired security. All
            settings are automatically saved.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Shield className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {stats.trackersBlocked.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Trackers Blocked
            </div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.bandwidthSaved}</div>
            <div className="text-sm text-muted-foreground">Bandwidth Saved</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Globe className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {stats.sitesVisited.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Sites Visited</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Activity className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.timeSaved}</div>
            <div className="text-sm text-muted-foreground">Time Saved</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto p-4 flex-col gap-2"
            onClick={() => setActiveSection("privacy")}
          >
            <Shield className="h-6 w-6 text-red-500" />
            <span className="text-sm">Privacy Settings</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex-col gap-2"
            onClick={toggleTheme}
          >
            {browserSettings.settings.theme === "dark" ? (
              <Moon className="h-6 w-6" />
            ) : (
              <Sun className="h-6 w-6" />
            )}
            <span className="text-sm">Toggle Theme</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex-col gap-2"
            onClick={() => setActiveSection("performance")}
          >
            <Battery className="h-6 w-6 text-yellow-500" />
            <span className="text-sm">Performance</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex-col gap-2"
            onClick={() => setActiveSection("statistics")}
          >
            <TrendingUp className="h-6 w-6 text-indigo-500" />
            <span className="text-sm">View Stats</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-4">
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Shield className="h-5 w-5" />
            Privacy Protection
          </CardTitle>
          <CardDescription>
            Core privacy features to protect your browsing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              id: "blockTrackers",
              label: "Block Trackers",
              description: "Prevents websites from tracking your activity",
              icon: Shield,
              color: "text-red-500",
              bg: "bg-red-50 dark:bg-red-950/20",
              value: browserSettings.settings.blockTrackers,
            },
            {
              id: "blockAds",
              label: "Block Advertisements",
              description: "Removes ads for faster browsing",
              icon: Zap,
              color: "text-orange-500",
              bg: "bg-orange-50 dark:bg-orange-950/20",
              value: browserSettings.settings.blockAds,
            },
            {
              id: "forceHttps",
              label: "Force HTTPS",
              description: "Always use secure connections when available",
              icon: Lock,
              color: "text-green-500",
              bg: "bg-green-50 dark:bg-green-950/20",
              value: browserSettings.settings.forceHttps,
            },
            {
              id: "antiFingerprintng",
              label: "Anti-Fingerprinting",
              description: "Prevents browser fingerprinting",
              icon: Eye,
              color: "text-purple-500",
              bg: "bg-purple-50 dark:bg-purple-950/20",
              value: browserSettings.settings.antiFingerprintng,
            },
          ].map((setting) => (
            <div
              key={setting.id}
              className={`flex items-center justify-between p-4 rounded-lg ${setting.bg}`}
            >
              <div className="flex items-center gap-3">
                <setting.icon className={`h-5 w-5 ${setting.color}`} />
                <div>
                  <Label className="font-medium text-base">
                    {setting.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={setting.value}
                onCheckedChange={(checked) =>
                  browserSettings.updateSetting(setting.id as any, checked)
                }
              />
            </div>
          ))}

          <Separator />

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security Level
            </Label>
            <Select
              value={browserSettings.settings.securityLevel}
              onValueChange={(
                value: "standard" | "balanced" | "strict" | "paranoid",
              ) => browserSettings.updateSetting("securityLevel", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Standard - Good for most users
                  </div>
                </SelectItem>
                <SelectItem value="balanced">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    Balanced - Enhanced protection
                  </div>
                </SelectItem>
                <SelectItem value="strict">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-orange-500" />
                    Strict - High security
                  </div>
                </SelectItem>
                <SelectItem value="paranoid">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Paranoid - Maximum protection
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Visual Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              {browserSettings.settings.theme === "dark" ? (
                <Moon className="h-5 w-5 text-blue-400" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <Label className="font-medium text-base">
                  {browserSettings.settings.theme === "dark"
                    ? "Dark Mode"
                    : "Light Mode"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch
              checked={browserSettings.settings.theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Zoom Level: {browserSettings.settings.zoomLevel}%
            </Label>
            <Slider
              value={[browserSettings.settings.zoomLevel]}
              onValueChange={([value]) =>
                browserSettings.updateSetting("zoomLevel", value)
              }
              min={75}
              max={200}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>75%</span>
              <span>100%</span>
              <span>200%</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => browserSettings.updateSetting("zoomLevel", 100)}
              className="w-full"
            >
              Reset to Default (100%)
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Font Size: {browserSettings.settings.fontSize}px
            </Label>
            <Slider
              value={[browserSettings.settings.fontSize]}
              onValueChange={([value]) =>
                browserSettings.updateSetting("fontSize", value)
              }
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>12px</span>
              <span>16px</span>
              <span>24px</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-4">
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <Battery className="h-5 w-5" />
            Performance & Battery
          </CardTitle>
          <CardDescription>
            Optimize browser performance and battery usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-center gap-3">
              <Battery className="h-5 w-5 text-yellow-500" />
              <div>
                <Label className="font-medium text-base">
                  Battery Saver Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Reduces performance to save battery
                </p>
              </div>
            </div>
            <Switch
              checked={browserSettings.settings.batterySaver}
              onCheckedChange={(checked) =>
                browserSettings.updateSetting("batterySaver", checked)
              }
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Performance Mode
            </Label>
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
                browserSettings.updateSetting("performanceMode", value);
              }}
              disabled={browserSettings.settings.batterySaver}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="power-saver">
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4 text-green-500" />
                    Power Saver - Maximum battery life
                  </div>
                </SelectItem>
                <SelectItem value="balanced">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Balanced - Good performance & battery
                  </div>
                </SelectItem>
                <SelectItem
                  value="performance"
                  disabled={browserSettings.settings.batterySaver}
                >
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-red-500" />
                    High Performance{" "}
                    {browserSettings.settings.batterySaver && "(Disabled)"}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {browserSettings.settings.batterySaver && (
              <div className="text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <Info className="h-4 w-4 inline mr-1" />
                Battery saver mode is active. High performance mode is disabled
                to save power.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-4">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <Code className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>Advanced features for power users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-3">
              <Keyboard className="h-5 w-5 text-orange-500" />
              <div>
                <Label className="font-medium text-base">
                  Keyboard Shortcuts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable advanced keyboard shortcuts
                </p>
              </div>
            </div>
            <Switch
              checked={browserSettings.settings.enableKeyboardShortcuts}
              onCheckedChange={(checked) =>
                browserSettings.updateSetting(
                  "enableKeyboardShortcuts",
                  checked,
                )
              }
            />
          </div>

          {browserSettings.settings.enableKeyboardShortcuts && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Ctrl+T - New Tab</div>
                <div>Ctrl+Shift+N - Incognito</div>
                <div>Ctrl+W - Close Tab</div>
                <div>Ctrl+, - Settings</div>
                <div>Ctrl+H - History</div>
                <div>Ctrl+D - Bookmark</div>
                <div>Ctrl+L - Address Bar</div>
                <div>Ctrl+R - Reload</div>
              </CardContent>
            </Card>
          )}

          <Separator />

          <div className="space-y-3">
            <Label className="text-base font-medium text-red-600 dark:text-red-400">
              🚨 Danger Zone
            </Label>
            <Button
              variant="outline"
              onClick={handleResetAllSettings}
              className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All Settings to Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStatistics = () => (
    <div className="space-y-4">
      <Card className="border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-5 w-5" />
            Browser Statistics
          </CardTitle>
          <CardDescription>
            Your privacy and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-6 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <Shield className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.trackersBlocked.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Trackers Blocked
              </div>
            </div>
            <div className="text-center p-6 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <Zap className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.bandwidthSaved}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Bandwidth Saved
              </div>
            </div>
            <div className="text-center p-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <Globe className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.sitesVisited.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Sites Visited
              </div>
            </div>
            <div className="text-center p-6 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <Search className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.searchesPerformed?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Searches Made
              </div>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                ⏱️ {stats.timeSaved} Time Saved
              </div>
              <div className="text-sm text-muted-foreground">
                Thanks to ad blocking and faster loading times
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            onClick={handleResetStats}
            className="w-full text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Reset All Statistics
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "privacy":
        return renderPrivacy();
      case "appearance":
        return renderAppearance();
      case "performance":
        return renderPerformance();
      case "accessibility":
        return renderAccessibility();
      case "advanced":
        return renderAdvanced();
      case "statistics":
        return renderStatistics();
      default:
        return renderOverview();
    }
  };

  const renderAccessibility = () => (
    <div className="space-y-4">
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Accessibility className="h-5 w-5" />
            Accessibility Features
          </CardTitle>
          <CardDescription>
            Make the browser more accessible for everyone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              id: "highContrast",
              label: "High Contrast Mode",
              description: "Increase contrast for better visibility",
              icon: Monitor,
              value: browserSettings.settings.highContrast,
            },
            {
              id: "largeText",
              label: "Large Text",
              description: "Increase text size for better readability",
              icon: Monitor,
              value: browserSettings.settings.largeText,
            },
            {
              id: "reducedMotion",
              label: "Reduced Motion",
              description: "Minimize animations and transitions",
              icon: Activity,
              value: browserSettings.settings.reducedMotion,
            },
            {
              id: "screenReader",
              label: "Screen Reader Support",
              description: "Enhanced support for screen readers",
              icon: Volume2,
              value: browserSettings.settings.screenReader,
            },
          ].map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20"
            >
              <div className="flex items-center gap-3">
                <setting.icon className="h-5 w-5 text-green-500" />
                <div>
                  <Label className="font-medium text-base">
                    {setting.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={setting.value}
                onCheckedChange={(checked) =>
                  browserSettings.updateSetting(setting.id as any, checked)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[900px] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/30 p-4 space-y-2">
            <div className="mb-6">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  Settings
                </SheetTitle>
                <SheetDescription className="text-sm">
                  Kruger Browser v2.1.0
                </SheetDescription>
              </SheetHeader>
            </div>

            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-1">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={
                      activeSection === section.id ? "secondary" : "ghost"
                    }
                    className={`w-full justify-start gap-3 h-auto p-3 ${
                      activeSection === section.id
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() =>
                      setActiveSection(section.id as SettingsSection)
                    }
                  >
                    <div
                      className={`p-1.5 rounded-md ${section.color} bg-opacity-20`}
                    >
                      <section.icon
                        className={`h-4 w-4 ${section.color.replace("bg-", "text-")}`}
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">{section.label}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-6">{renderContent()}</ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
