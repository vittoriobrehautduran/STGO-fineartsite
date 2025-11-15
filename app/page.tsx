"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import UploadSection from "@/components/UploadSection";
import Story from "@/components/Story";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const hasInitialized = useRef(false);

  const handleLoadingComplete = () => {
    if (hasInitialized.current) return; // Prevent double execution
    hasInitialized.current = true;
    setIsLoading(false);
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  // Refresh ScrollTrigger after content loads - only once
  const hasRefreshed = useRef(false);
  useEffect(() => {
    if (showContent && !hasRefreshed.current) {
      // Wait for all components to render and Hero animation to complete
      const timer = setTimeout(() => {
        if (!hasRefreshed.current) {
          hasRefreshed.current = true;
          ScrollTrigger.refresh();
        }
      }, 3000); // Wait for Hero's 2000ms + buffer
      return () => clearTimeout(timer);
    }
  }, [showContent]);

  return (
    <main className="min-h-screen">
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      {showContent && (
        <>
          <Navbar />
          <Hero />
          <FeaturedProducts />
          <UploadSection />
          <Story />
          <Footer />
        </>
      )}
    </main>
  );
}

