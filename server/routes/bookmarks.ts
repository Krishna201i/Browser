import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { validateBody, validateParams, schemas } from "../middleware/validation";
import { z } from "zod";

interface Bookmark {
  id: string;
  userId: string;
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

interface BookmarkFolder {
  id: string;
  userId: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock databases (in production, use a real database)
const bookmarks: Bookmark[] = [];
const folders: BookmarkFolder[] = [];

export const getBookmarks = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const userBookmarks = bookmarks.filter(b => b.userId === req.user!.id);
  const userFolders = folders.filter(f => f.userId === req.user!.id);

  res.json({
    bookmarks: userBookmarks,
    folders: userFolders,
  });
};

export const createBookmark: RequestHandler[] = [
  validateBody(schemas.bookmarks.create),
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { title, url, description, tags, folderId } = req.body;

      // Check if bookmark already exists for this user
      const existingBookmark = bookmarks.find(
        b => b.userId === req.user!.id && b.url === url
      );

      if (existingBookmark) {
        return res.status(409).json({ error: "Bookmark already exists" });
      }

      // Validate folder exists if provided
      if (folderId) {
        const folder = folders.find(
          f => f.id === folderId && f.userId === req.user!.id
        );
        if (!folder) {
          return res.status(404).json({ error: "Folder not found" });
        }
      }

      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        userId: req.user.id,
        title,
        url,
        description,
        tags: tags || [],
        folderId,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        visitCount: 0,
      };

      bookmarks.push(newBookmark);

      res.status(201).json({
        message: "Bookmark created successfully",
        bookmark: newBookmark,
      });
    } catch (error) {
      console.error("Create bookmark error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

export const updateBookmark: RequestHandler[] = [
  validateParams(z.object({ id: z.string() })),
  validateBody(schemas.bookmarks.update),
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { id } = req.params;
      const updates = req.body;

      const bookmarkIndex = bookmarks.findIndex(
        b => b.id === id && b.userId === req.user!.id
      );

      if (bookmarkIndex === -1) {
        return res.status(404).json({ error: "Bookmark not found" });
      }

      // Update bookmark
      bookmarks[bookmarkIndex] = {
        ...bookmarks[bookmarkIndex],
        ...updates,
        updatedAt: new Date(),
      };

      res.json({
        message: "Bookmark updated successfully",
        bookmark: bookmarks[bookmarkIndex],
      });
    } catch (error) {
      console.error("Update bookmark error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

export const deleteBookmark: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const { id } = req.params;

    const bookmarkIndex = bookmarks.findIndex(
      b => b.id === id && b.userId === req.user!.id
    );

    if (bookmarkIndex === -1) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    bookmarks.splice(bookmarkIndex, 1);

    res.json({ message: "Bookmark deleted successfully" });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleFavorite: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const { id } = req.params;

    const bookmarkIndex = bookmarks.findIndex(
      b => b.id === id && b.userId === req.user!.id
    );

    if (bookmarkIndex === -1) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    bookmarks[bookmarkIndex].isFavorite = !bookmarks[bookmarkIndex].isFavorite;
    bookmarks[bookmarkIndex].updatedAt = new Date();

    res.json({
      message: "Bookmark favorite status updated",
      bookmark: bookmarks[bookmarkIndex],
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createFolder: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const { name, description, parentId } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    // Validate parent folder exists if provided
    if (parentId) {
      const parentFolder = folders.find(
        f => f.id === parentId && f.userId === req.user!.id
      );
      if (!parentFolder) {
        return res.status(404).json({ error: "Parent folder not found" });
      }
    }

    const newFolder: BookmarkFolder = {
      id: Date.now().toString(),
      userId: req.user.id,
      name: name.trim(),
      description,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    folders.push(newFolder);

    res.status(201).json({
      message: "Folder created successfully",
      folder: newFolder,
    });
  } catch (error) {
    console.error("Create folder error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteFolder: RequestHandler = async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const { id } = req.params;

    const folderIndex = folders.findIndex(
      f => f.id === id && f.userId === req.user!.id
    );

    if (folderIndex === -1) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Move bookmarks from deleted folder to root
    bookmarks.forEach(bookmark => {
      if (bookmark.folderId === id && bookmark.userId === req.user!.id) {
        bookmark.folderId = undefined;
        bookmark.updatedAt = new Date();
      }
    });

    folders.splice(folderIndex, 1);

    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Delete folder error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};