import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map(err => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Query validation failed",
          details: error.errors.map(err => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Parameter validation failed",
          details: error.errors.map(err => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  auth: {
    signIn: z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    }),
    signUp: z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      phone: z.string().optional(),
    }),
  },
  bookmarks: {
    create: z.object({
      title: z.string().min(1, "Title is required"),
      url: z.string().url("Invalid URL format"),
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      folderId: z.string().optional(),
    }),
    update: z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      folderId: z.string().optional(),
    }),
  },
  settings: {
    update: z.object({
      theme: z.enum(["light", "dark"]).optional(),
      searchEngine: z.string().optional(),
      privacy: z.object({
        blockTrackers: z.boolean().optional(),
        blockAds: z.boolean().optional(),
        forceHttps: z.boolean().optional(),
        antiFingerprintng: z.boolean().optional(),
      }).optional(),
      accessibility: z.object({
        highContrast: z.boolean().optional(),
        largeText: z.boolean().optional(),
        reducedMotion: z.boolean().optional(),
        fontSize: z.number().optional(),
      }).optional(),
      performance: z.object({
        batterySaver: z.boolean().optional(),
        performanceMode: z.enum(["performance", "balanced", "power-saver"]).optional(),
      }).optional(),
    }),
  },
  search: {
    query: z.object({
      q: z.string().min(1, "Search query is required"),
      engine: z.string().optional(),
      limit: z.string().transform(val => parseInt(val)).optional(),
    }),
  },
};