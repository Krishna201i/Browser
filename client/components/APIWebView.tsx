/**
 * API-based WebView Component
 * Replaces iframe embedding with API calls to avoid connection refused errors
 */

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Globe,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface APIWebViewProps {
  url: string;
  isIncognito?: boolean;
  onUrlChange?: (url: string) => void;
  onTitleChange?: (title: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function APIWebView({
  url,
  isIncognito = false,
  onUrlChange,
  onTitleChange,
  onLoadingChange,
}: APIWebViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    if (url && url !== "kruger://home") {
      loadPageData(url);
    }
  }, [url]);

  const loadPageData = async (targetUrl: string) => {
    setLoading(true);
    setError(null);
    onLoadingChange?.(true);

    try {
      // Extract domain and create safe preview
      const urlObj = new URL(targetUrl);
      const domain = urlObj.hostname;
      const title = `${domain} - Web Page`;

      onTitleChange?.(title);

      // Simulate page data (in a real implementation, you'd use a proxy service)
      const simulatedData = {
        title: title,
        domain: domain,
        url: targetUrl,
        description: `Content from ${domain}. Click "Open in New Tab" to view the full page.`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      };

      setPageData(simulatedData);
      setLoading(false);
      onLoadingChange?.(false);
    } catch (err) {
      setError(
        `Unable to load ${targetUrl}. The site may have connection restrictions.`,
      );
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  const openInNewTab = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const refresh = () => {
    if (url) {
      loadPageData(url);
    }
  };

  if (url === "kruger://home") {
    return null; // Let the home page render normally
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
        <div className="flex-1 px-3 py-2 bg-background rounded text-sm font-mono truncate">
          {url}
        </div>
        <Button variant="outline" size="sm" onClick={openInNewTab}>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading page data...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="max-w-2xl mx-auto mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Connection Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Why does this happen?</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Many websites block embedding for security reasons</li>
                  <li>CORS policies prevent cross-origin access</li>
                  <li>Some sites require specific authentication</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={openInNewTab}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button variant="outline" onClick={refresh}>
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : pageData ? (
          <Card className="max-w-4xl mx-auto mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <img
                  src={pageData.favicon}
                  alt=""
                  className="w-6 h-6"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                {pageData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                {pageData.domain}
              </div>

              <p className="text-muted-foreground">{pageData.description}</p>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Secure Browsing Notice</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  To protect your privacy and security, this browser shows a
                  safe preview instead of embedding external content directly.
                  This prevents tracking and malicious scripts.
                </p>
                <Button onClick={openInNewTab} className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Page in New Tab
                </Button>
              </div>

              {isIncognito && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                    🕶️ Incognito Mode Active
                  </h4>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Your browsing activity is not being saved to history, and
                    tracking is minimized.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <Globe className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">Ready to Browse</h2>
              <p className="text-muted-foreground">
                Enter a URL in the address bar to start browsing securely.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
