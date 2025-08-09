import React, { useEffect, useState } from "react";
import { Zap, Shield, Globe, Eye } from "lucide-react";

interface StartupAnimationProps {
  onComplete: () => void;
}

export default function StartupAnimation({ onComplete }: StartupAnimationProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const stages = [
      { duration: 800, text: "Initializing KrugerX..." },
      { duration: 600, text: "Loading Security Modules..." },
      { duration: 700, text: "Starting AI Engine..." },
      { duration: 500, text: "Ready to Browse!" },
    ];

    let currentIndex = 0;
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);

    const interval = setInterval(() => {
      if (currentIndex < stages.length) {
        setCurrentStage(currentIndex);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 500); // Fade out animation
        }, 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)] animate-pulse"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Logo with enhanced effects */}
        <div className="mb-8 relative">
          {/* Glow effects */}
          <div className="absolute inset-0 text-8xl font-bold text-cyan-400/30 blur-xl animate-pulse">
            KRUGERX
          </div>
          <div className="absolute inset-0 text-8xl font-bold text-purple-400/20 blur-lg animate-pulse" style={{ animationDelay: "0.5s" }}>
            KRUGERX
          </div>
          
          {/* Main logo */}
          <div className="relative text-8xl font-bold text-white animate-glow">
            KRUGERX
          </div>
        </div>

        {/* Loading animation */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          
          {/* Stage text */}
          <div className="text-lg text-white/80 font-medium animate-fade-in">
            {currentStage === 0 && "Initializing KrugerX..."}
            {currentStage === 1 && "Loading Security Modules..."}
            {currentStage === 2 && "Starting AI Engine..."}
            {currentStage === 3 && "Ready to Browse!"}
          </div>
        </div>

        {/* Feature icons */}
        <div className="flex justify-center gap-8 text-white/60">
          <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Shield className="h-6 w-6 text-green-400" />
            <span className="text-xs">Privacy</span>
          </div>
          <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Zap className="h-6 w-6 text-cyan-400" />
            <span className="text-xs">AI</span>
          </div>
          <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <Globe className="h-6 w-6 text-purple-400" />
            <span className="text-xs">Speed</span>
          </div>
          <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <Eye className="h-6 w-6 text-pink-400" />
            <span className="text-xs">Security</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentStage + 1) / 4) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
