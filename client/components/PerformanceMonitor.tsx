import React, { useState, useEffect, useRef } from "react";
import { Activity, Cpu, HardDrive, Wifi, Zap, Battery, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  network: {
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
    connectionType: string;
  };
  battery: {
    level: number;
    charging: boolean;
    timeRemaining?: number;
  };
  fps: number;
  pageLoadTime: number;
  domNodes: number;
  jsHeapSize: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: { used: 0, total: 0, percentage: 0 },
    cpu: { usage: 0, cores: navigator.hardwareConcurrency || 4 },
    network: { downloadSpeed: 0, uploadSpeed: 0, latency: 0, connectionType: "unknown" },
    battery: { level: 0, charging: false },
    fps: 0,
    pageLoadTime: 0,
    domNodes: 0,
    jsHeapSize: 0,
  });

  const [isVisible, setIsVisible] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef<number>();

  // FPS calculation
  const calculateFPS = () => {
    frameCount.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      setMetrics(prev => ({ ...prev, fps }));
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
    
    animationFrameId.current = requestAnimationFrame(calculateFPS);
  };

  // Memory monitoring
  const updateMemoryMetrics = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize / 1024 / 1024; // MB
      const total = memory.totalJSHeapSize / 1024 / 1024; // MB
      const percentage = (used / total) * 100;

      setMetrics(prev => ({
        ...prev,
        memory: { used, total, percentage },
        jsHeapSize: memory.usedJSHeapSize / 1024 / 1024,
      }));
    }
  };

  // DOM monitoring
  const updateDOMMetrics = () => {
    const domNodes = document.querySelectorAll('*').length;
    setMetrics(prev => ({ ...prev, domNodes }));
  };

  // Network monitoring
  const updateNetworkMetrics = async () => {
    try {
      // Connection info
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setMetrics(prev => ({
          ...prev,
          network: {
            ...prev.network,
            connectionType: connection.effectiveType || 'unknown',
          },
        }));
      }

      // Simulate network speed test (in real app, you'd use a real speed test API)
      const startTime = performance.now();
      await fetch('/api/ping', { cache: 'no-cache' });
      const endTime = performance.now();
      const latency = endTime - startTime;

      setMetrics(prev => ({
        ...prev,
        network: {
          ...prev.network,
          latency: Math.round(latency),
          downloadSpeed: Math.random() * 100 + 10, // Simulated
          uploadSpeed: Math.random() * 50 + 5, // Simulated
        },
      }));
    } catch (error) {
      console.log('Network monitoring error:', error);
    }
  };

  // Battery monitoring
  const updateBatteryMetrics = async () => {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        setMetrics(prev => ({
          ...prev,
          battery: {
            level: battery.level * 100,
            charging: battery.charging,
            timeRemaining: battery.dischargingTime,
          },
        }));
      }
    } catch (error) {
      console.log('Battery monitoring not available');
    }
  };

  // CPU monitoring (simulated)
  const updateCPUMetrics = () => {
    // In a real implementation, you'd use Web Workers or Performance API
    const usage = Math.random() * 30 + 10; // Simulated CPU usage
    setMetrics(prev => ({
      ...prev,
      cpu: { ...prev.cpu, usage: Math.round(usage) },
    }));
  };

  // Page load time
  const updatePageLoadTime = () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
  };

  useEffect(() => {
    // Start FPS monitoring
    calculateFPS();

    // Initial metrics
    updateMemoryMetrics();
    updateDOMMetrics();
    updateNetworkMetrics();
    updateBatteryMetrics();
    updateCPUMetrics();
    updatePageLoadTime();

    // Set up intervals
    const memoryInterval = setInterval(updateMemoryMetrics, 2000);
    const domInterval = setInterval(updateDOMMetrics, 5000);
    const networkInterval = setInterval(updateNetworkMetrics, 10000);
    const batteryInterval = setInterval(updateBatteryMetrics, 30000);
    const cpuInterval = setInterval(updateCPUMetrics, 3000);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      clearInterval(memoryInterval);
      clearInterval(domInterval);
      clearInterval(networkInterval);
      clearInterval(batteryInterval);
      clearInterval(cpuInterval);
    };
  }, []);

  const getPerformanceStatus = () => {
    const { fps, pageLoadTime, memory } = metrics;
    
    if (fps < 30 || pageLoadTime > 3000 || memory.percentage > 80) {
      return { status: 'poor', color: 'text-red-500', bg: 'bg-red-500/10' };
    } else if (fps < 50 || pageLoadTime > 2000 || memory.percentage > 60) {
      return { status: 'fair', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    } else {
      return { status: 'good', color: 'text-green-500', bg: 'bg-green-500/10' };
    }
  };

  const performanceStatus = getPerformanceStatus();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border hover:bg-background/90 transition-all"
        title="Show Performance Monitor"
      >
        <Activity className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Performance Status */}
          <div className={`p-2 rounded-lg ${performanceStatus.bg}`}>
            <div className="flex items-center justify-between text-sm">
              <span>Status:</span>
              <Badge variant="outline" className={performanceStatus.color}>
                {performanceStatus.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* FPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                FPS
              </span>
              <span className="font-mono">{metrics.fps}</span>
            </div>
            <Progress value={Math.min(metrics.fps, 60)} className="h-1" />
          </div>

          {/* Memory */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                Memory
              </span>
              <span className="font-mono">
                {metrics.memory.used.toFixed(1)}MB / {metrics.memory.total.toFixed(1)}MB
              </span>
            </div>
            <Progress value={metrics.memory.percentage} className="h-1" />
          </div>

          {/* CPU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                CPU ({metrics.cpu.cores} cores)
              </span>
              <span className="font-mono">{metrics.cpu.usage}%</span>
            </div>
            <Progress value={metrics.cpu.usage} className="h-1" />
          </div>

          {/* Network */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Network
              </span>
              <span className="font-mono">{metrics.network.latency}ms</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.network.connectionType} • {metrics.network.downloadSpeed.toFixed(1)} Mbps
            </div>
          </div>

          {/* Battery */}
          {metrics.battery.level > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Battery className="h-3 w-3" />
                  Battery
                </span>
                <span className="font-mono">{Math.round(metrics.battery.level)}%</span>
              </div>
              <Progress value={metrics.battery.level} className="h-1" />
            </div>
          )}

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>DOM Nodes: {metrics.domNodes.toLocaleString()}</div>
            <div>Load Time: {metrics.pageLoadTime}ms</div>
            <div>Heap Size: {metrics.jsHeapSize.toFixed(1)}MB</div>
            <div>Page Load: {new Date().toLocaleTimeString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
