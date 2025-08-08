import React from "react";
import { motion } from "framer-motion";
import { useWidgets } from "@/hooks/use-widgets";

interface WidgetPositionPreviewProps {
  className?: string;
}

export default function WidgetPositionPreview({
  className = "",
}: WidgetPositionPreviewProps) {
  const widgets = useWidgets();

  const widgetPositions = [
    {
      id: "clock",
      name: "Clock",
      icon: "🕐",
      x: 85,
      y: 15,
      color: "bg-blue-500",
    },
    {
      id: "calendar",
      name: "Calendar",
      icon: "📅",
      x: 65,
      y: 15,
      color: "bg-purple-500",
    },
    {
      id: "trackers-blocked",
      name: "Trackers",
      icon: "🛡️",
      x: 85,
      y: 35,
      color: "bg-red-500",
    },
    {
      id: "bandwidth-saved",
      name: "Bandwidth",
      icon: "⚡",
      x: 65,
      y: 35,
      color: "bg-green-500",
    },
    {
      id: "time-saved",
      name: "Time Saved",
      icon: "⏱️",
      x: 85,
      y: 55,
      color: "bg-yellow-500",
    },
    {
      id: "active-users",
      name: "Users",
      icon: "👥",
      x: 65,
      y: 55,
      color: "bg-indigo-500",
    },
    {
      id: "sites-visited",
      name: "Sites",
      icon: "🌐",
      x: 85,
      y: 75,
      color: "bg-teal-500",
    },
  ];

  return (
    <div
      className={`relative bg-gradient-to-br from-gray-900 to-blue-900 rounded-lg p-4 min-h-48 overflow-hidden ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-6 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-white/20"></div>
          ))}
        </div>
      </div>

      {/* Screen Frame */}
      <div className="absolute inset-2 border-2 border-white/20 rounded-lg"></div>

      {/* Header */}
      <div className="absolute top-4 left-4 text-white/60 text-xs">
        Home Screen Preview
      </div>

      {/* Logo Area */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/30 text-xs">
        KRUGER LOGO
      </div>

      {/* Widget Positions */}
      {widgetPositions.map((position, index) => {
        const isEnabled = widgets.settings.enabledWidgets.includes(position.id);

        return (
          <motion.div
            key={position.id}
            className="absolute"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              opacity: isEnabled ? 1 : 0.3,
            }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 200,
            }}
          >
            <div
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs
                transition-all duration-300 border-2
                ${
                  isEnabled
                    ? `${position.color}/80 border-white/40 shadow-lg`
                    : "bg-gray-600/50 border-white/20"
                }
              `}
              title={`${position.name} - ${isEnabled ? "Enabled" : "Disabled"}`}
            >
              {isEnabled ? position.icon : "□"}
            </div>

            {/* Widget Label */}
            <div
              className={`
              absolute top-10 left-1/2 transform -translate-x-1/2 
              text-xs text-center whitespace-nowrap transition-opacity duration-300
              ${isEnabled ? "text-white/80" : "text-white/40"}
            `}
            >
              {position.name}
            </div>
          </motion.div>
        );
      })}

      {/* Status Indicator */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="flex items-center justify-between text-xs">
          <div className="text-white/60">
            {widgets.settings.enabledWidgets.length} widgets enabled
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400">Live Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
}
