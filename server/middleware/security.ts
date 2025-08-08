import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Rate limiters for different endpoints
const generalLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

const authLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 5, // Number of requests
  duration: 60, // Per 60 seconds
});

const searchLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 50, // Number of requests
  duration: 60, // Per 60 seconds
});

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "data:", "blob:", "https:", "http:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:", "data:"],
      fontSrc: ["'self'", "https:", "http:", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:", "data:", "blob:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:", "data:", "blob:"],
      frameSrc: ["'self'", "https:", "http:", "data:", "blob:"],
      workerSrc: ["'self'", "https:", "http:", "data:", "blob:"],
      childSrc: ["'self'", "https:", "http:", "data:", "blob:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "http:", "data:", "blob:"],
      manifestSrc: ["'self'", "https:", "http:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  frameguard: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: false,
  referrerPolicy: {
    policy: ["strict-origin-when-cross-origin"]
  }
});

export const rateLimitMiddleware = (type: "general" | "auth" | "search" = "general") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let limiter;
      switch (type) {
        case "auth":
          limiter = authLimiter;
          break;
        case "search":
          limiter = searchLimiter;
          break;
        default:
          limiter = generalLimiter;
      }

      await limiter.consume(req.ip || 'unknown');
      next();
    } catch (rejRes: any) {
      const remainingPoints = rejRes?.remainingPoints || 0;
      const msBeforeNext = rejRes?.msBeforeNext || 1000;

      res.set("Retry-After", Math.round(msBeforeNext / 1000) || 1);
      res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.round(msBeforeNext / 1000),
        remainingPoints,
      });
    }
  };
};

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow all origins for development
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Expires',
    'Last-Modified',
    'If-Modified-Since',
    'If-None-Match',
    'ETag',
    'Vary',
    'User-Agent',
    'Referer',
    'Accept-Encoding',
    'Accept-Language',
    'Cookie',
    'Set-Cookie'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Date',
    'ETag',
    'Expires',
    'Last-Modified',
    'Server',
    'Set-Cookie',
    'Vary'
  ]
};