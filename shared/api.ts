/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
  timestamp: string;
  version: string;
}

/**
 * Authentication API types
 */
export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    premium: boolean;
    createdAt?: Date;
    lastLogin?: Date;
  };
}

/**
 * Bookmark API types
 */
export interface BookmarkRequest {
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  folderId?: string;
}

export interface BookmarkResponse {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  visitCount: number;
  lastVisited?: Date;
}

export interface FolderRequest {
  name: string;
  description?: string;
  parentId?: string;
}

/**
 * Search API types
 */
export interface SearchRequest {
  q: string;
  engine?: string;
  limit?: number;
}

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  favicon?: string;
  domain: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  suggestions: string[];
  totalResults: number;
  searchTime: number;
}

/**
 * Settings API types
 */
export interface SettingsResponse {
  theme: "light" | "dark";
  searchEngine: string;
  privacy: {
    blockTrackers: boolean;
    blockAds: boolean;
    forceHttps: boolean;
    antiFingerprintng: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    fontSize: number;
  };
  performance: {
    batterySaver: boolean;
    performanceMode: "performance" | "balanced" | "power-saver";
  };
}

/**
 * Analytics API types
 */
export interface AnalyticsResponse {
  trackersBlocked: number;
  adsBlocked: number;
  bandwidthSaved: number;
  bandwidthSavedFormatted: string;
  timeSaved: number;
  timeSavedFormatted: string;
  sitesVisited: number;
  searchesPerformed: number;
  sessionTime: number;
  sessionTimeFormatted: string;
  lastUpdated: Date;
}

/**
 * Health check API types
 */
export interface HealthResponse {
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

/**
 * Error response type
 */
export interface ErrorResponse {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
}
