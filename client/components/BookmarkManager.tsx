import React, { useState, useEffect } from "react";
import {
  Bookmark,
  Star,
  Folder,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  FolderOpen,
  Globe,
  ExternalLink,
  Heart,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useBookmarks } from "@/hooks/use-bookmarks";

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

interface BookmarkManagerProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onNavigate?: (url: string) => void;
  currentUrl?: string;
  currentTitle?: string;
}

export default function BookmarkManager({
  isOpen,
  onOpenChange,
  onNavigate,
  currentUrl,
  currentTitle,
}: BookmarkManagerProps) {
  const {
    bookmarks,
    folders,
    addBookmark,
    removeBookmark,
    toggleFavorite,
    visitBookmark,
    addFolder,
    removeFolder,
    getAllTags,
    isBookmarked,
  } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(
    null,
  );
  const [newBookmark, setNewBookmark] = useState({
    title: "",
    url: "",
    description: "",
    tags: "",
    folderId: "",
  });
  const [newFolder, setNewFolder] = useState({
    name: "",
    description: "",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);

  // Real bookmark data is now managed by the useBookmarks hook

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesFolder =
      selectedFolder === "all" || selectedFolder === "favorites"
        ? selectedFolder === "favorites"
          ? bookmark.isFavorite
          : true
        : bookmark.folderId === selectedFolder;

    const matchesTag = !selectedTag || bookmark.tags.includes(selectedTag);

    return matchesSearch && matchesFolder && matchesTag;
  });

  const handleAddBookmark = () => {
    if (!newBookmark.title || !newBookmark.url) {
      toast.error("Title and URL are required");
      return;
    }

    const tags = newBookmark.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    addBookmark(
      newBookmark.title,
      newBookmark.url,
      newBookmark.description,
      tags,
      newBookmark.folderId || undefined,
    );

    setNewBookmark({
      title: "",
      url: "",
      description: "",
      tags: "",
      folderId: "",
    });
    setShowAddDialog(false);
  };

  const handleQuickAdd = () => {
    if (currentUrl && currentTitle) {
      setNewBookmark({
        title: currentTitle,
        url: currentUrl,
        description: "",
        tags: "",
        folderId: "",
      });
      setShowAddDialog(true);
    } else {
      toast.error("No page to bookmark");
    }
  };

  const handleAddFolder = () => {
    if (!newFolder.name) {
      toast.error("Folder name is required");
      return;
    }

    addFolder(newFolder.name, newFolder.description);
    setNewFolder({ name: "", description: "" });
    setShowFolderDialog(false);
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
  };

  const handleDeleteBookmark = (id: string) => {
    removeBookmark(id);
  };

  const handleDeleteFolder = (id: string) => {
    removeFolder(id);
    if (selectedFolder === id) {
      setSelectedFolder("all");
    }
  };

  const handleVisitBookmark = (bookmark: BookmarkItem) => {
    visitBookmark(bookmark.id);

    if (onNavigate) {
      onNavigate(bookmark.url);
    }
    toast.success(`Opening ${bookmark.title}`);
  };

  const getBookmarkCountInFolder = (folderId: string) => {
    return bookmarks.filter((b) => b.folderId === folderId).length;
  };

  const favoriteCount = bookmarks.filter((b) => b.isFavorite).length;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          title="Bookmarks"
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[700px] sm:max-w-[700px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Bookmark Manager
          </SheetTitle>
          <SheetDescription>
            Organize and access your favorite websites
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleQuickAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Bookmark This Page
            </Button>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bookmark
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Bookmark</DialogTitle>
                  <DialogDescription>
                    Add a new bookmark to your collection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newBookmark.title}
                      onChange={(e) =>
                        setNewBookmark((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter bookmark title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={newBookmark.url}
                      onChange={(e) =>
                        setNewBookmark((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newBookmark.description}
                      onChange={(e) =>
                        setNewBookmark((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Brief description of the bookmark"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={newBookmark.tags}
                      onChange={(e) =>
                        setNewBookmark((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      placeholder="react, documentation, frontend"
                    />
                  </div>
                  <div>
                    <Label htmlFor="folder">Folder</Label>
                    <select
                      id="folder"
                      value={newBookmark.folderId}
                      onChange={(e) =>
                        setNewBookmark((prev) => ({
                          ...prev,
                          folderId: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">No folder</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddBookmark}>Add Bookmark</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Folder className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Organize your bookmarks into folders
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folderName">Folder Name</Label>
                    <Input
                      id="folderName"
                      value={newFolder.name}
                      onChange={(e) =>
                        setNewFolder((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter folder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="folderDescription">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="folderDescription"
                      value={newFolder.description}
                      onChange={(e) =>
                        setNewFolder((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Brief description of the folder"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowFolderDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddFolder}>Create Folder</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="bookmarks">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
              <TabsTrigger value="folders">Folders</TabsTrigger>
            </TabsList>

            <TabsContent value="bookmarks" className="space-y-4">
              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedFolder === "all" ? "default" : "outline"}
                  onClick={() => setSelectedFolder("all")}
                >
                  All ({bookmarks.length})
                </Button>
                <Button
                  size="sm"
                  variant={
                    selectedFolder === "favorites" ? "default" : "outline"
                  }
                  onClick={() => setSelectedFolder("favorites")}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Favorites ({favoriteCount})
                </Button>
                {folders.map((folder) => (
                  <Button
                    key={folder.id}
                    size="sm"
                    variant={
                      selectedFolder === folder.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    <Folder className="h-4 w-4 mr-1" />
                    {folder.name} ({getBookmarkCountInFolder(folder.id)})
                  </Button>
                ))}
              </div>

              {/* Tag Filter */}
              {getAllTags().length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  <span className="text-sm text-muted-foreground mr-2">
                    Tags:
                  </span>
                  <Button
                    size="sm"
                    variant={!selectedTag ? "default" : "outline"}
                    onClick={() => setSelectedTag("")}
                  >
                    All
                  </Button>
                  {getAllTags().map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      variant={selectedTag === tag ? "default" : "outline"}
                      onClick={() => setSelectedTag(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              )}

              {/* Bookmarks List */}
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredBookmarks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No bookmarks found</p>
                      <p className="text-sm">
                        Add your first bookmark to get started
                      </p>
                    </div>
                  ) : (
                    filteredBookmarks.map((bookmark) => (
                      <Card
                        key={bookmark.id}
                        className="transition-all hover:shadow-md cursor-pointer"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Favicon */}
                            <div className="flex-shrink-0 mt-1">
                              {bookmark.favicon ? (
                                <img
                                  src={bookmark.favicon}
                                  alt=""
                                  className="w-4 h-4"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ) : (
                                <Globe className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            {/* Bookmark Info */}
                            <div
                              className="flex-1 min-w-0"
                              onClick={() => handleVisitBookmark(bookmark)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium truncate">
                                  {bookmark.title}
                                </p>
                                {bookmark.isFavorite && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                              </div>
                              <p className="text-sm text-blue-600 truncate mb-1">
                                {bookmark.url}
                              </p>
                              {bookmark.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {bookmark.description}
                                </p>
                              )}

                              {/* Tags */}
                              {bookmark.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap mb-2">
                                  {bookmark.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Stats */}
                              <div className="text-xs text-muted-foreground">
                                <span>Visited {bookmark.visitCount} times</span>
                                {bookmark.lastVisited && (
                                  <span>
                                    {" "}
                                    • Last:{" "}
                                    {bookmark.lastVisited.toLocaleDateString()}
                                  </span>
                                )}
                                <span>
                                  {" "}
                                  • Added:{" "}
                                  {bookmark.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(bookmark.id);
                                }}
                                title={
                                  bookmark.isFavorite
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                                }
                              >
                                <Star
                                  className={`h-4 w-4 ${bookmark.isFavorite ? "text-yellow-500 fill-current" : ""}`}
                                />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVisitBookmark(bookmark);
                                }}
                                title="Open in new tab"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBookmark(bookmark.id);
                                }}
                                title="Delete bookmark"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="folders" className="space-y-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {folders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No folders created</p>
                      <p className="text-sm">
                        Create folders to organize your bookmarks
                      </p>
                    </div>
                  ) : (
                    folders.map((folder) => (
                      <Card
                        key={folder.id}
                        className="transition-all hover:shadow-md"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Folder className="h-5 w-5 text-blue-500 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{folder.name}</p>
                                <Badge variant="outline">
                                  {getBookmarkCountInFolder(folder.id)}{" "}
                                  bookmarks
                                </Badge>
                              </div>
                              {folder.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {folder.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Created: {folder.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setSelectedFolder(folder.id)}
                                title="View folder contents"
                              >
                                <FolderOpen className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteFolder(folder.id)}
                                title="Delete folder"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
