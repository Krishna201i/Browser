import * as React from "react";
import { useState, useEffect, useCallback } from "react";

export interface WidgetSettings {
  enabledWidgets: string[];
  widgetPositions: Record<string, { x: number; y: number }>;
  clockFormat: "12h" | "24h";
  dateFormat: "short" | "long" | "iso";
  showSeconds: boolean;
  refreshInterval: number;
  widgetSize: "small" | "medium" | "large";
  theme: "light" | "dark" | "auto";
}

export interface WidgetData {
  id: string;
  title: string;
  type: "clock" | "calendar" | "stats" | "counter";
  data: any;
  lastUpdated: Date;
}

const defaultSettings: WidgetSettings = {
  enabledWidgets: ["clock", "calendar", "trackers-blocked", "bandwidth-saved"],
  widgetPositions: {
    clock: { x: 0, y: 0 },
    calendar: { x: 1, y: 0 },
    "trackers-blocked": { x: 0, y: 1 },
    "bandwidth-saved": { x: 1, y: 1 },
    "time-saved": { x: 0, y: 2 },
    "active-users": { x: 1, y: 2 },
    "sites-visited": { x: 0, y: 3 },
  },
  clockFormat: "12h",
  dateFormat: "long",
  showSeconds: true,
  refreshInterval: 1000,
  widgetSize: "medium",
  theme: "auto",
};

export function useWidgets() {
  const [settings, setSettings] = useState<WidgetSettings>(defaultSettings);
  const [widgets, setWidgets] = useState<WidgetData[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kruger-widget-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load widget settings:", error);
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("kruger-widget-settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save widget settings:", error);
    }
  }, [settings]);

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [settings.refreshInterval]);

  // Format time based on settings
  const formatTime = useCallback(
    (date: Date) => {
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: settings.clockFormat === "12h",
      };

      if (settings.showSeconds) {
        options.second = "2-digit";
      }

      return date.toLocaleTimeString(undefined, options);
    },
    [settings.clockFormat, settings.showSeconds],
  );

  // Format date based on settings
  const formatDate = useCallback(
    (date: Date) => {
      switch (settings.dateFormat) {
        case "short":
          return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        case "long":
          return date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        case "iso":
          return date.toISOString().split("T")[0];
        default:
          return date.toLocaleDateString();
      }
    },
    [settings.dateFormat],
  );

  // Available widget types
  const availableWidgets = [
    {
      id: "clock",
      title: "Clock",
      description: "Display current time",
      icon: "🕐",
      category: "time",
    },
    {
      id: "calendar",
      title: "Calendar",
      description: "Display current date",
      icon: "📅",
      category: "time",
    },
    {
      id: "trackers-blocked",
      title: "Trackers Blocked",
      description: "Number of blocked trackers",
      icon: "🛡️",
      category: "security",
    },
    {
      id: "bandwidth-saved",
      title: "Bandwidth Saved",
      description: "Amount of bandwidth saved",
      icon: "⚡",
      category: "performance",
    },
    {
      id: "time-saved",
      title: "Time Saved",
      description: "Time saved by blocking content",
      icon: "⏱️",
      category: "performance",
    },
    {
      id: "active-users",
      title: "Active Users",
      description: "Current active users",
      icon: "👥",
      category: "stats",
    },
    {
      id: "sites-visited",
      title: "Sites Visited",
      description: "Number of sites visited",
      icon: "🌐",
      category: "stats",
    },
  ];

  // Get widget data by ID
  const getWidgetData = useCallback(
    (widgetId: string, statsData?: any) => {
      switch (widgetId) {
        case "clock":
          return {
            id: widgetId,
            title: "Current Time",
            type: "clock" as const,
            data: { time: formatTime(currentTime) },
            lastUpdated: currentTime,
          };
        case "calendar":
          return {
            id: widgetId,
            title: "Today's Date",
            type: "calendar" as const,
            data: {
              date: formatDate(currentTime),
              day: currentTime.getDate(),
              month: currentTime.toLocaleDateString(undefined, {
                month: "short",
              }),
              year: currentTime.getFullYear(),
              weekday: currentTime.toLocaleDateString(undefined, {
                weekday: "long",
              }),
            },
            lastUpdated: currentTime,
          };
        case "trackers-blocked":
          return {
            id: widgetId,
            title: "Trackers Blocked",
            type: "counter" as const,
            data: {
              count: statsData?.trackersBlocked || 0,
              unit: "trackers",
              trend: "+12%",
            },
            lastUpdated: currentTime,
          };
        case "bandwidth-saved":
          return {
            id: widgetId,
            title: "Bandwidth Saved",
            type: "stats" as const,
            data: {
              value: statsData?.bandwidthSaved || "0 MB",
              trend: "+5.2%",
            },
            lastUpdated: currentTime,
          };
        case "time-saved":
          return {
            id: widgetId,
            title: "Time Saved",
            type: "stats" as const,
            data: {
              value: statsData?.timeSaved || "0 min",
              trend: "+3.1%",
            },
            lastUpdated: currentTime,
          };
        case "active-users":
          return {
            id: widgetId,
            title: "Active Users",
            type: "counter" as const,
            data: {
              count: statsData?.activeUsers || 0,
              unit: "users",
              trend: "+2.3%",
            },
            lastUpdated: currentTime,
          };
        case "sites-visited":
          return {
            id: widgetId,
            title: "Sites Visited",
            type: "counter" as const,
            data: {
              count: statsData?.sitesVisited || 0,
              unit: "sites",
              trend: "+8.7%",
            },
            lastUpdated: currentTime,
          };
        default:
          return null;
      }
    },
    [currentTime, formatTime, formatDate],
  );

  // Update settings
  const updateSetting = useCallback(
    <K extends keyof WidgetSettings>(key: K, value: WidgetSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Toggle widget enabled state
  const toggleWidget = useCallback((widgetId: string) => {
    setSettings((prev) => ({
      ...prev,
      enabledWidgets: prev.enabledWidgets.includes(widgetId)
        ? prev.enabledWidgets.filter((id) => id !== widgetId)
        : [...prev.enabledWidgets, widgetId],
    }));
  }, []);

  // Update widget position
  const updateWidgetPosition = useCallback(
    (widgetId: string, x: number, y: number) => {
      setSettings((prev) => ({
        ...prev,
        widgetPositions: {
          ...prev.widgetPositions,
          [widgetId]: { x, y },
        },
      }));
    },
    [],
  );

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    widgets,
    currentTime,
    availableWidgets,
    updateSetting,
    toggleWidget,
    updateWidgetPosition,
    getWidgetData,
    resetSettings,
    formatTime,
    formatDate,
  };
}
