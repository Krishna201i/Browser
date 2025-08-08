import { Request, Response } from "express";
import https from "https";
import http from "http";
import { URL } from "url";

// Browser user agent for spoofing
const BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface ProxyHeaders {
  [key: string]: string;
}

export const proxyRequest = async (req: Request, res: Response) => {
  try {
    const targetUrl = decodeURIComponent(req.url.replace('/api/proxy/', ''));
    
    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const url = new URL(targetUrl);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    // Prepare browser-like headers
    const proxyHeaders: ProxyHeaders = {
      'User-Agent': BROWSER_USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Host': url.hostname,
    };

    // Add referer if appropriate
    if (req.headers.referer) {
      proxyHeaders['Referer'] = req.headers.referer;
    }

    // Copy some headers from original request
    const allowedHeaders = ['cookie', 'authorization', 'if-modified-since', 'if-none-match'];
    allowedHeaders.forEach(header => {
      if (req.headers[header]) {
        proxyHeaders[header] = req.headers[header] as string;
      }
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: req.method,
      headers: proxyHeaders,
      timeout: 30000,
      // Disable certificate verification for some blocked sites (use with caution)
      rejectUnauthorized: false
    };

    const proxyReq = httpModule.request(options, (proxyRes) => {
      // Set CORS headers to allow iframe embedding
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Expose-Headers', '*');
      
      // Remove problematic headers that prevent embedding
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['content-security-policy-report-only'];
      
      // Set response headers
      res.status(proxyRes.statusCode || 200);
      
      // Copy relevant headers
      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'set-cookie' && 
            key.toLowerCase() !== 'transfer-encoding' &&
            key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, value as string);
        }
      });

      // Handle cookies with proper SameSite attributes
      if (proxyRes.headers['set-cookie']) {
        const cookies = Array.isArray(proxyRes.headers['set-cookie']) 
          ? proxyRes.headers['set-cookie'] 
          : [proxyRes.headers['set-cookie']];
        
        const modifiedCookies = cookies.map(cookie => {
          // Modify cookie to be less restrictive
          return cookie
            .replace(/SameSite=Strict/gi, 'SameSite=None')
            .replace(/SameSite=Lax/gi, 'SameSite=None')
            .replace(/Secure;/gi, '') // Remove Secure flag if needed
            + (cookie.includes('SameSite') ? '' : '; SameSite=None');
        });
        
        res.setHeader('Set-Cookie', modifiedCookies);
      }

      // Modify HTML content to remove frame-busting scripts
      if (proxyRes.headers['content-type']?.includes('text/html')) {
        let htmlContent = '';
        
        proxyRes.on('data', (chunk) => {
          htmlContent += chunk.toString();
        });
        
        proxyRes.on('end', () => {
          // Remove frame-busting scripts and X-Frame-Options enforcement
          const modifiedHtml = htmlContent
            .replace(/if\s*\(\s*self\s*!==\s*top\s*\)/gi, 'if(false)')
            .replace(/if\s*\(\s*top\s*!==\s*self\s*\)/gi, 'if(false)')
            .replace(/if\s*\(\s*window\.top\s*!==\s*window\.self\s*\)/gi, 'if(false)')
            .replace(/if\s*\(\s*parent\s*!==\s*window\s*\)/gi, 'if(false)')
            .replace(/top\.location\s*=\s*self\.location/gi, '// top.location = self.location')
            .replace(/top\.location\.href\s*=\s*self\.location\.href/gi, '// top.location.href = self.location.href')
            .replace(/parent\.location\s*=\s*window\.location/gi, '// parent.location = window.location')
            .replace(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*>/gi, '')
            // Inject script to prevent frame-busting
            .replace('</head>', `
              <script>
                // Prevent frame busting
                Object.defineProperty(window, 'top', { value: window, writable: false });
                Object.defineProperty(window, 'parent', { value: window, writable: false });
                
                // Override location methods
                const originalReplace = window.location.replace;
                window.location.replace = function() { return false; };
                
                // Disable refresh meta tags
                const refreshMeta = document.querySelector('meta[http-equiv="refresh"]');
                if (refreshMeta) refreshMeta.remove();
              </script>
              </head>`);
          
          res.send(modifiedHtml);
        });
      } else {
        // For non-HTML content, just pipe through
        proxyRes.pipe(res);
      }
    });

    proxyReq.on('error', (error) => {
      console.error('Proxy error:', error);
      res.status(502).json({ 
        error: 'Proxy error', 
        message: error.message,
        details: 'Unable to reach the target website'
      });
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      res.status(504).json({ 
        error: 'Gateway timeout',
        message: 'The target website took too long to respond'
      });
    });

    // Forward request body for POST/PUT requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }

  } catch (error) {
    console.error('Proxy setup error:', error);
    res.status(500).json({ 
      error: 'Proxy setup failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Handle OPTIONS requests for CORS preflight
export const proxyOptions = (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(200).end();
};
