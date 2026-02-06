"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProductsCarousel from "@/components/FeaturedProductsCarousel";
import Process from "@/components/Process";
import TrustIndicators from "@/components/TrustIndicators";
import UploadSection from "@/components/UploadSection";
import Story from "@/components/Story";
import DonationSection from "@/components/DonationSection";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Product } from "@/types/product";

interface HomeClientProps {
  featuredProducts: Product[];
}

export default function HomeClient({ featuredProducts }: HomeClientProps) {
  // Start with content shown to avoid hydration mismatch
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [shouldRenderLoading, setShouldRenderLoading] = useState(false);
  const hasInitialized = useRef(false);
  const hasCheckedReload = useRef(false);
  
  // Check if this is a page refresh AFTER hydration
  // Temporarily disabled to avoid DOM errors - can be re-enabled later
  useEffect(() => {
    if (hasCheckedReload.current) return;
    hasCheckedReload.current = true;
    
    // Loading screen disabled for now to prevent DOM errors
    // TODO: Re-implement with a simpler approach
  }, []);

  const handleLoadingComplete = () => {
    if (hasInitialized.current) return; // Prevent double execution
    hasInitialized.current = true;
    setIsLoading(false);
    // Wait for fade-out animation to complete before removing from DOM
    setTimeout(() => {
      setShouldRenderLoading(false);
      setShowContent(true);
    }, 600); // Match the fade-out animation duration (500ms + buffer)
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render portal, but conditionally render LoadingScreen inside
  const portalContent = mounted && typeof document !== 'undefined' && shouldRenderLoading ? (
    <LoadingScreen onComplete={handleLoadingComplete} />
  ) : null;

  return (
    <>
      {mounted && typeof document !== 'undefined' && createPortal(portalContent, document.body)}
      <main className="min-h-screen">
        {showContent && (
          <>
            <Navbar />
            <Hero />
            <FeaturedProductsCarousel products={featuredProducts} />
            <UploadSection />
            <Process />
            <TrustIndicators />
            <Story />
            <DonationSection />
            <Footer />
          </>
        )}
      </main>
    </>
  );
}

