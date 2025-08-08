import React, { useEffect, useState } from "react";

interface DynamicBackgroundProps {
  variant?: "default" | "naruto" | "cyberpunk" | "nature" | "space" | "ocean" | "matrix";
  intensity?: "low" | "medium" | "high";
  isActive?: boolean;
}

export default function DynamicBackground({ 
  variant = "default", 
  intensity = "medium",
  isActive = true 
}: DynamicBackgroundProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);

  // Generate particles based on variant
  useEffect(() => {
    const particleCount = intensity === "low" ? 15 : intensity === "medium" ? 25 : 40;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
    }));
    setParticles(newParticles);
  }, [variant, intensity]);

  const renderNarutoBackground = () => (
    <div className="absolute inset-0">
      {/* Base gradient - Dark ninja night sky */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950"></div>
      
      {/* Chakra Energy Base Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-cyan-500/10 to-orange-500/20 animate-chakra-flow"></div>
      
      {/* Nine-Tails Chakra Swirls */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-orange-500/30 to-red-600/30 rounded-full filter blur-3xl animate-kyuubi-chakra"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-red-500/25 to-orange-600/25 rounded-full filter blur-3xl animate-kyuubi-spiral" style={{ animationDelay: "2s" }}></div>
      </div>
      
      {/* Rasengan Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/5 right-1/4 w-32 h-32 bg-gradient-to-r from-cyan-300/50 to-blue-400/50 rounded-full filter blur-xl animate-rasengan-spin"></div>
        <div className="absolute bottom-1/5 left-1/5 w-24 h-24 bg-gradient-to-r from-blue-300/60 to-cyan-400/60 rounded-full filter blur-lg animate-rasengan-spin" style={{ animationDelay: "1s", animationDirection: "reverse" }}></div>
      </div>
      
      {/* Falling Leaves */}
      {particles.map((particle) => (
        <div
          key={`leaf-${particle.id}`}
          className="absolute animate-leaf-fall"
          style={{
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <div className="w-3 h-3 bg-green-400/30 rounded-full transform rotate-45 leaf-shape"></div>
        </div>
      ))}
    </div>
  );

  const renderCyberpunkBackground = () => (
    <div className="absolute inset-0">
      {/* Base cyberpunk gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900"></div>
      
      {/* Neon grid effect */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(cyan 1px, transparent 1px),
          linear-gradient(90deg, cyan 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'matrix-scroll 20s linear infinite'
      }}></div>
      
      {/* Glowing orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-500/40 to-purple-500/40 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-gradient-to-r from-pink-500/40 to-blue-500/40 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>
      
      {/* Digital particles */}
      {particles.map((particle) => (
        <div
          key={`cyber-${particle.id}`}
          className="absolute w-1 h-1 bg-cyan-400 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            boxShadow: '0 0 6px cyan',
          }}
        ></div>
      ))}
    </div>
  );

  const renderSpaceBackground = () => (
    <div className="absolute inset-0">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950 to-purple-950"></div>
      
      {/* Nebula clouds */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/15 to-purple-500/15 rounded-full filter blur-3xl animate-float-slow" style={{ animationDelay: "3s" }}></div>
      </div>
      
      {/* Stars */}
      {particles.map((particle) => (
        <div
          key={`star-${particle.id}`}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: Math.random() > 0.8 ? '3px' : '1px',
            height: Math.random() > 0.8 ? '3px' : '1px',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        ></div>
      ))}
      
      {/* Shooting stars */}
      <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-wind-slash opacity-60"></div>
      <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-wind-slash opacity-40" style={{ animationDelay: "5s" }}></div>
    </div>
  );

  const renderOceanBackground = () => (
    <div className="absolute inset-0">
      {/* Ocean gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-teal-800 to-cyan-900"></div>
      
      {/* Wave layers */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-600/40 to-transparent animate-mist-flow"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-teal-600/30 to-transparent animate-mist-flow" style={{ animationDelay: "2s" }}></div>
      </div>
      
      {/* Bubbles */}
      {particles.map((particle) => (
        <div
          key={`bubble-${particle.id}`}
          className="absolute rounded-full border border-white/20 bg-white/5 animate-chakra-particle"
          style={{
            left: `${particle.x}%`,
            bottom: '0%',
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        ></div>
      ))}
    </div>
  );

  const renderNatureBackground = () => (
    <div className="absolute inset-0">
      {/* Nature gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800"></div>
      
      {/* Forest light rays */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-yellow-300/40 via-transparent to-transparent animate-lightning-strike opacity-60"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-yellow-200/30 via-transparent to-transparent animate-lightning-strike" style={{ animationDelay: "2s" }}></div>
      </div>
      
      {/* Fireflies */}
      {particles.map((particle) => (
        <div
          key={`firefly-${particle.id}`}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse filter blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            boxShadow: '0 0 10px yellow',
          }}
        ></div>
      ))}
    </div>
  );

  const renderMatrixBackground = () => (
    <div className="absolute inset-0">
      {/* Matrix base */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Matrix rain effect */}
      {particles.map((particle) => (
        <div
          key={`matrix-${particle.id}`}
          className="absolute text-green-400 text-sm font-mono opacity-70 animate-chakra-particle"
          style={{
            left: `${particle.x}%`,
            top: '0%',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {Math.random() > 0.5 ? '1' : '0'}
        </div>
      ))}
      
      {/* Green glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-transparent to-transparent"></div>
    </div>
  );

  const renderDefaultBackground = () => renderNarutoBackground();

  const getBackgroundRenderer = () => {
    switch (variant) {
      case "naruto": return renderNarutoBackground;
      case "cyberpunk": return renderCyberpunkBackground;
      case "space": return renderSpaceBackground;
      case "ocean": return renderOceanBackground;
      case "nature": return renderNatureBackground;
      case "matrix": return renderMatrixBackground;
      default: return renderDefaultBackground;
    }
  };

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
      {getBackgroundRenderer()()}
    </div>
  );
}
