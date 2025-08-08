/**
 * History Manager Component
 * Shows browsing history with search, filter, and privacy options
 */

import React, { useState, useMemo } from "react";
import {
  History,
  Search,
  Clock,
  Globe,
  Trash2,
  Calendar,
  Eye,
  EyeOff,
  Filter,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrowserHistory } from "@/hooks/use-browser-history";

interface HistoryManagerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (url: string) => void;
  isIncognito?: boolean;
}

export default function HistoryManager({
  isOpen,
  onOpenChange,
  onNavigate,
  isIncognito = false,
}: HistoryManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  const history = useBrowserHistory();

  // Filter and search history entries
  const filteredHistory = useMemo(() => {
    let filtered = history.entries;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.url.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply time filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (timeFilter) {
      case "today":
        filtered = filtered.filter(
          (entry) => new Date(entry.timestamp) >= today,
        );
        break;
      case "yesterday":
        filtered = filtered.filter((entry) => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= yesterday && entryDate < today;
        });
        break;
      case "week":
        filtered = filtered.filter(
          (entry) => new Date(entry.timestamp) >= weekAgo,
        );
        break;
      default:
        break;
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [history.entries, searchQuery, timeFilter]);

  const handleNavigate = (url: string) => {
    if (onNavigate) {
      onNavigate(url);
      onOpenChange(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    history.removeEntry(id);
    setSelectedEntries((prev) => prev.filter((entryId) => entryId !== id));
  };

  const handleDeleteSelected = () => {
    selectedEntries.forEach((id) => history.removeEntry(id));
    setSelectedEntries([]);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all browsing history? This action cannot be undone.",
      )
    ) {
      history.clearAll();
      setSelectedEntries([]);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedEntries((prev) =>
      prev.includes(id)
        ? prev.filter((entryId) => entryId !== id)
        : [...prev, id],
    );
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const getGroupedHistory = () => {
    const groups: { [key: string]: typeof filteredHistory } = {};

    filteredHistory.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      let groupKey;
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else {
        groupKey = date.toLocaleDateString();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(entry);
    });

    return groups;
  };

  const groupedHistory = getGroupedHistory();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="relative">
              {isIncognito ? (
                <EyeOff className="h-6 w-6 text-purple-500" />
              ) : (
                <History className="h-6 w-6 text-blue-500" />
              )}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            {isIncognito ? "Private Browsing History" : "Browsing History"}
          </SheetTitle>
          <SheetDescription>
            {isIncognito
              ? "Private browsing history (temporary session only)"
              : `${filteredHistory.length} entries found`}
          </SheetDescription>
        </SheetHeader>

        {isIncognito ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-8 text-center">
                <EyeOff className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  Private Browsing Active
                </h3>
                <p className="text-purple-600 dark:text-purple-300 text-sm">
                  Your browsing history is not being saved in this private
                  session. History will be cleared when you close this tab.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Search and Filter Controls */}
            <div className="space-y-3 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Past week</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  {selectedEntries.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete ({selectedEntries.length})
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>
            </div>

            {/* History List */}
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {Object.keys(groupedHistory).length === 0 ? (
                  <Card className="text-center py-8">
                    <CardContent>
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No History Found</h3>
                      <p className="text-muted-foreground text-sm">
                        {searchQuery
                          ? "Try different search terms"
                          : "Start browsing to build your history"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  Object.entries(groupedHistory).map(([group, entries]) => (
                    <div key={group} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {group}
                        <Separator className="flex-1" />
                        <span>{entries.length} entries</span>
                      </div>

                      {entries.map((entry) => (
                        <Card
                          key={entry.id}
                          className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                            selectedEntries.includes(entry.id)
                              ? "ring-2 ring-blue-500"
                              : ""
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selectedEntries.includes(entry.id)}
                                onChange={() => toggleSelection(entry.id)}
                                className="mt-1"
                              />

                              <div
                                className="flex-1 min-w-0"
                                onClick={() => handleNavigate(entry.url)}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <h4 className="font-medium text-sm truncate">
                                    {entry.title}
                                  </h4>
                                </div>
                                <p className="text-xs text-muted-foreground truncate mb-1">
                                  {entry.url}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(entry.timestamp)}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(entry.url, "_blank");
                                  }}
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEntry(entry.id);
                                  }}
                                  title="Delete entry"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
