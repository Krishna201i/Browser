import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { devLogger, prodLogger, errorLogger, requestTimer } from "./utils/logger";
import { securityMiddleware, rateLimitMiddleware, corsOptions } from "./middleware/security";
import { authenticateToken, optionalAuth } from "./middleware/auth";
import { initializeDatabase } from "./utils/database";

// Route imports
import { handleDemo } from "./routes/demo";
import * as authRoutes from "./routes/auth";
import * as bookmarkRoutes from "./routes/bookmarks";
import * as searchRoutes from "./routes/search";
import * as settingsRoutes from "./routes/settings";
import * as analyticsRoutes from "./routes/analytics";
import * as healthRoutes from "./routes/health";
import * as proxyRoutes from "./routes/proxy";

export function createServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  // Security middleware
  app.use(securityMiddleware);
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(cookieParser());
  
  // Request timing and logging
  app.use(requestTimer);
  app.use(isProduction ? prodLogger : devLogger);
  
  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check routes (no rate limiting)
  app.get("/health", healthRoutes.healthCheck);
  app.get("/health/ready", healthRoutes.readinessCheck);
  app.get("/health/live", healthRoutes.livenessCheck);

  // Proxy routes for iframe embedding (no authentication required)
  app.options("/api/proxy/*", proxyRoutes.proxyOptions);
  app.get("/api/proxy/*", proxyRoutes.proxyRequest);
  app.post("/api/proxy/*", proxyRoutes.proxyRequest);

  // API routes with rate limiting
  app.use("/api", rateLimitMiddleware("general"));
  
  // Public routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ 
      message: ping,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
    });
  });

  app.get("/api/demo", handleDemo);
  
  // Search routes (with search-specific rate limiting)
  app.get("/api/search", rateLimitMiddleware("search"), searchRoutes.search);
  app.get("/api/search/suggestions", rateLimitMiddleware("search"), searchRoutes.getSearchSuggestions);
  
  // Auth routes (with auth-specific rate limiting)
  app.post("/api/auth/signup", rateLimitMiddleware("auth"), ...authRoutes.signUp);
  app.post("/api/auth/signin", rateLimitMiddleware("auth"), ...authRoutes.signIn);
  app.get("/api/auth/profile", authenticateToken, authRoutes.getProfile);
  app.put("/api/auth/profile", authenticateToken, authRoutes.updateProfile);
  
  // Protected routes (require authentication)
  app.use("/api/bookmarks", authenticateToken);
  app.get("/api/bookmarks", bookmarkRoutes.getBookmarks);
  app.post("/api/bookmarks", ...bookmarkRoutes.createBookmark);
  app.put("/api/bookmarks/:id", ...bookmarkRoutes.updateBookmark);
  app.delete("/api/bookmarks/:id", bookmarkRoutes.deleteBookmark);
  app.post("/api/bookmarks/:id/favorite", bookmarkRoutes.toggleFavorite);
  app.post("/api/bookmarks/folders", bookmarkRoutes.createFolder);
  app.delete("/api/bookmarks/folders/:id", bookmarkRoutes.deleteFolder);
  
  // Settings routes
  app.get("/api/settings", authenticateToken, settingsRoutes.getSettings);
  app.put("/api/settings", authenticateToken, ...settingsRoutes.updateSettings);
  app.post("/api/settings/reset", authenticateToken, settingsRoutes.resetSettings);
  
  // Analytics routes
  app.get("/api/analytics", authenticateToken, analyticsRoutes.getAnalytics);
  app.post("/api/analytics", authenticateToken, analyticsRoutes.updateAnalytics);
  app.post("/api/analytics/reset", authenticateToken, analyticsRoutes.resetAnalytics);
  
  // Error handling middleware
  app.use(errorLogger);
  app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
      error: isProduction ? "Internal server error" : error.message,
      timestamp: new Date().toISOString(),
    });
  });
  
  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      error: "API endpoint not found",
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}