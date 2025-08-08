import path from "path";
import { createServer } from "./index";
import express from "express";
import { initializeDatabase, closeDatabase } from "./utils/database";

const app = createServer();
const port = process.env.PORT || 8080;

// Initialize database before starting server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // In production, serve the built SPA files
    const __dirname = import.meta.dirname;
    const distPath = path.join(__dirname, "../spa");

    // Serve static files
    app.use(express.static(distPath));

    // Handle React Router - serve index.html for all non-API routes
    app.get("*", (req, res) => {
      // Don't serve index.html for API routes or health checks
      if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }

      res.sendFile(path.join(distPath, "index.html"));
    });
    
    // Start the server
    const server = app.listen(port, () => {
      console.log(`🚀 Kruger Browser Server running on port ${port}`);
      console.log(`📱 Frontend: http://localhost:${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
      console.log(`❤️ Health: http://localhost:${port}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`🛑 Received ${signal}, shutting down gracefully`);
      
      server.close(async () => {
        console.log("🔌 HTTP server closed");
        
        try {
          await closeDatabase();
          console.log("✅ Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          console.error("❌ Error during shutdown:", error);
          process.exit(1);
        }
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.log("⏰ Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();