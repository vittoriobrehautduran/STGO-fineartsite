"use client";

import { useEffect, useState } from "react";

interface SplittingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function SplittingText({ text, className = "", delay = 0 }: SplittingTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span className={`inline-block ${className}`}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block splitting-char ${
            isVisible ? "splitting-char-visible" : ""
          }`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

