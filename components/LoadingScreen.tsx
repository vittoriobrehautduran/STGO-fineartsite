"use client";

import { useState, useEffect, useRef } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

// List of all images to preload
const imagesToPreload = [
  "/images/heroimg4.jpg",
  "/images/homepageimg/portrait_woman.jpg",
  "/images/homepageimg/car_dark.jpg",
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (hasCompleted.current) return; // Prevent double execution

    let loadedImages = 0;
    const totalImages = imagesToPreload.length;
    const baseProgress = 20; // Reserve 20% for base loading
    const imageProgress = 70; // 70% for images
    const fontProgress = 10; // 10% for fonts

    // Preload all images
    const imagePromises = imagesToPreload.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          loadedImages++;
          const imageProgressValue = baseProgress + (loadedImages / totalImages) * imageProgress;
          setProgress(Math.min(imageProgressValue, baseProgress + imageProgress));
          resolve();
        };
        img.onerror = () => {
          loadedImages++;
          const imageProgressValue = baseProgress + (loadedImages / totalImages) * imageProgress;
          setProgress(Math.min(imageProgressValue, baseProgress + imageProgress));
          resolve(); // Continue even if image fails
        };
        img.src = src;
      });
    });

    // Wait for fonts to load
    const fontPromise = document.fonts.ready.then(() => {
      setProgress((prev) => Math.min(prev + fontProgress, 100));
    });

    // Start with base progress
    setProgress(baseProgress);

    // Wait for all images and fonts
    Promise.all([...imagePromises, fontPromise]).then(() => {
      // Ensure we're at 100%
      setProgress(100);
      
      // Small delay to show 100%
      setTimeout(() => {
        if (!hasCompleted.current) {
          hasCompleted.current = true;
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      }, 200);
    });
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

