import React, { useState, useEffect } from "react";
import {
  Download,
  Pause,
  Play,
  X,
  Trash2,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useDownloads } from "@/hooks/use-downloads";

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  progress: number;
  status: "downloading" | "paused" | "completed" | "failed" | "cancelled";
  size: number;
  downloadedSize: number;
  speed: number;
  timeRemaining: string;
  fileType: string;
  startTime: Date;
  endTime?: Date;
}

interface DownloadManagerProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  downloadCount?: number;
}

export default function DownloadManager({
  isOpen,
  onOpenChange,
  downloadCount = 0,
}: DownloadManagerProps) {
  const {
    downloads,
    activeDownloads,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    removeDownload,
    clearCompleted,
  } = useDownloads();

  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "downloading" | "completed" | "failed"
  >("all");

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <Image className="h-5 w-5 text-blue-500" />;
      case "video":
        return <Video className="h-5 w-5 text-purple-500" />;
      case "audio":
        return <Music className="h-5 w-5 text-green-500" />;
      case "document":
        return <FileText className="h-5 w-5 text-orange-500" />;
      case "archive":
        return <Archive className="h-5 w-5 text-yellow-500" />;
      case "code":
        return <Code className="h-5 w-5 text-cyan-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: DownloadItem["status"]) => {
    switch (status) {
      case "downloading":
        return <Download className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond === 0) return "0 B/s";
    const k = 1024;
    const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return (
      parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    );
  };

  const handlePauseResume = (id: string) => {
    const download = downloads.find((d) => d.id === id);
    if (download?.status === "downloading") {
      pauseDownload(id);
    } else if (download?.status === "paused") {
      resumeDownload(id);
    }
  };

  const handleCancel = (id: string) => {
    cancelDownload(id);
  };

  const handleRemove = (id: string) => {
    removeDownload(id);
  };

  const handleOpenFile = (download: DownloadItem) => {
    if (download.status === "completed") {
      toast.success(`Opening ${download.filename}`);
      // In a real app, this would open the file
    } else {
      toast.error("File not ready to open");
    }
  };

  const handleClearCompleted = () => {
    clearCompleted();
  };

  const filteredDownloads = downloads.filter((download) => {
    if (selectedFilter === "all") return true;
    return download.status === selectedFilter;
  });

  const completedDownloads = downloads.filter(
    (d) => d.status === "completed",
  ).length;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground relative"
          title="Downloads"
        >
          <Download className="h-4 w-4" />
          {activeDownloads > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {activeDownloads}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Manager
          </SheetTitle>
          <SheetDescription>
            Manage your downloads with blazing-fast Kruger speed
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Download Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {activeDownloads}
                </div>
                <div className="text-sm text-muted-foreground">Downloading</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {completedDownloads}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {downloads.length}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "downloading", label: "Downloading" },
              { key: "completed", label: "Completed" },
              { key: "failed", label: "Failed" },
            ].map((filter) => (
              <Button
                key={filter.key}
                size="sm"
                variant={selectedFilter === filter.key ? "default" : "outline"}
                onClick={() => setSelectedFilter(filter.key as any)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearCompleted}
              disabled={completedDownloads === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Completed
            </Button>
            <Button size="sm" variant="outline">
              <FolderOpen className="h-4 w-4 mr-2" />
              Open Downloads Folder
            </Button>
          </div>

          {/* Downloads List */}
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-4 space-y-3">
              {filteredDownloads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No downloads found</p>
                  <p className="text-sm">
                    Start downloading files to see them here
                  </p>
                </div>
              ) : (
                filteredDownloads.map((download) => (
                  <Card
                    key={download.id}
                    className="transition-all hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* File Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getFileIcon(download.fileType)}
                        </div>

                        {/* Download Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p
                              className="font-medium truncate"
                              title={download.filename}
                            >
                              {download.filename}
                            </p>
                            {getStatusIcon(download.status)}
                          </div>

                          {/* Progress Bar */}
                          {download.status !== "completed" &&
                            download.status !== "failed" && (
                              <Progress
                                value={download.progress}
                                className="mb-2"
                              />
                            )}

                          {/* Download Details */}
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>
                                {formatBytes(download.downloadedSize)} /{" "}
                                {formatBytes(download.size)}
                              </span>
                              {download.status === "downloading" && (
                                <span>{formatSpeed(download.speed)}</span>
                              )}
                            </div>
                            {download.status === "downloading" && (
                              <div className="flex justify-between">
                                <span>{download.progress}% complete</span>
                                <span>{download.timeRemaining} remaining</span>
                              </div>
                            )}
                            {download.status === "completed" &&
                              download.endTime && (
                                <div>
                                  Completed{" "}
                                  {new Date(
                                    download.endTime,
                                  ).toLocaleTimeString()}
                                </div>
                              )}
                            {download.status === "failed" && (
                              <div className="text-red-500">
                                Download failed - Connection lost
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                          {download.status === "downloading" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handlePauseResume(download.id)}
                              title="Pause download"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {download.status === "paused" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handlePauseResume(download.id)}
                              title="Resume download"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {download.status === "completed" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleOpenFile(download)}
                              title="Open file"
                            >
                              <FolderOpen className="h-4 w-4" />
                            </Button>
                          )}
                          {(download.status === "downloading" ||
                            download.status === "paused") && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCancel(download.id)}
                              title="Cancel download"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemove(download.id)}
                            title="Remove from list"
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
