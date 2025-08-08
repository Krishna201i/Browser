import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/auth";

interface AnalyticsData {
  userId: string;
  trackersBlocked: number;
  adsBlocked: number;
  bandwidthSaved: number; // in bytes
  timeSaved: number; // in seconds
  sitesVisited: number;
  searchesPerformed: number;
  sessionTime: number; // in seconds
  lastUpdated: Date;
}

// Mock analytics database
const analyticsData: AnalyticsData[] = [];

const getDefaultAnalytics = (userId: string): AnalyticsData => ({
  userId,
  trackersBlocked: 0,
  adsBlocked: 0,
  bandwidthSaved: 0,
  timeSaved: 0,
  sitesVisited: 0,
  searchesPerformed: 0,
  sessionTime: 0,
  lastUpdated: new Date(),
});

export const getAnalytics: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    let analytics = analyticsData.find(a => a.userId === req.user!.id);
    
    if (!analytics) {
      analytics = getDefaultAnalytics(req.user.id);
      analyticsData.push(analytics);
    }

    // Format response
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const formatTime = (seconds: number): string => {
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    res.json({
      analytics: {
        ...analytics,
        bandwidthSavedFormatted: formatBytes(analytics.bandwidthSaved),
        timeSavedFormatted: formatTime(analytics.timeSaved),
        sessionTimeFormatted: formatTime(analytics.sessionTime),
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAnalytics: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const {
      trackersBlocked,
      adsBlocked,
      bandwidthSaved,
      timeSaved,
      sitesVisited,
      searchesPerformed,
      sessionTime,
    } = req.body;

    let analyticsIndex = analyticsData.findIndex(a => a.userId === req.user!.id);
    
    if (analyticsIndex === -1) {
      const newAnalytics = getDefaultAnalytics(req.user.id);
      analyticsData.push(newAnalytics);
      analyticsIndex = analyticsData.length - 1;
    }

    // Update analytics data
    const analytics = analyticsData[analyticsIndex];
    if (typeof trackersBlocked === "number") analytics.trackersBlocked += trackersBlocked;
    if (typeof adsBlocked === "number") analytics.adsBlocked += adsBlocked;
    if (typeof bandwidthSaved === "number") analytics.bandwidthSaved += bandwidthSaved;
    if (typeof timeSaved === "number") analytics.timeSaved += timeSaved;
    if (typeof sitesVisited === "number") analytics.sitesVisited += sitesVisited;
    if (typeof searchesPerformed === "number") analytics.searchesPerformed += searchesPerformed;
    if (typeof sessionTime === "number") analytics.sessionTime = sessionTime;
    
    analytics.lastUpdated = new Date();

    res.json({
      message: "Analytics updated successfully",
      analytics,
    });
  } catch (error) {
    console.error("Update analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetAnalytics: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const analyticsIndex = analyticsData.findIndex(a => a.userId === req.user!.id);
    
    if (analyticsIndex >= 0) {
      analyticsData[analyticsIndex] = getDefaultAnalytics(req.user.id);
    } else {
      analyticsData.push(getDefaultAnalytics(req.user.id));
    }

    res.json({
      message: "Analytics reset successfully",
      analytics: analyticsData[analyticsIndex >= 0 ? analyticsIndex : analyticsData.length - 1],
    });
  } catch (error) {
    console.error("Reset analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};