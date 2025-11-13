"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Story from "@/components/Story";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  return (
    <main className="min-h-screen">
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      {showContent && (
        <>
          <Navbar />
          <Hero />
          <FeaturedProducts />
          <Story />
          <Footer />
        </>
      )}
    </main>
  );
}

