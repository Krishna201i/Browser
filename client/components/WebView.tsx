import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface WebViewProps {
  url: string;
  isIncognito?: boolean;
  onUrlChange?: (url: string) => void;
  onTitleChange?: (title: string) => void;
}

export default function WebView({
  url,
  isIncognito = false,
  onUrlChange,
  onTitleChange,
}: WebViewProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (url && url !== "kruger://home") {
      setLoading(true);
      setProgress(0);
      setError(null);

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

      // Check if URL is secure
      setIsSecure(url.startsWith("https://"));

      return () => clearInterval(progressInterval);
    }
  }, [url]);

  const handleIframeLoad = () => {
    setLoading(false);
    setProgress(100);

    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // Try to get the title from iframe (may be blocked by CORS)
        try {
          const title = iframe.contentDocument?.title || url;
          onTitleChange?.(title);
        } catch (e) {
          // CORS blocked, use URL as title
          onTitleChange?.(new URL(url).hostname);
        }
      }
    } catch (e) {
      console.log("Could not access iframe content due to CORS policy");
    }
  };

  const handleIframeError = () => {
    setLoading(false);
    setError("Failed to load page. This site may not allow embedding.");
  };

  const goBack = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.back();
      } catch (e) {
        console.log("Cannot navigate iframe history due to CORS policy");
      }
    }
  };

  const goForward = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.forward();
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
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const goHome = () => {
    onUrlChange?.("kruger://home");
  };

  if (url === "kruger://home") {
    return null; // Let the parent component handle home page
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={goBack}
            disabled={!canGoBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={goForward}
            disabled={!canGoForward}
            className="h-8 w-8"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={reload}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={goHome}
            className="h-8 w-8"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex items-center gap-2">
          {isSecure ? (
            <Shield className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          <span className="text-sm text-muted-foreground truncate">{url}</span>
        </div>

        {isIncognito && (
          <div className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
            Incognito
          </div>
        )}
      </div>

      {/* Loading Progress */}
      {loading && <Progress value={progress} className="h-1" />}

      {/* Web Content */}
      <div className="flex-1 relative">
        {error ? (
          <div className="flex items-center justify-center h-full bg-muted/10">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">
                  Page Cannot Be Displayed
                </h3>
                <p className="text-muted-foreground mt-2">{error}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try opening this link in a new tab or use a different search
                  term.
                </p>
                <Button onClick={reload} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="Web Content"
          />
        )}
      </div>
    </div>
  );
}
