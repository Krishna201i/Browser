import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  ShieldCheck,
  Wifi,
  WifiOff,
  MapPin,
  Activity,
  Clock,
  Download,
  Upload,
  Zap,
} from "lucide-react";
import { useVPN } from "@/hooks/use-vpn";

export default function InteractiveVPN() {
  const vpn = useVPN();
  const [showDetails, setShowDetails] = useState(false);
  const [connectionTime, setConnectionTime] = useState(0);

  // Update connection timer
  useEffect(() => {
    if (vpn.settings.isConnected && vpn.settings.connectionTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - vpn.settings.connectionTime!.getTime()) / 1000,
        );
        setConnectionTime(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [vpn.settings.isConnected, vpn.settings.connectionTime]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getConnectionStrength = () => {
    if (!vpn.settings.isConnected) return 0;
    // Simulate connection strength based on protocol
    const protocolStrength = {
      WireGuard: 95,
      OpenVPN: 85,
      IKEv2: 90,
    };
    return protocolStrength[vpn.settings.protocol] || 80;
  };

  return (
    <Popover open={showDetails} onOpenChange={setShowDetails}>
      <PopoverTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className={`relative overflow-hidden transition-all duration-300 ${
              vpn.settings.isConnected
                ? "bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
                : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
            }`}
            disabled={vpn.isConnecting}
          >
            {/* Background pulse effect */}
            <motion.div
              className={`absolute inset-0 ${
                vpn.settings.isConnected ? "bg-green-500/20" : "bg-red-500/20"
              }`}
              animate={{
                opacity: vpn.settings.isConnected
                  ? [0.1, 0.3, 0.1]
                  : [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative flex items-center gap-2">
              {/* VPN Icon with animation */}
              <motion.div
                animate={{
                  rotate: vpn.isConnecting ? 360 : 0,
                  scale: vpn.settings.isConnected ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  rotate: {
                    duration: 1,
                    repeat: vpn.isConnecting ? Infinity : 0,
                  },
                  scale: { duration: 2, repeat: Infinity },
                }}
              >
                {vpn.isConnecting ? (
                  <Wifi className="h-4 w-4 text-yellow-500" />
                ) : vpn.settings.isConnected ? (
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <Shield className="h-4 w-4 text-red-500" />
                )}
              </motion.div>

              {/* Status text */}
              <span className="text-sm font-medium">
                {vpn.isConnecting
                  ? "Connecting..."
                  : vpn.settings.isConnected
                    ? "VPN ON"
                    : "VPN OFF"}
              </span>

              {/* Connection indicator */}
              {vpn.settings.isConnected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                >
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              )}
            </div>
          </Button>
        </motion.div>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 bg-card/95 backdrop-blur-md border border-border shadow-xl"
        side="bottom"
        align="start"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={`h-5 w-5 ${vpn.settings.isConnected ? "text-green-500" : "text-gray-400"}`}
              />
              <h3 className="font-semibold">VPN Status</h3>
            </div>
            <Badge variant={vpn.settings.isConnected ? "default" : "secondary"}>
              {vpn.settings.isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {/* Connection Toggle */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mb-4"
          >
            <Button
              onClick={vpn.toggleConnection}
              disabled={vpn.isConnecting}
              className={`w-full transition-all duration-300 ${
                vpn.settings.isConnected
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {vpn.isConnecting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : vpn.settings.isConnected ? (
                <WifiOff className="h-4 w-4 mr-2" />
              ) : (
                <Wifi className="h-4 w-4 mr-2" />
              )}
              {vpn.isConnecting
                ? "Connecting..."
                : vpn.settings.isConnected
                  ? "Disconnect"
                  : "Connect"}
            </Button>
          </motion.div>

          {/* Connection Details */}
          <AnimatePresence mode="wait">
            {vpn.settings.isConnected && vpn.settings.currentServer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Server Info */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Server Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {vpn.settings.currentServer.flag}
                    </span>
                    <div>
                      <div className="font-medium">
                        {vpn.settings.currentServer.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vpn.settings.currentServer.location}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                    <div className="font-mono text-lg">
                      {formatDuration(connectionTime)}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Strength</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={getConnectionStrength()}
                        className="flex-1 h-2"
                      />
                      <span className="text-sm font-mono">
                        {getConnectionStrength()}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data Transfer */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Data Transfer</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Downloaded
                        </div>
                        <div className="font-mono">
                          {vpn.formatBytes(
                            vpn.settings.bytesTransferred.download,
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Uploaded
                        </div>
                        <div className="font-mono">
                          {vpn.formatBytes(
                            vpn.settings.bytesTransferred.upload,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Protocol Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Protocol
                  </span>
                  <Badge variant="outline">{vpn.settings.protocol}</Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Change Server
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Speed Test
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
