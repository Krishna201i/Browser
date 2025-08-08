import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StartupAnimationProps {
  onComplete: () => void;
}

export default function StartupAnimation({
  onComplete,
}: StartupAnimationProps) {
  const [phase, setPhase] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Reduced timing for faster startup
    const timer1 = setTimeout(() => setPhase(1), 300);
    const timer2 = setTimeout(() => setPhase(2), 800);
    const timer3 = setTimeout(() => setPhase(3), 1500);
    const timer4 = setTimeout(() => {
      setPhase(4);
      setTimeout(() => {
        console.log("StartupAnimation: Calling onComplete");
        onComplete();
      }, 300);
    }, 2000);

    // Also add a fallback timeout to ensure completion
    const fallbackTimer = setTimeout(() => {
      console.log("StartupAnimation: Fallback completion triggered");
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(fallbackTimer);
    };
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    console.log("StartupAnimation: Manual skip triggered");
    onComplete();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden cursor-pointer"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleSkip}
        title="Click to skip"
      >
        {/* Matrix Background Effect */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-400 font-mono text-sm opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [
                  0,
                  typeof window !== "undefined" ? window.innerHeight : 1000,
                ],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {Math.random() > 0.5 ? "1" : "0"}
            </motion.div>
          ))}
        </div>

        {/* Central Animation */}
        <div className="relative z-10 text-center">
          {/* Phase 0-1: Logo Formation */}
          <AnimatePresence>
            {phase >= 0 && (
              <motion.div
                initial={{ scale: 0, rotateY: 180 }}
                animate={{
                  scale: phase >= 1 ? 1 : 0.8,
                  rotateY: 0,
                }}
                transition={{
                  duration: 1,
                  type: "spring",
                  stiffness: 100,
                }}
                className="mb-8"
              >
                <div className="relative">
                  {/* Glowing background */}
                  <motion.div
                    className="absolute inset-0 text-8xl font-bold text-cyan-400/30 blur-lg"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    KRUGER
                  </motion.div>

                  {/* Main logo */}
                  <motion.div
                    className="relative text-8xl font-bold bg-gradient-to-r from-cyan-400 via-green-400 to-blue-400 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundSize: "200% 100%",
                    }}
                  >
                    KRUGER
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 1-2: Feature Icons */}
          <AnimatePresence>
            {phase >= 1 && phase < 4 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center gap-8 mb-8"
              >
                {[
                  { icon: "🛡️", label: "Privacy", delay: 0 },
                  { icon: "⚡", label: "Speed", delay: 0.2 },
                  { icon: "🤖", label: "AI", delay: 0.4 },
                  { icon: "🌐", label: "Freedom", delay: 0.6 },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ scale: 0, rotateY: 90 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{
                      delay: item.delay,
                      duration: 0.5,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="text-center"
                  >
                    <motion.div
                      className="text-4xl mb-2"
                      animate={{
                        rotateZ: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: item.delay,
                      }}
                    >
                      {item.icon}
                    </motion.div>
                    <div className="text-sm text-cyan-300 font-medium">
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 2-3: Loading Text */}
          <AnimatePresence>
            {phase >= 2 && phase < 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  className="text-2xl text-white mb-4 font-light"
                  animate={{
                    textShadow: [
                      "0 0 10px rgba(34, 197, 94, 0.5)",
                      "0 0 20px rgba(34, 197, 94, 0.8)",
                      "0 0 10px rgba(34, 197, 94, 0.5)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  Initializing Kruger Browser
                </motion.div>

                <div className="text-lg text-cyan-300 font-mono">
                  Loading{dots}
                </div>

                {/* Progress Bar */}
                <motion.div
                  className="w-64 h-1 bg-gray-800 rounded-full mx-auto mt-6 overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: 256 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-green-400"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 2,
                      ease: "easeOut",
                    }}
                  />
                </motion.div>

                {/* System Status */}
                <motion.div
                  className="mt-6 space-y-2 text-sm text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    ✓ Privacy shields activated
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    ✓ AI assistant initialized
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 }}
                  >
                    ✓ Secure connection established
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3-4: Ready State */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  className="text-3xl font-bold text-green-400 mb-4"
                  animate={{
                    scale: [1, 1.05, 1],
                    textShadow: [
                      "0 0 20px rgba(34, 197, 94, 0.8)",
                      "0 0 30px rgba(34, 197, 94, 1)",
                      "0 0 20px rgba(34, 197, 94, 0.8)",
                    ],
                  }}
                  transition={{
                    duration: 1,
                    repeat: 2,
                  }}
                >
                  READY
                </motion.div>
                <div className="text-lg text-cyan-300">
                  Welcome to the Matrix
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Skip Indicator */}
        <div className="absolute bottom-8 right-8 text-gray-400 text-sm">
          Click anywhere to skip
        </div>

        {/* Particle Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: Math.random() * 200 - 100,
                y: Math.random() * 200 - 100,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
