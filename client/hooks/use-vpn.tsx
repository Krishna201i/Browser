import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface VPNServer {
  id: string;
  name: string;
  country: string;
  city: string;
  flag: string;
  ping: number;
  load: number;
  premium: boolean;
}

interface VPNSettings {
  isConnected: boolean;
  autoConnect: boolean;
  killSwitch: boolean;
  dnsLeakProtection: boolean;
  protocol: "OpenVPN" | "WireGuard" | "IKEv2";
  currentServer: VPNServer | null;
  connectionTime: Date | null;
  bytesTransferred: { upload: number; download: number };
}

const defaultSettings: VPNSettings = {
  isConnected: false,
  autoConnect: false,
  killSwitch: true,
  dnsLeakProtection: true,
  protocol: "WireGuard",
  currentServer: null,
  connectionTime: null,
  bytesTransferred: { upload: 0, download: 0 },
};

const vpnServers: VPNServer[] = [
  {
    id: "us-ny",
    name: "New York",
    country: "United States",
    city: "New York",
    flag: "🇺🇸",
    ping: 25,
    load: 45,
    premium: false,
  },
  {
    id: "us-ca",
    name: "Los Angeles",
    country: "United States",
    city: "Los Angeles",
    flag: "🇺🇸",
    ping: 30,
    load: 60,
    premium: false,
  },
  {
    id: "uk-london",
    name: "London",
    country: "United Kingdom",
    city: "London",
    flag: "🇬🇧",
    ping: 40,
    load: 30,
    premium: false,
  },
  {
    id: "de-berlin",
    name: "Berlin",
    country: "Germany",
    city: "Berlin",
    flag: "🇩🇪",
    ping: 35,
    load: 25,
    premium: false,
  },
  {
    id: "jp-tokyo",
    name: "Tokyo",
    country: "Japan",
    city: "Tokyo",
    flag: "🇯🇵",
    ping: 80,
    load: 70,
    premium: true,
  },
  {
    id: "sg-singapore",
    name: "Singapore",
    country: "Singapore",
    city: "Singapore",
    flag: "🇸🇬",
    ping: 75,
    load: 40,
    premium: true,
  },
  {
    id: "ca-toronto",
    name: "Toronto",
    country: "Canada",
    city: "Toronto",
    flag: "🇨🇦",
    ping: 35,
    load: 55,
    premium: false,
  },
  {
    id: "au-sydney",
    name: "Sydney",
    country: "Australia",
    city: "Sydney",
    flag: "🇦🇺",
    ping: 120,
    load: 35,
    premium: true,
  },
  {
    id: "fr-paris",
    name: "Paris",
    country: "France",
    city: "Paris",
    flag: "🇫🇷",
    ping: 45,
    load: 50,
    premium: false,
  },
  {
    id: "nl-amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    city: "Amsterdam",
    flag: "🇳🇱",
    ping: 38,
    load: 28,
    premium: false,
  },
];

export function useVPN() {
  const [settings, setSettings] = useState<VPNSettings>(defaultSettings);
  const [isConnecting, setIsConnecting] = useState(false);
  const [servers] = useState<VPNServer[]>(vpnServers);

  // Load VPN settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("kruger-vpn-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          isConnected: false,
          connectionTime: null,
        }));
      } catch (error) {
        console.error("Failed to load VPN settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    const settingsToSave = { ...settings };
    delete (settingsToSave as any).isConnected;
    delete (settingsToSave as any).connectionTime;
    delete (settingsToSave as any).bytesTransferred;
    localStorage.setItem("kruger-vpn-settings", JSON.stringify(settingsToSave));
  }, [settings]);

  // Simulate data transfer when connected
  useEffect(() => {
    if (!settings.isConnected) return;

    const interval = setInterval(() => {
      setSettings((prev) => ({
        ...prev,
        bytesTransferred: {
          upload: prev.bytesTransferred.upload + Math.random() * 1024 * 100, // Random KB
          download: prev.bytesTransferred.download + Math.random() * 1024 * 500, // Random KB
        },
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.isConnected]);

  const connectToServer = useCallback(
    async (serverId: string) => {
      const server = servers.find((s) => s.id === serverId);
      if (!server) {
        toast.error("Server not found");
        return false;
      }

      setIsConnecting(true);
      toast.info(`Connecting to ${server.name}...`);

      try {
        // Simulate connection process
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 + Math.random() * 3000),
        );

        setSettings((prev) => ({
          ...prev,
          isConnected: true,
          currentServer: server,
          connectionTime: new Date(),
          bytesTransferred: { upload: 0, download: 0 },
        }));

        toast.success(`Connected to ${server.name} ${server.flag}`);
        return true;
      } catch (error) {
        toast.error("Failed to connect to VPN");
        return false;
      } finally {
        setIsConnecting(false);
      }
    },
    [servers],
  );

  const disconnect = useCallback(async () => {
    setIsConnecting(true);
    toast.info("Disconnecting from VPN...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSettings((prev) => ({
        ...prev,
        isConnected: false,
        currentServer: null,
        connectionTime: null,
        bytesTransferred: { upload: 0, download: 0 },
      }));

      toast.success("Disconnected from VPN");
    } catch (error) {
      toast.error("Failed to disconnect");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const toggleConnection = useCallback(async () => {
    if (settings.isConnected) {
      await disconnect();
    } else {
      // Connect to fastest server
      const fastestServer = servers
        .filter((s) => !s.premium) // Free servers only for demo
        .sort((a, b) => a.ping - b.ping)[0];

      if (fastestServer) {
        await connectToServer(fastestServer.id);
      }
    }
  }, [settings.isConnected, disconnect, connectToServer, servers]);

  const updateSetting = useCallback(
    <K extends keyof VPNSettings>(key: K, value: VPNSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));

      const settingNames: Record<string, string> = {
        autoConnect: "Auto Connect",
        killSwitch: "Kill Switch",
        dnsLeakProtection: "DNS Leak Protection",
        protocol: "VPN Protocol",
      };

      if (settingNames[key as string]) {
        toast.success(
          `${settingNames[key as string]} ${typeof value === "boolean" ? (value ? "enabled" : "disabled") : "updated"}`,
        );
      }
    },
    [],
  );

  const getBestServers = useCallback(() => {
    return servers
      .filter((s) => !s.premium)
      .sort((a, b) => a.ping - b.ping)
      .slice(0, 5);
  }, [servers]);

  const getConnectionStatus = useCallback(() => {
    if (!settings.isConnected) return "Disconnected";
    if (isConnecting) return "Connecting...";

    const duration = settings.connectionTime
      ? Math.floor((Date.now() - settings.connectionTime.getTime()) / 1000)
      : 0;

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    return `Connected ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [settings.isConnected, settings.connectionTime, isConnecting]);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }, []);

  return {
    settings,
    servers,
    isConnecting,
    connectToServer,
    disconnect,
    toggleConnection,
    updateSetting,
    getBestServers,
    getConnectionStatus,
    formatBytes,
  };
}
