import * as React from "react";
import { AnimatePresence } from "framer-motion";

interface SafeAnimatePresenceProps {
  children: React.ReactNode;
  mode?: "wait" | "sync" | "popLayout";
  initial?: boolean;
  onExitComplete?: () => void;
}

export default function SafeAnimatePresence({
  children,
  mode = "wait",
  initial = true,
  onExitComplete,
}: SafeAnimatePresenceProps) {
  // Fallback to regular div if AnimatePresence fails
  try {
    return (
      <AnimatePresence
        mode={mode}
        initial={initial}
        onExitComplete={onExitComplete}
      >
        {children}
      </AnimatePresence>
    );
  } catch (error) {
    console.warn("AnimatePresence failed, using fallback:", error);
    return <div>{children}</div>;
  }
}
