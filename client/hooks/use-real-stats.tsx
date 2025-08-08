import * as React from "react";
import { useState, useEffect, useCallback } from "react";

interface RealStats {
  trackersBlocked: number;
  bandwidthSaved: string;
  timeSaved: string;
  activeUsers: number;
  sitesVisited: number;
  sessionStartTime: number;
  totalBrowsingTime: number; // in minutes
  pagesLoaded: number;
  searchesPerformed: number;
}

interface UseRealStatsReturn {
  stats: RealStats;
  incrementTrackersBlocked: (count?: number) => void;
  addBandwidthSaved: (bytes: number) => void;
  addSiteVisited: () => void;
  addPageLoaded: () => void;
  addSearchPerformed: () => void;
  startSession: () => void;
  endSession: () => void;
  resetStats: () => void;
}

const STORAGE_KEY = "kruger-browser-stats";

// Estimate trackers blocked per page based on typical websites
const AVERAGE_TRACKERS_PER_PAGE = 12;
// Estimate bandwidth saved per blocked tracker (average ad size)
const AVERAGE_TRACKER_SIZE_BYTES = 15000; // 15KB per tracker

export const useRealStats = (): UseRealStatsReturn => {
  const [stats, setStats] = useState<RealStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          sessionStartTime: Date.now(), // Reset session time
          activeUsers: 1, // Always 1 for personal browser
        };
      }
    } catch (error) {
      console.error("Error loading stats from localStorage:", error);
    }

    // Default initial stats
    return {
      trackersBlocked: 0,
      bandwidthSaved: "0 MB",
      timeSaved: "0m",
      activeUsers: 1,
      sitesVisited: 0,
      sessionStartTime: Date.now(),
      totalBrowsingTime: 0,
      pagesLoaded: 0,
      searchesPerformed: 0,
    };
  });

  // Save to localStorage whenever stats change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error("Error saving stats to localStorage:", error);
    }
  }, [stats]);

  // Update session time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => {
        const sessionTime = Math.floor(
          (Date.now() - prev.sessionStartTime) / 1000 / 60,
        );
        const totalTime = prev.totalBrowsingTime + sessionTime;

        // Calculate time saved (assume 30% faster loading due to ad blocking)
        const timeSavedMinutes = Math.floor(totalTime * 0.3);
        const timeSavedFormatted = formatTime(timeSavedMinutes);

        return {
          ...prev,
          timeSaved: timeSavedFormatted,
        };
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
  };

  const formatBandwidth = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  const incrementTrackersBlocked = useCallback(
    (count: number = AVERAGE_TRACKERS_PER_PAGE) => {
      setStats((prev) => {
        const newTrackersBlocked = prev.trackersBlocked + count;
        const newBandwidthBytes = count * AVERAGE_TRACKER_SIZE_BYTES;

        // Parse existing bandwidth and add new
        const currentBandwidthStr = prev.bandwidthSaved.replace(/[^\d.]/g, "");
        const currentBandwidthBytes =
          parseFloat(currentBandwidthStr) * 1024 * 1024; // Assume MB
        const totalBandwidthBytes = currentBandwidthBytes + newBandwidthBytes;

        return {
          ...prev,
          trackersBlocked: newTrackersBlocked,
          bandwidthSaved: formatBandwidth(totalBandwidthBytes),
        };
      });
    },
    [],
  );

  const addBandwidthSaved = useCallback((bytes: number) => {
    setStats((prev) => {
      const currentBandwidthStr = prev.bandwidthSaved.replace(/[^\d.]/g, "");
      const currentBandwidthBytes =
        parseFloat(currentBandwidthStr) * 1024 * 1024;
      const totalBandwidthBytes = currentBandwidthBytes + bytes;

      return {
        ...prev,
        bandwidthSaved: formatBandwidth(totalBandwidthBytes),
      };
    });
  }, []);

  const addSiteVisited = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      sitesVisited: prev.sitesVisited + 1,
    }));

    // Also increment trackers blocked for this site
    incrementTrackersBlocked();
  }, [incrementTrackersBlocked]);

  const addPageLoaded = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      pagesLoaded: prev.pagesLoaded + 1,
    }));
  }, []);

  const addSearchPerformed = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      searchesPerformed: prev.searchesPerformed + 1,
    }));
  }, []);

  const startSession = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      sessionStartTime: Date.now(),
      activeUsers: 1,
    }));
  }, []);

  const endSession = useCallback(() => {
    setStats((prev) => {
      const sessionTime = Math.floor(
        (Date.now() - prev.sessionStartTime) / 1000 / 60,
      );
      return {
        ...prev,
        totalBrowsingTime: prev.totalBrowsingTime + sessionTime,
      };
    });
  }, []);

  const resetStats = useCallback(() => {
    const initialStats: RealStats = {
      trackersBlocked: 0,
      bandwidthSaved: "0 MB",
      timeSaved: "0m",
      activeUsers: 1,
      sitesVisited: 0,
      sessionStartTime: Date.now(),
      totalBrowsingTime: 0,
      pagesLoaded: 0,
      searchesPerformed: 0,
    };
    setStats(initialStats);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error removing stats from localStorage:", error);
    }
  }, []);

  // Track page visibility to pause/resume session timing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startSession();
      } else {
        endSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [startSession, endSession]);

  return {
    stats,
    incrementTrackersBlocked,
    addBandwidthSaved,
    addSiteVisited,
    addPageLoaded,
    addSearchPerformed,
    startSession,
    endSession,
    resetStats,
  };
};
