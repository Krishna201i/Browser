import { useState, useEffect, useCallback } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop" | "tv";
export type Orientation = "portrait" | "landscape";

interface DeviceInfo {
  type: DeviceType;
  orientation: Orientation;
  screenWidth: number;
  screenHeight: number;
  isTouch: boolean;
  userAgent: string;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  pixelRatio: number;
}

const getDeviceType = (width: number, height: number): DeviceType => {
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);

  // TV detection (very large screens)
  if (minDimension >= 1080 && maxDimension >= 1920) {
    return "tv";
  }

  // Mobile detection (small screens)
  if (maxDimension <= 768) {
    return "mobile";
  }

  // Tablet detection (medium screens)
  if (maxDimension <= 1024) {
    return "tablet";
  }

  // Desktop (large screens)
  return "desktop";
};

const getOrientation = (width: number, height: number): Orientation => {
  return width > height ? "landscape" : "portrait";
};

const detectTouchDevice = (): boolean => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

export function useDevice() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const type = getDeviceType(width, height);

    return {
      type,
      orientation: getOrientation(width, height),
      screenWidth: width,
      screenHeight: height,
      isTouch: detectTouchDevice(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile: type === "mobile",
      isTablet: type === "tablet",
      isDesktop: type === "desktop",
      pixelRatio: window.devicePixelRatio || 1,
    };
  });

  const updateDeviceInfo = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const type = getDeviceType(width, height);

    setDeviceInfo((prev) => ({
      ...prev,
      type,
      orientation: getOrientation(width, height),
      screenWidth: width,
      screenHeight: height,
      isMobile: type === "mobile",
      isTablet: type === "tablet",
      isDesktop: type === "desktop",
      pixelRatio: window.devicePixelRatio || 1,
    }));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      updateDeviceInfo();
    };

    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated
      setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [updateDeviceInfo]);

  const getResponsiveLayout = useCallback(() => {
    switch (deviceInfo.type) {
      case "mobile":
        return {
          layout: "mobile" as const,
          sidebarPosition: "bottom" as const,
          tabLayout: "stack" as const,
          showFullToolbar: false,
          compactMode: true,
          touchOptimized: true,
        };
      case "tablet":
        return {
          layout: "tablet" as const,
          sidebarPosition:
            deviceInfo.orientation === "landscape"
              ? "left"
              : ("bottom" as const),
          tabLayout:
            deviceInfo.orientation === "landscape"
              ? "horizontal"
              : ("stack" as const),
          showFullToolbar: true,
          compactMode: false,
          touchOptimized: true,
        };
      case "desktop":
        return {
          layout: "desktop" as const,
          sidebarPosition: "left" as const,
          tabLayout: "horizontal" as const,
          showFullToolbar: true,
          compactMode: false,
          touchOptimized: false,
        };
      case "tv":
        return {
          layout: "tv" as const,
          sidebarPosition: "left" as const,
          tabLayout: "horizontal" as const,
          showFullToolbar: true,
          compactMode: false,
          touchOptimized: false,
        };
      default:
        return {
          layout: "desktop" as const,
          sidebarPosition: "left" as const,
          tabLayout: "horizontal" as const,
          showFullToolbar: true,
          compactMode: false,
          touchOptimized: false,
        };
    }
  }, [deviceInfo.type, deviceInfo.orientation]);

  const getResponsiveClasses = useCallback(() => {
    const layout = getResponsiveLayout();
    const classes = [
      `device-${deviceInfo.type}`,
      `orientation-${deviceInfo.orientation}`,
    ];

    if (layout.compactMode) classes.push("compact-mode");
    if (layout.touchOptimized) classes.push("touch-optimized");
    if (deviceInfo.pixelRatio > 1) classes.push("high-dpi");

    return classes.join(" ");
  }, [deviceInfo, getResponsiveLayout]);

  const isLargeScreen =
    deviceInfo.type === "desktop" || deviceInfo.type === "tv";
  const isTouchDevice = deviceInfo.isTouch;
  const isPortrait = deviceInfo.orientation === "portrait";
  const isLandscape = deviceInfo.orientation === "landscape";

  return {
    deviceInfo,
    getResponsiveLayout,
    getResponsiveClasses,
    isLargeScreen,
    isTouchDevice,
    isPortrait,
    isLandscape,
    updateDeviceInfo,
  };
}
