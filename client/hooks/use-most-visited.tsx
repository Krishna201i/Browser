import * as React from "react";
import { useState, useEffect, useCallback } from "react";

export interface VisitedSite {
  id: string;
  title: string;
  url: string;
  visitCount: number;
  lastVisited: Date;
  favicon: string;
  domain: string;
}

interface MostVisitedHook {
  mostVisited: VisitedSite[];
  addVisit: (url: string, title: string) => void;
  clearMostVisited: () => void;
  removeSite: (id: string) => void;
}

const STORAGE_KEY = "kruger-most-visited";
const MAX_SITES = 12; // Show top 12 most visited sites

export const useMostVisited = (): MostVisitedHook => {
  const [mostVisited, setMostVisited] = useState<VisitedSite[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((site: any) => ({
          ...site,
          lastVisited: new Date(site.lastVisited),
        }));
      }
    } catch (error) {
      console.error("Error loading most visited from localStorage:", error);
    }
    return [];
  });

  // Save to localStorage whenever most visited changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mostVisited));
    } catch (error) {
      console.error("Error saving most visited to localStorage:", error);
    }
  }, [mostVisited]);

  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  const getFavicon = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return `https://www.google.com/s2/favicons?domain=example.com&sz=32`;
    }
  };

  const addVisit = useCallback((url: string, title: string) => {
    // Don't track search engine results or internal pages
    if (
      url.includes("/search?") ||
      url.startsWith("kruger://") ||
      url.includes("localhost")
    ) {
      return;
    }

    const domain = getDomain(url);
    const favicon = getFavicon(url);

    setMostVisited((prev) => {
      // Find existing site
      const existingIndex = prev.findIndex((site) => site.domain === domain);

      if (existingIndex >= 0) {
        // Update existing site
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          title: title || updated[existingIndex].title,
          url: url,
          visitCount: updated[existingIndex].visitCount + 1,
          lastVisited: new Date(),
          favicon,
        };

        // Sort by visit count (descending) and take top sites
        return updated
          .sort((a, b) => b.visitCount - a.visitCount)
          .slice(0, MAX_SITES);
      } else {
        // Add new site
        const newSite: VisitedSite = {
          id: `site-${Date.now()}-${Math.random()}`,
          title: title || domain,
          url,
          visitCount: 1,
          lastVisited: new Date(),
          favicon,
          domain,
        };

        const updated = [newSite, ...prev];

        // Sort and limit
        return updated
          .sort((a, b) => b.visitCount - a.visitCount)
          .slice(0, MAX_SITES);
      }
    });
  }, []);

  const removeSite = useCallback((id: string) => {
    setMostVisited((prev) => prev.filter((site) => site.id !== id));
  }, []);

  const clearMostVisited = useCallback(() => {
    setMostVisited([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing most visited from localStorage:", error);
    }
  }, []);

  return {
    mostVisited,
    addVisit,
    clearMostVisited,
    removeSite,
  };
};
