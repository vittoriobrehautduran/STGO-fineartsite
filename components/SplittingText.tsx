"use client";

import { useEffect, useState, useRef } from "react";

// Global flag to prevent multiple animations across re-renders
const globalAnimationState = new Map<string, boolean>();

interface SplittingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function SplittingText({ text, className = "", delay = 0 }: SplittingTextProps) {
  const animationKey = useRef(`splitting-${text}-${delay}`);
  const wasAlreadyAnimated = globalAnimationState.get(animationKey.current);
  const [isVisible, setIsVisible] = useState(wasAlreadyAnimated);
  const hasAnimated = useRef(wasAlreadyAnimated);

  useEffect(() => {
    // If already animated globally, set visible immediately
    if (wasAlreadyAnimated) {
      setIsVisible(true);
      hasAnimated.current = true;
      return;
    }
    
    // Check if this instance already animated
    if (hasAnimated.current) {
      setIsVisible(true);
      return;
    }
    
    const timer = setTimeout(() => {
      if (!globalAnimationState.get(animationKey.current) && !hasAnimated.current) {
        hasAnimated.current = true;
        globalAnimationState.set(animationKey.current, true);
        setIsVisible(true);
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay, text, wasAlreadyAnimated]);

  // Check if already animated (for re-renders) - use current state
  const isAlreadyAnimated = globalAnimationState.get(animationKey.current) || hasAnimated.current;

  return (
    <span className={`inline-block ${className}`} style={{ fontFamily: "inherit" }}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block splitting-char ${
            isVisible ? "splitting-char-visible" : ""
          }`}
          style={{ 
            animationDelay: isAlreadyAnimated ? "0s" : `${index * 0.05}s`,
            fontFamily: "inherit"
          }}
          data-animated={isAlreadyAnimated ? "true" : "false"}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

