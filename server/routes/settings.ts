import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { validateBody, schemas } from "../middleware/validation";

interface UserSettings {
  userId: string;
  theme: "light" | "dark";
  searchEngine: string;
  privacy: {
    blockTrackers: boolean;
    blockAds: boolean;
    forceHttps: boolean;
    antiFingerprintng: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    fontSize: number;
  };
  performance: {
    batterySaver: boolean;
    performanceMode: "performance" | "balanced" | "power-saver";
  };
  vpn: {
    autoConnect: boolean;
    killSwitch: boolean;
    protocol: "OpenVPN" | "WireGuard" | "IKEv2";
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mock settings database
const userSettings: UserSettings[] = [];

const getDefaultSettings = (userId: string): UserSettings => ({
  userId,
  theme: "dark",
  searchEngine: "google",
  privacy: {
    blockTrackers: true,
    blockAds: true,
    forceHttps: true,
    antiFingerprintng: true,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    fontSize: 15,
  },
  performance: {
    batterySaver: false,
    performanceMode: "balanced",
  },
  vpn: {
    autoConnect: false,
    killSwitch: true,
    protocol: "WireGuard",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const getSettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    let settings = userSettings.find(s => s.userId === req.user!.id);
    
    if (!settings) {
      // Create default settings for new user
      settings = getDefaultSettings(req.user.id);
      userSettings.push(settings);
    }

    res.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateSettings: RequestHandler[] = [
  validateBody(schemas.settings.update),
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const updates = req.body;
      
      let settingsIndex = userSettings.findIndex(s => s.userId === req.user!.id);
      
      if (settingsIndex === -1) {
        // Create new settings
        const newSettings = getDefaultSettings(req.user.id);
        userSettings.push(newSettings);
        settingsIndex = userSettings.length - 1;
      }

      // Deep merge updates
      userSettings[settingsIndex] = {
        ...userSettings[settingsIndex],
        ...updates,
        updatedAt: new Date(),
      };

      res.json({
        message: "Settings updated successfully",
        settings: userSettings[settingsIndex],
      });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

export const resetSettings: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const settingsIndex = userSettings.findIndex(s => s.userId === req.user!.id);
    
    if (settingsIndex >= 0) {
      userSettings[settingsIndex] = getDefaultSettings(req.user.id);
    } else {
      userSettings.push(getDefaultSettings(req.user.id));
    }

    res.json({
      message: "Settings reset to defaults",
      settings: userSettings[settingsIndex >= 0 ? settingsIndex : userSettings.length - 1],
    });
  } catch (error) {
    console.error("Reset settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};