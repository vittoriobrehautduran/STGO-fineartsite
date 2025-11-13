"use client";

import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const duration = 2000; // 2 seconds total
    const interval = 16; // ~60fps
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-stone-50 flex flex-col items-center justify-center ${
        isFadingOut ? "animate-fade-out" : ""
      }`}
    >
      <div className="text-center mb-8">
        <div className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">
          {Math.round(progress)}%
        </div>
        <div className="w-64 md:w-96 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

