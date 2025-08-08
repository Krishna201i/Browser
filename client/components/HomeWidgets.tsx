import React from "react";
import { motion } from "framer-motion";
import { useWidgets } from "@/hooks/use-widgets";
import { useRealStats } from "@/hooks/use-real-stats";
import {
  Clock,
  Calendar,
  Shield,
  Zap,
  Users,
  Globe,
  TrendingUp,
  Activity,
} from "lucide-react";

interface HomeWidgetsProps {
  className?: string;
}

export default function HomeWidgets({ className = "" }: HomeWidgetsProps) {
  const widgets = useWidgets();
  const { stats } = useRealStats();

  // Predefined widget positions (top-right corner of screen)
  const widgetPositions = {
    clock: { top: "20px", right: "20px" },
    calendar: { top: "20px", right: "180px" },
    "trackers-blocked": { top: "120px", right: "20px" },
    "bandwidth-saved": { top: "120px", right: "180px" },
    "time-saved": { top: "220px", right: "20px" },
    "active-users": { top: "220px", right: "180px" },
    "sites-visited": { top: "320px", right: "20px" },
  };

  const getWidgetIcon = (widgetId: string) => {
    switch (widgetId) {
      case "clock":
        return <Clock className="h-4 w-4" />;
      case "calendar":
        return <Calendar className="h-4 w-4" />;
      case "trackers-blocked":
        return <Shield className="h-4 w-4" />;
      case "bandwidth-saved":
        return <Zap className="h-4 w-4" />;
      case "time-saved":
        return <Activity className="h-4 w-4" />;
      case "active-users":
        return <Users className="h-4 w-4" />;
      case "sites-visited":
        return <Globe className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getWidgetColor = (widgetId: string) => {
    switch (widgetId) {
      case "clock":
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
      case "calendar":
        return "from-purple-500/20 to-pink-500/20 border-purple-500/30";
      case "trackers-blocked":
        return "from-red-500/20 to-orange-500/20 border-red-500/30";
      case "bandwidth-saved":
        return "from-green-500/20 to-emerald-500/20 border-green-500/30";
      case "time-saved":
        return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case "active-users":
        return "from-indigo-500/20 to-violet-500/20 border-indigo-500/30";
      case "sites-visited":
        return "from-teal-500/20 to-cyan-500/20 border-teal-500/30";
      default:
        return "from-gray-500/20 to-slate-500/20 border-gray-500/30";
    }
  };

  // Only render if there are enabled widgets
  if (widgets.settings.enabledWidgets.length === 0) {
    return null;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none z-30 ${className}`}>
      {widgets.settings.enabledWidgets.map((widgetId, index) => {
        const widgetInfo = widgets.availableWidgets.find(
          (w) => w.id === widgetId,
        );
        const widgetData = widgets.getWidgetData(widgetId, stats);
        const position = widgetPositions[widgetId] || {
          top: "20px",
          right: "20px",
        };

        if (!widgetInfo || !widgetData) return null;

        return (
          <motion.div
            key={widgetId}
            className="absolute pointer-events-auto"
            style={position}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <div
              className={`
              w-40 p-4 rounded-xl backdrop-blur-md
              bg-gradient-to-br ${getWidgetColor(widgetId)}
              border shadow-lg
              transition-all duration-300
              hover:shadow-xl hover:backdrop-blur-lg
            `}
            >
              {/* Widget Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="text-white/80">{getWidgetIcon(widgetId)}</div>
                <h3 className="text-sm font-medium text-white/90 truncate">
                  {widgetInfo.title}
                </h3>
              </div>

              {/* Widget Content */}
              <div className="text-white">
                {widgetData.type === "clock" && (
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold mb-1">
                      {widgetData.data.time}
                    </div>
                    <div className="text-xs text-white/70">Current Time</div>
                  </div>
                )}

                {widgetData.type === "calendar" && (
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">
                      {widgetData.data.day}
                    </div>
                    <div className="text-sm text-white/80">
                      {widgetData.data.month} {widgetData.data.year}
                    </div>
                    <div className="text-xs text-white/70">
                      {widgetData.data.weekday}
                    </div>
                  </div>
                )}

                {widgetData.type === "counter" && (
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">
                      {widgetData.data.count.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/70 mb-1">
                      {widgetData.data.unit}
                    </div>
                    {widgetData.data.trend && (
                      <div className="text-xs text-green-300 flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {widgetData.data.trend}
                      </div>
                    )}
                  </div>
                )}

                {widgetData.type === "stats" && (
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1">
                      {widgetData.data.value}
                    </div>
                    {widgetData.data.trend && (
                      <div className="text-xs text-green-300 flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {widgetData.data.trend}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Widget Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Widget Dashboard Indicator */}
      {widgets.settings.enabledWidgets.length > 0 && (
        <motion.div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>
                {widgets.settings.enabledWidgets.length} Widget
                {widgets.settings.enabledWidgets.length !== 1 ? "s" : ""} Active
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
