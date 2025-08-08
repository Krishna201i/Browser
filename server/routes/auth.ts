import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { generateToken, AuthenticatedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validation";
import { schemas } from "../middleware/validation";

// Mock user database (in production, use a real database)
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  premium: boolean;
  createdAt: Date;
  lastLogin: Date;
}

const users: User[] = [];

export const signUp: RequestHandler[] = [
  validateBody(schemas.auth.signUp),
  async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        premium: false,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      users.push(newUser);

      // Generate token
      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        premium: newUser.premium,
      });

      res.status(201).json({
        message: "Account created successfully",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          premium: newUser.premium,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      console.error("Sign up error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

export const signIn: RequestHandler[] = [
  validateBody(schemas.auth.signIn),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      user.lastLogin = new Date();

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        premium: user.premium,
      });

      res.json({
        message: "Sign in successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          premium: user.premium,
          lastLogin: user.lastLogin,
        },
      });
    } catch (error) {
      console.error("Sign in error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

export const getProfile: RequestHandler = (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = users.find(u => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      premium: user.premium,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
};

export const updateProfile: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const { name, email } = req.body;
    const user = users.find(u => u.id === req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user data
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken
      const emailExists = users.find(u => u.email === email && u.id !== user.id);
      if (emailExists) {
        return res.status(409).json({ error: "Email already in use" });
      }
      user.email = email;
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        premium: user.premium,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};