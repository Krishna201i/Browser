import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

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

export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [activeDownloads, setActiveDownloads] = useState(0);

  // Load downloads from localStorage on mount
  useEffect(() => {
    const savedDownloads = localStorage.getItem("kruger-downloads");
    if (savedDownloads) {
      try {
        const parsed = JSON.parse(savedDownloads);
        setDownloads(
          parsed.map((d: any) => ({
            ...d,
            startTime: new Date(d.startTime),
            endTime: d.endTime ? new Date(d.endTime) : undefined,
          })),
        );
      } catch (error) {
        console.error("Failed to load downloads:", error);
      }
    }
  }, []);

  // Save downloads to localStorage whenever downloads change
  useEffect(() => {
    localStorage.setItem("kruger-downloads", JSON.stringify(downloads));
    const active = downloads.filter((d) => d.status === "downloading").length;
    setActiveDownloads(active);
  }, [downloads]);

  const startDownload = useCallback((url: string, filename?: string) => {
    const fileExtension = url.split(".").pop()?.toLowerCase() || "";
    const actualFilename = filename || url.split("/").pop() || "download";

    // Determine file type based on extension
    let fileType = "document";
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(fileExtension)) {
      fileType = "image";
    } else if (
      ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(fileExtension)
    ) {
      fileType = "video";
    } else if (["mp3", "wav", "flac", "aac", "ogg"].includes(fileExtension)) {
      fileType = "audio";
    } else if (["zip", "rar", "7z", "tar", "gz"].includes(fileExtension)) {
      fileType = "archive";
    } else if (
      ["js", "ts", "jsx", "tsx", "html", "css", "py", "java", "cpp"].includes(
        fileExtension,
      )
    ) {
      fileType = "code";
    } else if (["exe", "msi", "dmg", "deb", "rpm"].includes(fileExtension)) {
      fileType = "application";
    }

    const newDownload: DownloadItem = {
      id: Date.now().toString(),
      filename: actualFilename,
      url,
      progress: 0,
      status: "downloading",
      size: Math.floor(Math.random() * 50000000) + 1000000, // Random size 1-50MB
      downloadedSize: 0,
      speed: 0,
      timeRemaining: "Calculating...",
      fileType,
      startTime: new Date(),
    };

    setDownloads((prev) => [newDownload, ...prev]);

    // Simulate realistic download progress
    simulateDownload(newDownload.id);

    toast.success(`Download started: ${actualFilename}`);
    return newDownload.id;
  }, []);

  const simulateDownload = useCallback((downloadId: string) => {
    const interval = setInterval(() => {
      setDownloads((prev) =>
        prev.map((download) => {
          if (download.id !== downloadId || download.status !== "downloading") {
            return download;
          }

          const progress = download.progress;
          let speedMultiplier = 1;

          // Realistic download speed curve
          if (progress < 10) {
            speedMultiplier = 0.3; // Slow start
          } else if (progress < 80) {
            speedMultiplier = 1.2; // Fast middle
          } else {
            speedMultiplier = 0.7; // Slower end
          }

          const baseSpeed = 500000 + Math.random() * 2000000; // 0.5-2.5 MB/s
          const currentSpeed = baseSpeed * speedMultiplier;
          const increment = currentSpeed / 10; // Update every 100ms

          const newDownloadedSize = Math.min(
            download.downloadedSize + increment,
            download.size,
          );
          const newProgress = (newDownloadedSize / download.size) * 100;

          const remainingBytes = download.size - newDownloadedSize;
          const timeRemaining = remainingBytes / currentSpeed;

          if (newProgress >= 100) {
            clearInterval(interval);
            toast.success(`Download completed: ${download.filename}`);
            return {
              ...download,
              progress: 100,
              downloadedSize: download.size,
              status: "completed" as const,
              speed: 0,
              timeRemaining: "Complete",
              endTime: new Date(),
            };
          }

          return {
            ...download,
            progress: newProgress,
            downloadedSize: newDownloadedSize,
            speed: currentSpeed,
            timeRemaining:
              timeRemaining > 1
                ? `${Math.ceil(timeRemaining)}s`
                : "Almost done...",
          };
        }),
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const pauseDownload = useCallback((downloadId: string) => {
    setDownloads((prev) =>
      prev.map((download) =>
        download.id === downloadId && download.status === "downloading"
          ? { ...download, status: "paused" as const, speed: 0 }
          : download,
      ),
    );
    toast.success("Download paused");
  }, []);

  const resumeDownload = useCallback(
    (downloadId: string) => {
      setDownloads((prev) =>
        prev.map((download) =>
          download.id === downloadId && download.status === "paused"
            ? { ...download, status: "downloading" as const }
            : download,
        ),
      );

      // Re-simulate download for resumed download
      const download = downloads.find((d) => d.id === downloadId);
      if (download) {
        simulateDownload(downloadId);
      }

      toast.success("Download resumed");
    },
    [downloads, simulateDownload],
  );

  const cancelDownload = useCallback((downloadId: string) => {
    setDownloads((prev) =>
      prev.map((download) =>
        download.id === downloadId
          ? { ...download, status: "cancelled" as const, speed: 0 }
          : download,
      ),
    );
    toast.success("Download cancelled");
  }, []);

  const removeDownload = useCallback((downloadId: string) => {
    setDownloads((prev) =>
      prev.filter((download) => download.id !== downloadId),
    );
    toast.success("Download removed");
  }, []);

  const clearCompleted = useCallback(() => {
    setDownloads((prev) =>
      prev.filter((download) => download.status !== "completed"),
    );
    toast.success("Cleared completed downloads");
  }, []);

  const getActiveDownloads = useCallback(() => {
    return downloads.filter((d) => d.status === "downloading");
  }, [downloads]);

  const getCompletedDownloads = useCallback(() => {
    return downloads.filter((d) => d.status === "completed");
  }, [downloads]);

  return {
    downloads,
    activeDownloads,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    removeDownload,
    clearCompleted,
    getActiveDownloads,
    getCompletedDownloads,
  };
}
