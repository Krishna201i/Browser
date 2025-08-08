import * as React from "react";
import { useState, useEffect } from "react";
import BrowserToolbar from "./BrowserToolbar";
import KrugerHome from "@/pages/KrugerHome";
import IncognitoHome from "@/pages/IncognitoHome";
import NewsSection from "./NewsSection";
import WebView from "./WebView";
import APIWebView from "./APIWebView";
import MetaSearchPage from "@/pages/MetaSearchPage";
import { useBrowserHistory } from "@/hooks/use-browser-history";
import { useRealStats } from "@/hooks/use-real-stats";
import { useMetaSearch } from "@/hooks/use-meta-search";
import { useMostVisited } from "@/hooks/use-most-visited";
import { useDownloads } from "@/hooks/use-downloads";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useBrowserSettings } from "@/hooks/use-browser-settings";

interface Tab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  isIncognito?: boolean;
  content: "home" | "incognito-home" | "news" | "web";
}

export default function BrowserLayout() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "home",
      title: "Kruger Home",
      url: "kruger://home",
      isActive: true,
      content: "home",
    },
  ]);

  const history = useBrowserHistory();
  const { addSiteVisited, addPageLoaded, addSearchPerformed } = useRealStats();
  const { search: performMetaSearch, getSearchUrl } = useMetaSearch();
  const { addVisit } = useMostVisited();
  const { startDownload } = useDownloads();
  const { addBookmark, isBookmarked } = useBookmarks();
  const browserSettings = useBrowserSettings();

  // Sync browser theme with system
  useEffect(() => {
    const applyTheme = (theme: string) => {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Apply current theme
    applyTheme(browserSettings.settings.theme);

    // Listen for theme changes
    const handleThemeChange = () => {
      applyTheme(browserSettings.settings.theme);
    };

    // Apply theme immediately on settings change
    return () => {
      // Cleanup if needed
    };
  }, [browserSettings.settings.theme]);

  const handleSearch = (query: string, searchEngine?: string) => {
    const activeTab = tabs.find((tab) => tab.isActive);
    if (!activeTab) return;

    let searchUrl = "";
    const isUrl = /^https?:\/\//.test(query) || /^\w+\.\w+/.test(query);

    if (isUrl) {
      searchUrl = query.startsWith("http") ? query : `https://${query}`;
      // Track as site visit
      addSiteVisited();
      // Track for most visited
      addVisit(searchUrl, new URL(searchUrl).hostname);
    } else {
      // Always use meta search page for search queries
      searchUrl = `kruger://search?q=${encodeURIComponent(query)}`;
      // Track as search performed
      addSearchPerformed();
    }

    // Track page loaded
    addPageLoaded();

    // Update the active tab to show appropriate content
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              url: searchUrl,
              title: isUrl ? new URL(searchUrl).hostname : `Search: ${query}`,
              content: isUrl ? "web" : "search", // Force search for non-URLs
            }
          : tab,
      ),
    );

    // Add to history
    history.addEntry(searchUrl, isUrl ? new URL(searchUrl).hostname : query);
  };

  const handleNewTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: "New Tab",
      url: "kruger://home",
      isActive: false,
      content: "home",
    };

    setTabs((prev) => [
      ...prev.map((tab) => ({ ...tab, isActive: false })),
      { ...newTab, isActive: true },
    ]);
  };

  const handleNewIncognitoTab = () => {
    const newTab: Tab = {
      id: `incognito-${Date.now()}`,
      title: "Private Browsing",
      url: "kruger://incognito",
      isActive: false,
      isIncognito: true,
      content: "incognito-home",
    };

    setTabs((prev) => [
      ...prev.map((tab) => ({ ...tab, isActive: false })),
      { ...newTab, isActive: true },
    ]);
  };

  const handleCloseTab = (id: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((tab) => tab.id !== id);
      if (filtered.length === 0) {
        // If no tabs left, create a new home tab
        return [
          {
            id: "home",
            title: "Kruger Home",
            url: "kruger://home",
            isActive: true,
            content: "home",
          },
        ];
      }

      // If we closed the active tab, activate the last tab
      const wasActive = prev.find((tab) => tab.id === id)?.isActive;
      if (wasActive && filtered.length > 0) {
        const lastTab = filtered[filtered.length - 1];
        return filtered.map((tab) =>
          tab.id === lastTab.id
            ? { ...tab, isActive: true }
            : { ...tab, isActive: false },
        );
      }

      return filtered;
    });
  };

  const handleSwitchTab = (id: string) => {
    setTabs((prev) => prev.map((tab) => ({ ...tab, isActive: tab.id === id })));
  };

  const handleGoBack = () => {
    const entry = history.goBack();
    if (entry) {
      const activeTab = tabs.find((tab) => tab.isActive);
      if (activeTab) {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === activeTab.id
              ? {
                  ...tab,
                  url: entry.url,
                  title: entry.title,
                  content: "web",
                }
              : tab,
          ),
        );
      }
    }
  };

  const handleGoForward = () => {
    const entry = history.goForward();
    if (entry) {
      const activeTab = tabs.find((tab) => tab.isActive);
      if (activeTab) {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === activeTab.id
              ? {
                  ...tab,
                  url: entry.url,
                  title: entry.title,
                  content: "web",
                }
              : tab,
          ),
        );
      }
    }
  };

  const handleUndo = () => {
    const entry = history.undo();
    if (entry) {
      const activeTab = tabs.find((tab) => tab.isActive);
      if (activeTab) {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === activeTab.id
              ? {
                  ...tab,
                  url: entry.url,
                  title: entry.title,
                  content: "web",
                }
              : tab,
          ),
        );
      }
    }
  };

  const handleRedo = () => {
    const entry = history.redo();
    if (entry) {
      const activeTab = tabs.find((tab) => tab.isActive);
      if (activeTab) {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === activeTab.id
              ? {
                  ...tab,
                  url: entry.url,
                  title: entry.title,
                  content: "web",
                }
              : tab,
          ),
        );
      }
    }
  };

  const activeTab = tabs.find((tab) => tab.isActive);

  const renderTabContent = () => {
    if (!activeTab) return <KrugerHome onSearch={handleSearch} />;

    switch (activeTab.content) {
      case "incognito-home":
        return <IncognitoHome onSearch={handleSearch} />;
      case "search":
        return <MetaSearchPage onNavigate={handleNavigateFromAI} />;
      case "news":
        return (
          <div className="min-h-screen bg-background">
            <div className="pt-8">
              <NewsSection />
            </div>
          </div>
        );
      case "web":
        return (
          <APIWebView
            url={activeTab.url}
            isIncognito={activeTab.isIncognito}
            onUrlChange={(newUrl) => {
              setTabs((prev) =>
                prev.map((tab) =>
                  tab.id === activeTab.id
                    ? {
                        ...tab,
                        url: newUrl,
                        content: newUrl === "kruger://home" ? "home" : "web",
                      }
                    : tab,
                ),
              );
            }}
            onTitleChange={(title) => {
              setTabs((prev) =>
                prev.map((tab) =>
                  tab.id === activeTab.id ? { ...tab, title } : tab,
                ),
              );
            }}
            onDownload={(filename, url) => {
              // Simulate download - in real app this would trigger actual download
              console.log(`Downloading: ${filename} from ${url}`);
              // Could integrate with the download manager here
            }}
          />
        );
      case "home":
      default:
        return <KrugerHome onSearch={handleSearch} />;
    }
  };

  const handleBookmark = () => {
    const activeTab = tabs.find((tab) => tab.isActive);
    if (activeTab && activeTab.url !== "kruger://home") {
      // In a real app, this would save to bookmarks
      if (isBookmarked(activeTab.url)) {
        console.log("Page already bookmarked");
      } else {
        addBookmark(activeTab.title, activeTab.url);
      }
    }
  };

  const handleNavigateFromAI = (url: string) => {
    handleSearch(url);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <BrowserToolbar
        tabs={tabs}
        onNewTab={handleNewTab}
        onCloseTab={handleCloseTab}
        onSwitchTab={handleSwitchTab}
        onNewIncognitoTab={handleNewIncognitoTab}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canGoBack={history.canGoBack}
        canGoForward={history.canGoForward}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onSearch={handleSearch}
        onNavigate={handleNavigateFromAI}
        onBookmark={handleBookmark}
      />

      <div className="flex-1 overflow-hidden">{renderTabContent()}</div>
    </div>
  );
}
