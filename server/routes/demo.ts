import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  };
  res.status(200).json(response);
};
