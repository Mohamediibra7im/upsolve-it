"use client";

import { useEffect, useState } from "react";

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
}

const Loader = ({ fullScreen = true, message = "Loading...", size = "md" }: LoaderProps) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const spinnerFrames = ["[ / ]", "[ - ]", "[ \\ ]", "[ | ]"];
  const currentSpinner = spinnerFrames[frame];

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const containerClass = fullScreen 
    ? "flex flex-col items-center justify-center min-h-screen bg-[#040604] font-mono text-emerald-400 select-none relative overflow-hidden" 
    : "flex flex-col items-center justify-center py-12 font-mono text-emerald-400 select-none";

  return (
    <div className={containerClass}>
      {/* Scanlines overlay for fullscreen */}
      {fullScreen && (
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04] pointer-events-none" />
      )}

      <div className="space-y-4 text-center z-10">
        {/* Animated Bracket Spinner */}
        <div className="text-xl font-bold tracking-widest text-emerald-300">
          {currentSpinner}
        </div>

        {/* Status Line */}
        <div className="space-y-1.5">
          <p className={`${sizeClasses[size]} font-bold uppercase tracking-wider text-emerald-300`}>
            {message.toUpperCase()}
          </p>
          <div className="text-[10px] text-emerald-500/40 tracking-widest">
            SYS_STATUS: RUNNING // DB_CONNECT_ACTIVE
          </div>
        </div>

        {/* Animated Monospace Loading Bar */}
        <div className="text-[10px] text-emerald-500/30 tracking-wider">
          {"█".repeat((frame + 1) * 3) + "░".repeat(12 - (frame + 1) * 3)}
        </div>
      </div>
    </div>
  );
};

export default Loader;
