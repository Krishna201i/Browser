// Browser security utilities to handle connection refusal and iframe blocking

export interface BrowserSecurityConfig {
  userAgent: string;
  headers: Record<string, string>;
  sandbox: string;
  allowFeatures: string;
}

// Major browser configurations to spoof
export const browserConfigs: Record<string, BrowserSecurityConfig> = {
  chrome: {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    },
    sandbox:
      "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads",
    allowFeatures:
      "accelerometer; autoplay; camera; clipboard-read; clipboard-write; display-capture; encrypted-media; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; publickey-credentials-get; screen-wake-lock; speaker-selection; usb; web-share; xr-spatial-tracking",
  },
  firefox: {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      "Upgrade-Insecure-Requests": "1",
    },
    sandbox:
      "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads",
    allowFeatures:
      "accelerometer; autoplay; camera; clipboard-read; clipboard-write; display-capture; encrypted-media; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; screen-wake-lock; speaker-selection; usb; web-share",
  },
  safari: {
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
    },
    sandbox:
      "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation",
    allowFeatures:
      "accelerometer; autoplay; camera; encrypted-media; geolocation; gyroscope; magnetometer; microphone; payment; picture-in-picture",
  },
};

// Sites that commonly block iframe embedding
export const frameBlockingSites = [
  "google.com",
  "youtube.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "linkedin.com",
  "github.com",
  "stackoverflow.com",
  "reddit.com",
  "amazon.com",
  "apple.com",
  "microsoft.com",
  "netflix.com",
  "discord.com",
  "slack.com",
  "zoom.us",
  "paypal.com",
  "stripe.com",
  "banks.com",
  "banking.com",
];

// Check if a URL is likely to block iframe embedding
export function isFrameBlockingSite(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return frameBlockingSites.some(
      (blocked) =>
        hostname.includes(blocked) || hostname.endsWith(`.${blocked}`),
    );
  } catch {
    return false;
  }
}

// Get appropriate browser config based on URL
export function getBrowserConfigForUrl(url: string): BrowserSecurityConfig {
  // Use Chrome config by default as it's most widely accepted
  return browserConfigs.chrome;
}

// Generate secure iframe parameters
export function getSecureIframeParams(
  url: string,
  isIncognito: boolean = false,
) {
  const config = getBrowserConfigForUrl(url);

  const params: any = {
    sandbox: isIncognito
      ? "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      : config.sandbox,
    allow: config.allowFeatures,
    referrerPolicy: "strict-origin-when-cross-origin" as const,
    loading: "lazy" as const,
  };

  // Only add credentialless when it's true (for incognito mode)
  if (isIncognito) {
    params.credentialless = "true";
  }

  return params;
}

// Create a proxy URL for blocked sites
export function createProxyUrl(originalUrl: string): string {
  // For now, return the original URL
  // In a real implementation, this would route through a proxy service
  return originalUrl;
}

// Inject security headers for iframe
export function injectSecurityHeaders(iframe: HTMLIFrameElement, url: string) {
  const config = getBrowserConfigForUrl(url);

  // Set iframe attributes for better compatibility
  iframe.setAttribute("credentialless", "true");
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("importance", "low");

  // Add event listeners for security
  iframe.addEventListener("load", () => {
    try {
      // Try to modify iframe document to prevent frame busting
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        // Inject anti-frame-busting script
        const script = iframeDoc.createElement("script");
        script.textContent = `
          // Prevent frame busting
          try {
            Object.defineProperty(window, 'top', { value: window, writable: false });
            Object.defineProperty(window, 'parent', { value: window, writable: false });
            
            // Override problematic methods
            const originalReplace = window.location.replace;
            window.location.replace = function() { return false; };
            
            // Remove refresh meta tags
            const refreshMeta = document.querySelector('meta[http-equiv="refresh"]');
            if (refreshMeta) refreshMeta.remove();
            
            // Disable frame busting scripts
            const scripts = document.querySelectorAll('script');
            scripts.forEach(s => {
              if (s.textContent && (
                s.textContent.includes('top.location') || 
                s.textContent.includes('parent.location') ||
                s.textContent.includes('self !== top')
              )) {
                s.remove();
              }
            });
          } catch (e) {
            // Silently fail if we can't access the document
          }
        `;
        iframeDoc.head.appendChild(script);
      }
    } catch (e) {
      // CORS or other security prevents access - this is expected
      console.log("Could not inject security script due to CORS:", e.message);
    }
  });
}

// Handle iframe errors and provide fallbacks
export function handleIframeError(
  iframe: HTMLIFrameElement,
  url: string,
  onError: (error: string) => void,
) {
  iframe.addEventListener("error", () => {
    if (isFrameBlockingSite(url)) {
      onError(
        `This website (${new URL(url).hostname}) doesn't allow embedding for security reasons.`,
      );
    } else {
      onError(
        "Failed to load the website. The site may be temporarily unavailable.",
      );
    }
  });

  // Set a timeout to detect failed loads
  const timeout = setTimeout(() => {
    if (iframe.src && !iframe.contentDocument) {
      onError(
        "The website is taking too long to load or may be blocking iframe access.",
      );
    }
  }, 10000);

  iframe.addEventListener("load", () => {
    clearTimeout(timeout);
  });
}

// Modify URLs to be more iframe-friendly
export function makeUrlIframeFriendly(url: string): string {
  try {
    const urlObj = new URL(url);

    // Add parameters that some sites use to allow iframe embedding
    if (!urlObj.searchParams.has("embed")) {
      urlObj.searchParams.set("embed", "1");
    }

    // For YouTube, use embed URL
    if (
      urlObj.hostname.includes("youtube.com") &&
      urlObj.pathname.includes("watch")
    ) {
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // For Twitter/X, use embed URL
    if (
      (urlObj.hostname.includes("twitter.com") ||
        urlObj.hostname.includes("x.com")) &&
      urlObj.pathname.includes("status")
    ) {
      return `https://platform.twitter.com/embed/Tweet.html?id=${urlObj.pathname.split("/").pop()}`;
    }

    return urlObj.toString();
  } catch {
    return url;
  }
}

// Security policy configuration for the browser
export const securityPolicyConfig = {
  // Content Security Policy
  csp: {
    "default-src":
      "'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:",
    "script-src":
      "'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:",
    "style-src": "'self' 'unsafe-inline' https: http: data:",
    "img-src": "'self' data: blob: https: http:",
    "font-src": "'self' https: http: data:",
    "connect-src": "'self' https: http: ws: wss: data: blob:",
    "frame-src": "'self' https: http: data: blob:",
    "worker-src": "'self' https: http: data: blob:",
    "child-src": "'self' https: http: data: blob:",
    "object-src": "'none'",
    "media-src": "'self' https: http: data: blob:",
    "manifest-src": "'self' https: http:",
  },

  // Feature Policy / Permissions Policy
  permissions: {
    accelerometer: "*",
    autoplay: "*",
    camera: "*",
    "clipboard-read": "*",
    "clipboard-write": "*",
    "display-capture": "*",
    "encrypted-media": "*",
    geolocation: "*",
    gyroscope: "*",
    magnetometer: "*",
    microphone: "*",
    midi: "*",
    payment: "*",
    "picture-in-picture": "*",
    "publickey-credentials-get": "*",
    "screen-wake-lock": "*",
    "speaker-selection": "*",
    usb: "*",
    "web-share": "*",
    "xr-spatial-tracking": "*",
  },
};
