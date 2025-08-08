import { RequestHandler } from "express";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: "connected" | "disconnected" | "error";
    cache: "connected" | "disconnected" | "error";
    external_apis: "available" | "unavailable" | "degraded";
  };
  performance: {
    memory_usage: number;
    cpu_usage: number;
    response_time: number;
  };
}

export const healthCheck: RequestHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    // Check system health
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Mock service checks (in production, check real services)
    const services = {
      database: "connected" as const,
      cache: "connected" as const,
      external_apis: "available" as const,
    };

    // Calculate performance metrics
    const performance = {
      memory_usage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      cpu_usage: Math.round(Math.random() * 20 + 10), // Mock CPU usage
      response_time: Date.now() - startTime,
    };

    // Determine overall status
    let status: HealthStatus["status"] = "healthy";
    if (performance.memory_usage > 90 || performance.cpu_usage > 80) {
      status = "degraded";
    }
    if (services.database === "error" || services.cache === "error") {
      status = "unhealthy";
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services,
      performance,
    };

    // Set appropriate HTTP status code
    const httpStatus = status === "healthy" ? 200 : status === "degraded" ? 200 : 503;
    
    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    console.error("Health check error:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
};

export const readinessCheck: RequestHandler = async (req, res) => {
  try {
    // Check if the application is ready to serve requests
    const isReady = true; // In production, check database connections, etc.

    if (isReady) {
      res.status(200).json({
        status: "ready",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: "not_ready",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Readiness check error:", error);
    res.status(503).json({
      status: "not_ready",
      timestamp: new Date().toISOString(),
      error: "Readiness check failed",
    });
  }
};

export const livenessCheck: RequestHandler = async (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};