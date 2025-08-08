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
  Users,
  Bot,
  Battery,
  Cpu,
  Wifi,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Keyboard,
  ChevronDown,
  ChevronRight,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealStats } from "@/hooks/use-real-stats";
import { useBrowserSettings } from "@/hooks/use-browser-settings";
import { useAccessibility } from "@/hooks/use-accessibility";

interface EnhancedSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EnhancedSettings({
  isOpen,
  onOpenChange,
}: EnhancedSettingsProps) {
  const { stats, resetStats } = useRealStats();
  const browserSettings = useBrowserSettings();
  const accessibility = useAccessibility();

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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden flex flex-col w-[600px] sm:w-[700px]">
        <SheetHeader className="space-y-3">
          <SheetTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">Kruger Browser Settings</div>
              <div className="text-sm text-muted-foreground font-normal">
                Matrix Edition v2.1.0
              </div>
            </div>
          </SheetTitle>
          <SheetDescription className="text-base">
            Customize your privacy-focused browsing experience. All settings are
            automatically saved.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden mt-6">
          <Tabs defaultValue="privacy" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="privacy" className="text-xs">
                <Shield className="h-4 w-4 mr-1" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="appearance" className="text-xs">
                <Monitor className="h-4 w-4 mr-1" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">
                <Zap className="h-4 w-4 mr-1" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs">
                <Settings className="h-4 w-4 mr-1" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">
                <TrendingUp className="h-4 w-4 mr-1" />
                Stats
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto space-y-1">
              {/* Privacy & Security Tab */}
              <TabsContent value="privacy" className="space-y-4 mt-0">
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <Shield className="h-5 w-5" />
                      Privacy Protection
                    </CardTitle>
                    <CardDescription>
                      Core privacy features to protect your browsing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                        <div className="flex items-center gap-3">
                          <Shield className="h-4 w-4 text-red-500" />
                          <div>
                            <Label className="font-medium">
                              Block Trackers
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Prevents websites from tracking your activity
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={browserSettings.settings.blockTrackers}
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting(
                              "blockTrackers",
                              checked,
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                        <div className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <div>
                            <Label className="font-medium">
                              Block Advertisements
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Removes ads for faster browsing
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={browserSettings.settings.blockAds}
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting("blockAds", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                        <div className="flex items-center gap-3">
                          <Lock className="h-4 w-4 text-green-500" />
                          <div>
                            <Label className="font-medium">Force HTTPS</Label>
                            <p className="text-xs text-muted-foreground">
                              Always use secure connections when available
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={browserSettings.settings.forceHttps}
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting("forceHttps", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                        <div className="flex items-center gap-3">
                          <Eye className="h-4 w-4 text-purple-500" />
                          <div>
                            <Label className="font-medium">
                              Anti-Fingerprinting
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Prevents browser fingerprinting
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={browserSettings.settings.antiFingerprintng}
                          onCheckedChange={(checked) =>
                            browserSettings.updateSetting(
                              "antiFingerprintng",
                              checked,
                            )
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Security Level
                      </Label>
                      <Select
                        value={browserSettings.settings.securityLevel}
                        onValueChange={(
                          value:
                            | "standard"
                            | "balanced"
                            | "strict"
                            | "paranoid",
                        ) =>
                          browserSettings.updateSetting("securityLevel", value)
                        }
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
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-4 mt-0">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Visual Appearance
                    </CardTitle>
                    <CardDescription>
                      Customize the look and feel of your browser
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        {browserSettings.settings.theme === "dark" ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <Sun className="h-4 w-4" />
                        )}
                        <div>
                          <Label className="font-medium">
                            {browserSettings.settings.theme === "dark"
                              ? "Dark Mode"
                              : "Light Mode"}
                          </Label>
                          <p className="text-xs text-muted-foreground">
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
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Zoom Level: {browserSettings.settings.zoomLevel}%
                      </Label>
                      <div className="space-y-2">
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
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>75%</span>
                          <span>100%</span>
                          <span>200%</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          browserSettings.updateSetting("zoomLevel", 100)
                        }
                        className="w-full"
                      >
                        Reset to Default
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Font Size: {browserSettings.settings.fontSize}px
                      </Label>
                      <div className="space-y-2">
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
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>12px</span>
                          <span>16px</span>
                          <span>24px</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4 mt-0">
                <Card className="border-yellow-200 dark:border-yellow-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <Battery className="h-5 w-5" />
                      Performance & Battery
                    </CardTitle>
                    <CardDescription>
                      Optimize browser performance and battery usage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                      <div className="flex items-center gap-3">
                        <Battery className="h-4 w-4 text-yellow-500" />
                        <div>
                          <Label className="font-medium">
                            Battery Saver Mode
                          </Label>
                          <p className="text-xs text-muted-foreground">
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
                      <Label className="text-sm font-medium flex items-center gap-2">
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
                              {browserSettings.settings.batterySaver &&
                                "(Disabled)"}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {browserSettings.settings.batterySaver && (
                        <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <Info className="h-4 w-4 inline mr-1" />
                          Battery saver mode is active. High performance mode is
                          disabled to save power.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4 mt-0">
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Settings className="h-5 w-5" />
                      Advanced Settings
                    </CardTitle>
                    <CardDescription>
                      Advanced features for power users
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                      <div className="flex items-center gap-3">
                        <Keyboard className="h-4 w-4 text-purple-500" />
                        <div>
                          <Label className="font-medium">
                            Keyboard Shortcuts
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Enable advanced keyboard shortcuts
                          </p>
                        </div>
                      </div>
                      <Switch
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
                      <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                        <Label className="text-sm font-medium">
                          Keyboard Shortcuts:
                        </Label>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>Ctrl+T - New Tab</div>
                          <div>Ctrl+Shift+N - Incognito</div>
                          <div>Ctrl+W - Close Tab</div>
                          <div>Ctrl+, - Settings</div>
                          <div>Ctrl+H - History</div>
                          <div>Ctrl+D - Bookmark</div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-red-600 dark:text-red-400">
                        Danger Zone
                      </Label>
                      <Button
                        variant="outline"
                        onClick={handleResetAllSettings}
                        className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset All Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="stats" className="space-y-4 mt-0">
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <TrendingUp className="h-5 w-5" />
                      Browser Statistics
                    </CardTitle>
                    <CardDescription>
                      Your privacy and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                        <Shield className="h-6 w-6 text-red-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                          {stats.trackersBlocked.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Trackers Blocked
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                        <Zap className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                          {stats.bandwidthSaved}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Bandwidth Saved
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <Globe className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                          {stats.sitesVisited.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sites Visited
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                        <Search className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                          {stats.searchesPerformed?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Searches Made
                        </div>
                      </div>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                      <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        ⏱️ Time Saved: {stats.timeSaved}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Thanks to ad blocking and faster loading
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleResetStats}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset Statistics
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
