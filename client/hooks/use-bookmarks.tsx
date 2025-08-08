import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  createdAt: Date;
  lastVisited?: Date;
  visitCount: number;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);

  // Load bookmarks and folders from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("kruger-bookmarks");
    const savedFolders = localStorage.getItem("kruger-bookmark-folders");

    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        setBookmarks(
          parsed.map((b: any) => ({
            ...b,
            createdAt: new Date(b.createdAt),
            lastVisited: b.lastVisited ? new Date(b.lastVisited) : undefined,
          })),
        );
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
      }
    }

    if (savedFolders) {
      try {
        const parsed = JSON.parse(savedFolders);
        setFolders(
          parsed.map((f: any) => ({
            ...f,
            createdAt: new Date(f.createdAt),
          })),
        );
      } catch (error) {
        console.error("Failed to load folders:", error);
      }
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("kruger-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Save folders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("kruger-bookmark-folders", JSON.stringify(folders));
  }, [folders]);

  const addBookmark = useCallback(
    (
      title: string,
      url: string,
      description?: string,
      tags: string[] = [],
      folderId?: string,
    ) => {
      // Check if bookmark already exists
      const existingBookmark = bookmarks.find((b) => b.url === url);
      if (existingBookmark) {
        toast.error("Bookmark already exists");
        return null;
      }

      // Get favicon URL
      const favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;

      const newBookmark: BookmarkItem = {
        id: Date.now().toString(),
        title,
        url,
        description,
        favicon,
        tags,
        folderId,
        isFavorite: false,
        createdAt: new Date(),
        visitCount: 0,
      };

      setBookmarks((prev) => [newBookmark, ...prev]);
      toast.success(`Bookmark added: ${title}`);
      return newBookmark.id;
    },
    [bookmarks],
  );

  const removeBookmark = useCallback(
    (bookmarkId: string) => {
      const bookmark = bookmarks.find((b) => b.id === bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      if (bookmark) {
        toast.success(`Bookmark removed: ${bookmark.title}`);
      }
    },
    [bookmarks],
  );

  const updateBookmark = useCallback(
    (bookmarkId: string, updates: Partial<BookmarkItem>) => {
      setBookmarks((prev) =>
        prev.map((bookmark) =>
          bookmark.id === bookmarkId ? { ...bookmark, ...updates } : bookmark,
        ),
      );
    },
    [],
  );

  const toggleFavorite = useCallback(
    (bookmarkId: string) => {
      setBookmarks((prev) =>
        prev.map((bookmark) =>
          bookmark.id === bookmarkId
            ? { ...bookmark, isFavorite: !bookmark.isFavorite }
            : bookmark,
        ),
      );

      const bookmark = bookmarks.find((b) => b.id === bookmarkId);
      if (bookmark) {
        toast.success(
          bookmark.isFavorite
            ? `Removed ${bookmark.title} from favorites`
            : `Added ${bookmark.title} to favorites`,
        );
      }
    },
    [bookmarks],
  );

  const visitBookmark = useCallback((bookmarkId: string) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === bookmarkId
          ? {
              ...bookmark,
              visitCount: bookmark.visitCount + 1,
              lastVisited: new Date(),
            }
          : bookmark,
      ),
    );
  }, []);

  const addFolder = useCallback(
    (name: string, description?: string, parentId?: string) => {
      const newFolder: BookmarkFolder = {
        id: Date.now().toString(),
        name,
        description,
        parentId,
        createdAt: new Date(),
      };

      setFolders((prev) => [...prev, newFolder]);
      toast.success(`Folder created: ${name}`);
      return newFolder.id;
    },
    [],
  );

  const removeFolder = useCallback(
    (folderId: string) => {
      const folder = folders.find((f) => f.id === folderId);

      // Move bookmarks from deleted folder to root
      setBookmarks((prev) =>
        prev.map((bookmark) =>
          bookmark.folderId === folderId
            ? { ...bookmark, folderId: undefined }
            : bookmark,
        ),
      );

      setFolders((prev) => prev.filter((f) => f.id !== folderId));

      if (folder) {
        toast.success(`Folder deleted: ${folder.name}`);
      }
    },
    [folders],
  );

  const searchBookmarks = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return bookmarks.filter(
        (bookmark) =>
          bookmark.title.toLowerCase().includes(lowerQuery) ||
          bookmark.url.toLowerCase().includes(lowerQuery) ||
          bookmark.description?.toLowerCase().includes(lowerQuery) ||
          bookmark.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
      );
    },
    [bookmarks],
  );

  const getBookmarksByFolder = useCallback(
    (folderId?: string) => {
      return bookmarks.filter((bookmark) => bookmark.folderId === folderId);
    },
    [bookmarks],
  );

  const getFavoriteBookmarks = useCallback(() => {
    return bookmarks.filter((bookmark) => bookmark.isFavorite);
  }, [bookmarks]);

  const getAllTags = useCallback(() => {
    const tags = new Set<string>();
    bookmarks.forEach((bookmark) => {
      bookmark.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [bookmarks]);

  const getBookmarksByTag = useCallback(
    (tag: string) => {
      return bookmarks.filter((bookmark) => bookmark.tags.includes(tag));
    },
    [bookmarks],
  );

  const isBookmarked = useCallback(
    (url: string) => {
      return bookmarks.some((bookmark) => bookmark.url === url);
    },
    [bookmarks],
  );

  const getBookmarkByUrl = useCallback(
    (url: string) => {
      return bookmarks.find((bookmark) => bookmark.url === url);
    },
    [bookmarks],
  );

  return {
    bookmarks,
    folders,
    addBookmark,
    removeBookmark,
    updateBookmark,
    toggleFavorite,
    visitBookmark,
    addFolder,
    removeFolder,
    searchBookmarks,
    getBookmarksByFolder,
    getFavoriteBookmarks,
    getAllTags,
    getBookmarksByTag,
    isBookmarked,
    getBookmarkByUrl,
  };
}
