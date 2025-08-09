import React, { useState, useEffect } from "react";
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, Activity, Globe, Zap, Cpu, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBrowserSettings } from "@/hooks/use-browser-settings";

interface SecurityMetrics {
  privacyScore: number;
  securityScore: number;
  performanceScore: number;
  threatsBlocked: number;
  trackersBlocked: number;
  adsBlocked: number;
  dataEncrypted: boolean;
  vpnActive: boolean;
  dnsSecure: boolean;
  certificatesValid: boolean;
  lastScan: Date;
  vulnerabilities: string[];
  recommendations: string[];
}

export default function SecurityDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    privacyScore: 85,
    securityScore: 92,
    performanceScore: 78,
    threatsBlocked: 127,
    trackersBlocked: 45,
    adsBlocked: 23,
    dataEncrypted: true,
    vpnActive: false,
    dnsSecure: true,
    certificatesValid: true,
    lastScan: new Date(),
    vulnerabilities: [],
    recommendations: [
      "Enable VPN for enhanced privacy",
      "Update browser to latest version",
      "Review saved passwords",
      "Enable two-factor authentication",
    ],
  });

  const browserSettings = useBrowserSettings();

  // Simulate real-time security monitoring
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 3),
        trackersBlocked: prev.trackersBlocked + Math.floor(Math.random() * 2),
        adsBlocked: prev.adsBlocked + Math.floor(Math.random() * 1),
        privacyScore: Math.max(70, Math.min(100, prev.privacyScore + (Math.random() - 0.5) * 5)),
        securityScore: Math.max(80, Math.min(100, prev.securityScore + (Math.random() - 0.5) * 3)),
        performanceScore: Math.max(60, Math.min(95, prev.performanceScore + (Math.random() - 0.5) * 4)),
      }));
    };

    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4" />;
    if (score >= 75) return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getOverallStatus = () => {
    const avgScore = (metrics.privacyScore + metrics.securityScore + metrics.performanceScore) / 3;
    if (avgScore >= 85) return { status: "Excellent", color: "text-green-500", bg: "bg-green-500/10" };
    if (avgScore >= 70) return { status: "Good", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { status: "Needs Attention", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const overallStatus = getOverallStatus();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-16 z-50 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border hover:bg-background/90 transition-all"
        title="Security Dashboard"
      >
        <Shield className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Dashboard
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg ${overallStatus.bg} border`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Overall Security Status</h3>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
              <Badge variant="outline" className={overallStatus.color}>
                {overallStatus.status}
              </Badge>
            </div>
          </div>

          {/* Security Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Privacy Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-2xl font-bold ${getScoreColor(metrics.privacyScore)}`}>
                    {metrics.privacyScore}%
                  </span>
                  {getScoreIcon(metrics.privacyScore)}
                </div>
                <Progress value={metrics.privacyScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on tracker blocking, VPN usage, and privacy settings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-2xl font-bold ${getScoreColor(metrics.securityScore)}`}>
                    {metrics.securityScore}%
                  </span>
                  {getScoreIcon(metrics.securityScore)}
                </div>
                <Progress value={metrics.securityScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on threat protection, certificates, and security settings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-2xl font-bold ${getScoreColor(metrics.performanceScore)}`}>
                    {metrics.performanceScore}%
                  </span>
                  {getScoreIcon(metrics.performanceScore)}
                </div>
                <Progress value={metrics.performanceScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on memory usage, CPU performance, and optimization
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-time Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metrics.threatsBlocked}</div>
                  <div className="text-sm text-muted-foreground">Threats Blocked</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics.trackersBlocked}</div>
                  <div className="text-sm text-muted-foreground">Trackers Blocked</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{metrics.adsBlocked}</div>
                  <div className="text-sm text-muted-foreground">Ads Blocked</div>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((metrics.threatsBlocked + metrics.trackersBlocked + metrics.adsBlocked) / 3)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg. Per Hour</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Data Encryption
                  </span>
                  <Badge variant={metrics.dataEncrypted ? "default" : "destructive"}>
                    {metrics.dataEncrypted ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    VPN Connection
                  </span>
                  <Badge variant={metrics.vpnActive ? "default" : "destructive"}>
                    {metrics.vpnActive ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    DNS Protection
                  </span>
                  <Badge variant={metrics.dnsSecure ? "default" : "destructive"}>
                    {metrics.dnsSecure ? "Secure" : "Unsecure"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    SSL Certificates
                  </span>
                  <Badge variant={metrics.certificatesValid ? "default" : "destructive"}>
                    {metrics.certificatesValid ? "Valid" : "Invalid"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Tracker Blocking
                  </span>
                  <Badge variant={browserSettings.settings.blockTrackers ? "default" : "destructive"}>
                    {browserSettings.settings.blockTrackers ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Ad Blocking
                  </span>
                  <Badge variant={browserSettings.settings.blockAds ? "default" : "destructive"}>
                    {browserSettings.settings.blockAds ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Anti-Fingerprinting
                  </span>
                  <Badge variant={browserSettings.settings.antiFingerprintng ? "default" : "destructive"}>
                    {browserSettings.settings.antiFingerprintng ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Enhanced Cookie Protection
                  </span>
                  <Badge variant={browserSettings.settings.enhancedCookieProtection ? "default" : "destructive"}>
                    {browserSettings.settings.enhancedCookieProtection ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="flex-1 text-sm">{recommendation}</span>
                    <Button size="sm" variant="outline">
                      Fix
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Security Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Blocked malicious script from example.com</span>
                  <span className="text-muted-foreground">2 minutes ago</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Shield className="h-3 w-3" />
                  <span>Prevented tracking attempt from analytics service</span>
                  <span className="text-muted-foreground">5 minutes ago</span>
                </div>
                <div className="flex items-center gap-2 text-purple-600">
                  <EyeOff className="h-3 w-3" />
                  <span>Blocked 3 advertisements on current page</span>
                  <span className="text-muted-foreground">8 minutes ago</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Lock className="h-3 w-3" />
                  <span>SSL certificate validated for secure connection</span>
                  <span className="text-muted-foreground">12 minutes ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
