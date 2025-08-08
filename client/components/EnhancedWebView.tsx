import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Shield,
  AlertTriangle,
  ExternalLink,
  Lock,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  isFrameBlockingSite,
  getBrowserConfigForUrl,
  getSecureIframeParams,
  makeUrlIframeFriendly,
  injectSecurityHeaders,
  handleIframeError
} from "@/utils/browser-security";

interface EnhancedWebViewProps {
  url: string;
  isIncognito?: boolean;
  onUrlChange?: (url: string) => void;
  onTitleChange?: (title: string) => void;
}

export default function EnhancedWebView({
  url,
  isIncognito = false,
  onUrlChange,
  onTitleChange,
}: EnhancedWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actualUrl, setActualUrl] = useState(url);
  const [useProxy, setUseProxy] = useState(false);
  const [isFrameBlocked, setIsFrameBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Browser spoofing headers and techniques
  const spoofBrowserHeaders = () => {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    };
  };

  useEffect(() => {
    if (url && url !== "kruger://home") {
      setLoading(true);
      setProgress(0);
      setError(null);

      // Check if URL is secure
      setIsSecure(url.startsWith("https://"));

      // Check if this site blocks iframe embedding
      const isBlocked = isFrameBlockingSite(url);
      setIsFrameBlocked(isBlocked);

      // Make URL more iframe-friendly
      const friendlyUrl = makeUrlIframeFriendly(url);

      // Determine if we need to use proxy
      const needsProxy = isBlocked && checkIfNeedsProxy(url);
      setUseProxy(needsProxy);

      // Set actual URL (with proxy if needed, otherwise use friendly URL)
      if (needsProxy) {
        setActualUrl(`/api/proxy/${encodeURIComponent(friendlyUrl)}`);
      } else {
        setActualUrl(friendlyUrl);
      }

      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    }
  }, [url]);

  // Set up iframe error handling
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && url !== "kruger://home") {
      handleIframeError(iframe, url, (errorMsg) => {
        setError(errorMsg);
        setLoading(false);
      });
    }
  }, [url, actualUrl]);

  const checkIfNeedsProxy = (url: string): boolean => {
    // List of domains that typically block iframe embedding
    const blockedDomains = [
      'google.com',
      'youtube.com',
      'facebook.com',
      'twitter.com',
      'instagram.com',
      'linkedin.com',
      'github.com',
      'stackoverflow.com',
      'reddit.com',
      'amazon.com',
      'apple.com',
      'microsoft.com',
      'netflix.com',
      'discord.com',
      'slack.com',
      'zoom.us',
      'paypal.com',
      'stripe.com'
    ];

    try {
      const domain = new URL(url).hostname.toLowerCase();
      return blockedDomains.some(blocked => domain.includes(blocked));
    } catch {
      return false;
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setProgress(100);

    try {
      const iframe = iframeRef.current;
      if (iframe) {
        // Inject security headers and anti-frame-busting scripts
        injectSecurityHeaders(iframe, url);

        // Try to get the title from iframe (may be blocked by CORS)
        try {
          const title = iframe.contentDocument?.title || extractTitleFromUrl(url);
          onTitleChange?.(title);
        } catch (e) {
          // CORS blocked, use URL as title
          onTitleChange?.(extractTitleFromUrl(url));
        }
      }
    } catch (e) {
      console.log("Could not access iframe content due to CORS policy");
    }
  };

  const extractTitleFromUrl = (url: string): string => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '').split('.')[0];
    } catch {
      return url;
    }
  };

  const handleIframeError = () => {
    setLoading(false);

    if (isFrameBlockingSite(url)) {
      setError(`${new URL(url).hostname} blocks iframe embedding for security. Try opening in a new tab.`);
    } else {
      setError("Failed to load page. This site may not allow embedding.");
    }

    // Try with proxy if not already using it
    if (!useProxy && !isFrameBlocked) {
      setUseProxy(true);
      setActualUrl(`/api/proxy/${encodeURIComponent(url)}`);
      setError(null);
      setLoading(true);
    }
  };

  const goBack = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.back();
        setCanGoBack(false);
      } catch (e) {
        console.log("Cannot navigate iframe history due to CORS policy");
      }
    }
  };

  const goForward = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.forward();
        setCanGoForward(false);
      } catch (e) {
        console.log("Cannot navigate iframe history due to CORS policy");
      }
    }
  };

  const reload = () => {
    if (iframeRef.current) {
      setLoading(true);
      setProgress(0);
      setError(null);
      iframeRef.current.src = actualUrl;
    }
  };

  const goHome = () => {
    onUrlChange?.("kruger://home");
  };

  const openInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (url === "kruger://home") {
    return null; // Let the parent component handle home page
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Enhanced Navigation Controls */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={goBack}
            disabled={!canGoBack}
            className="h-8 w-8"
            title="Go Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={goForward}
            disabled={!canGoForward}
            className="h-8 w-8"
            title="Go Forward"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={reload}
            className="h-8 w-8"
            title="Reload"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={goHome}
            className="h-8 w-8"
            title="Home"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex items-center gap-2">
          {/* Security Indicator */}
          {isSecure ? (
            <div className="flex items-center gap-1">
              <Lock className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Secure</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-yellow-600 font-medium">Not Secure</span>
            </div>
          )}

          {/* URL Display */}
          <span className="text-sm text-muted-foreground truncate flex-1">{url}</span>

          {/* Security Indicators */}
          {isFrameBlocked && (
            <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Frame Blocked
            </Badge>
          )}

          {useProxy && (
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Proxied
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={openInNewTab}
            className="h-8 w-8"
            title="Open in New Tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>

          {isIncognito && (
            <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              <Globe className="h-3 w-3 mr-1" />
              Incognito
            </Badge>
          )}
        </div>
      </div>

      {/* Loading Progress */}
      {loading && (
        <div className="relative">
          <Progress value={progress} className="h-1" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500 opacity-50 animate-pulse" />
        </div>
      )}

      {/* Web Content */}
      <div className="flex-1 relative">
        {error ? (
          <div className="flex items-center justify-center h-full bg-muted/10">
            <div className="text-center space-y-4 max-w-md">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Page Cannot Be Displayed</h3>
                <p className="text-muted-foreground mt-2">{error}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This website may have security policies that prevent embedding.
                  Try opening it in a new tab instead.
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button onClick={reload} variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={openInNewTab}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={actualUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            {...getSecureIframeParams(url, isIncognito)}
            referrerPolicy="strict-origin-when-cross-origin"
            title="Web Content"
            style={{
              colorScheme: 'normal',
            }}
          />
        )}
      </div>
    </div>
  );
}
