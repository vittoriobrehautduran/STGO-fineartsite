"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Product } from "@/types/product";
import { getFeaturedProducts } from "@/lib/products";
import { formatCurrency } from "@/lib/currency";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const products = await getFeaturedProducts();
        // Duplicate products to create seamless loop
        const duplicatedProducts = products.map((product, index) => ({
          ...product,
          id: `${product.id}-dup-${index}`,
        }));
        const allProducts = [...products, ...duplicatedProducts];
        setFeaturedProducts(allProducts);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Preload images before starting animation
  useEffect(() => {
    if (featuredProducts.length === 0 || loading) return;

    const imagePromises = featuredProducts.slice(0, 4).map((product) => {
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails
        img.src = product.image;
      });
    });

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
    });
  }, [featuredProducts, loading]);

  useEffect(() => {
    if (featuredProducts.length === 0 || !imagesLoaded) return;
    const section = sectionRef.current;
    const title = titleRef.current;
    const carousel = carouselRef.current;

    if (!section || !title || !carousel) return;

    // Fade in title
    gsap.fromTo(
      title,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
          id: "featured-title",
        },
      }
    );

    // Set up infinite horizontal scroll animation
    const firstHalf = featuredProducts.slice(0, featuredProducts.length / 2);
    const cardWidth = 320; // Approximate width of each card
    const gap = 40; // Gap between cards
    const totalCardWidth = cardWidth + gap;
    const totalWidth = totalCardWidth * firstHalf.length;

    // Create infinite scroll animation with GPU acceleration
    gsap.set(carousel, { 
      force3D: true,
      backfaceVisibility: 'hidden'
    });
    animationRef.current = gsap.to(carousel, {
      x: -totalWidth,
      duration: 100, // Adjust speed (higher = slower)
      ease: "none",
      repeat: -1,
      force3D: true,
      immediateRender: false,
    });

    return () => {
      const titleTrigger = ScrollTrigger.getById("featured-title");
      if (titleTrigger) titleTrigger.kill();
      if (animationRef.current) animationRef.current.kill();
    };
  }, [featuredProducts, imagesLoaded]);

  const handleMouseEnter = () => {
    if (animationRef.current) {
      isPausedRef.current = true;
      animationRef.current.pause();
    }
  };

  const handleMouseLeave = () => {
    if (animationRef.current && isPausedRef.current) {
      isPausedRef.current = false;
      animationRef.current.resume();
    }
  };

  return (
    <section
      ref={sectionRef}
      data-section="featured-collection"
      className="bg-stone-50 py-16 sm:py-20 md:py-28 px-4 sm:px-6"
      style={{ position: 'relative', zIndex: 1 }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block w-20 h-0.5 bg-gray-900 mb-6"></div>
          <h2
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 text-gray-900 tracking-tight"
          >
            Colección Destacada
          </h2>
          <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto mb-8">
            Descubre nuestras piezas más exclusivas, seleccionadas por su calidad excepcional
          </p>
          <Link
            href="/collection"
            className="inline-block px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 hover:shadow-lg"
          >
            Ver Colección Completa
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No hay productos destacados disponibles</p>
          </div>
        ) : (
          <div
            className="overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ willChange: 'transform' }}
          >
            <div
              ref={carouselRef}
              className="flex gap-6 sm:gap-8 md:gap-10"
              style={{ 
                width: "max-content",
                willChange: 'transform',
                transform: 'translateZ(0)'
              }}
            >
              {featuredProducts.map((product, index) => {
                const isFirstBatch = index < featuredProducts.length / 2;
                return (
                  <Link
                    key={`${product.id}-${index}`}
                    href="/collection"
                    className="group cursor-pointer flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
                    style={{ 
                      willChange: 'transform',
                      contain: 'layout style paint'
                    }}
                  >
                    <div 
                      className="relative aspect-[3/4] mb-5 overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-500"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                        isolation: 'isolate'
                      }}
                    >
                      <img
                        src={product.image}
                        alt={`${product.name} - Impresión fine art y enmarcado profesional en Chile`}
                        width={640}
                        height={854}
                        loading={isFirstBatch && index < 4 ? "eager" : "lazy"}
                        decoding="async"
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                        style={{ 
                          willChange: 'transform',
                          transform: 'translateZ(0)',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale',
                          minHeight: '100%',
                          minWidth: '100%'
                        } as React.CSSProperties}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors tracking-tight">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 font-medium">Desde {formatCurrency(product.price)}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

