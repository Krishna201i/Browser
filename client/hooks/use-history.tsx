import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface HistoryEntry {
  id: string;
  title: string;
  url: string;
  visitTime: Date;
  domain: string;
  favicon?: string;
  visitCount: number;
}

interface HistorySettings {
  saveHistory: boolean;
  autoDeleteAfterDays: number;
  excludeIncognito: boolean;
  groupByDomain: boolean;
}

const defaultSettings: HistorySettings = {
  saveHistory: true,
  autoDeleteAfterDays: 30,
  excludeIncognito: true,
  groupByDomain: false,
};

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<HistorySettings>(defaultSettings);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("kruger-history");
    const savedSettings = localStorage.getItem("kruger-history-settings");

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(
          parsed.map((entry: any) => ({
            ...entry,
            visitTime: new Date(entry.visitTime),
          })),
        );
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    }

    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error("Failed to load history settings:", error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("kruger-history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("kruger-history-settings", JSON.stringify(settings));
  }, [settings]);

  const addToHistory = useCallback(
    (url: string, title: string, isIncognito: boolean = false) => {
      if (!settings.saveHistory || (isIncognito && settings.excludeIncognito)) {
        return;
      }

      try {
        const domain = new URL(url).hostname;
        const existingEntry = history.find((entry) => entry.url === url);

        if (existingEntry) {
          // Update existing entry
          setHistory((prev) =>
            prev.map((entry) =>
              entry.url === url
                ? {
                    ...entry,
                    visitTime: new Date(),
                    visitCount: entry.visitCount + 1,
                    title, // Update title in case it changed
                  }
                : entry,
            ),
          );
        } else {
          // Add new entry
          const newEntry: HistoryEntry = {
            id: Date.now().toString(),
            title,
            url,
            visitTime: new Date(),
            domain,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
            visitCount: 1,
          };

          setHistory((prev) => [newEntry, ...prev]);
        }
      } catch (error) {
        console.error("Invalid URL for history:", url);
      }
    },
    [history, settings],
  );

  const removeFromHistory = useCallback((entryId: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== entryId));
    toast.success("Entry removed from history");
  }, []);

  const clearHistory = useCallback(
    (timeRange?: "hour" | "day" | "week" | "all") => {
      let cutoffTime: Date | null = null;

      switch (timeRange) {
        case "hour":
          cutoffTime = new Date(Date.now() - 60 * 60 * 1000);
          break;
        case "day":
          cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "all":
        default:
          cutoffTime = null;
          break;
      }

      if (cutoffTime) {
        setHistory((prev) =>
          prev.filter((entry) => entry.visitTime < cutoffTime!),
        );
        toast.success(`History cleared for the last ${timeRange}`);
      } else {
        setHistory([]);
        toast.success("All history cleared");
      }
    },
    [],
  );

  const searchHistory = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return history.filter(
        (entry) =>
          entry.title.toLowerCase().includes(lowerQuery) ||
          entry.url.toLowerCase().includes(lowerQuery) ||
          entry.domain.toLowerCase().includes(lowerQuery),
      );
    },
    [history],
  );

  const getHistoryByDomain = useCallback(
    (domain: string) => {
      return history.filter((entry) => entry.domain === domain);
    },
    [history],
  );

  const getTopSites = useCallback(
    (limit: number = 10) => {
      return history
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, limit);
    },
    [history],
  );

  const getRecentSites = useCallback(
    (limit: number = 10) => {
      return history
        .sort((a, b) => b.visitTime.getTime() - a.visitTime.getTime())
        .slice(0, limit);
    },
    [history],
  );

  const getHistoryByDate = useCallback(
    (date: Date) => {
      return history.filter((entry) => {
        const entryDate = entry.visitTime.toDateString();
        return entryDate === date.toDateString();
      });
    },
    [history],
  );

  const getTodaysHistory = useCallback(() => {
    return getHistoryByDate(new Date());
  }, [getHistoryByDate]);

  const getHistoryStats = useCallback(() => {
    const totalVisits = history.reduce(
      (sum, entry) => sum + entry.visitCount,
      0,
    );
    const uniqueSites = new Set(history.map((entry) => entry.domain)).size;
    const todayVisits = getTodaysHistory().length;

    return {
      totalEntries: history.length,
      totalVisits,
      uniqueSites,
      todayVisits,
      averageVisitsPerSite:
        history.length > 0 ? Math.round(totalVisits / history.length) : 0,
    };
  }, [history, getTodaysHistory]);

  const updateSettings = useCallback(
    <K extends keyof HistorySettings>(key: K, value: HistorySettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));

      const settingNames: Record<keyof HistorySettings, string> = {
        saveHistory: "Save History",
        autoDeleteAfterDays: "Auto Delete After Days",
        excludeIncognito: "Exclude Incognito",
        groupByDomain: "Group by Domain",
      };

      toast.success(
        `${settingNames[key]} ${typeof value === "boolean" ? (value ? "enabled" : "disabled") : "updated"}`,
      );
    },
    [],
  );

  // Auto-cleanup old history based on settings
  useEffect(() => {
    if (settings.autoDeleteAfterDays > 0) {
      const cutoffDate = new Date(
        Date.now() - settings.autoDeleteAfterDays * 24 * 60 * 60 * 1000,
      );
      setHistory((prev) =>
        prev.filter((entry) => entry.visitTime >= cutoffDate),
      );
    }
  }, [settings.autoDeleteAfterDays]);

  return {
    history,
    settings,
    addToHistory,
    removeFromHistory,
    clearHistory,
    searchHistory,
    getHistoryByDomain,
    getTopSites,
    getRecentSites,
    getHistoryByDate,
    getTodaysHistory,
    getHistoryStats,
    updateSettings,
  };
}
