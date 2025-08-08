import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "kruger-browser-secret-key";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    premium: boolean;
  };
}

const tokenSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  premium: z.boolean(),
  iat: z.number(),
  exp: z.number(),
});

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const validatedUser = tokenSchema.parse(decoded);
    
    req.user = {
      id: validatedUser.id,
      email: validatedUser.email,
      name: validatedUser.name,
      premium: validatedUser.premium,
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const validatedUser = tokenSchema.parse(decoded);
      
      req.user = {
        id: validatedUser.id,
        email: validatedUser.email,
        name: validatedUser.name,
        premium: validatedUser.premium,
      };
    } catch (error) {
      // Invalid token, but continue without user
    }
  }
  
  next();
};

export const requirePremium = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!req.user.premium) {
    return res.status(403).json({ error: "Premium subscription required" });
  }

  next();
};

export const generateToken = (user: {
  id: string;
  email: string;
  name: string;
  premium: boolean;
}): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
};