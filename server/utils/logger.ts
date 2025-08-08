import morgan from "morgan";

// Custom token for user ID
morgan.token("user-id", (req: any) => {
  return req.user?.id || "anonymous";
});

// Custom token for request duration in ms
morgan.token("response-time-ms", (req, res) => {
  const startTime = (req as any)._startTime;
  if (!startTime) return "-";
  
  const duration = Date.now() - startTime;
  return `${duration}ms`;
});

// Development format
export const devLogger = morgan(
  ":method :url :status :response-time-ms - :user-id",
  {
    skip: (req) => req.url.startsWith("/health") || req.url.startsWith("/api/ping"),
  }
);

// Production format
export const prodLogger = morgan(
  ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms',
  {
    skip: (req) => req.url.startsWith("/health"),
  }
);

// Error logger
export const errorLogger = (error: Error, req: any, res: any, next: any) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
  });
  
  next(error);
};

// Request timing middleware
export const requestTimer = (req: any, res: any, next: any) => {
  req._startTime = Date.now();
  next();
};