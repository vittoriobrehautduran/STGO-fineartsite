"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/currency";

interface FeaturedProductsCarouselProps {
  products: Product[];
}

export default function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Debug: Log products on mount and reset failed images when products change
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('FeaturedProductsCarousel - Products loaded:', {
        count: products.length,
        products: products.map(p => ({ id: p.id, name: p.name, image: p.image }))
      });
      // Reset failed images when products change (in case images were re-uploaded)
      setFailedImages(new Set());
      setImageErrors(new Set());
    } else {
      console.warn('FeaturedProductsCarousel - No products provided');
    }
  }, [products]);

  // Use products directly without duplication
  const allProducts = products;

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = 320;
    const gap = 40;
    const scrollAmount = cardWidth + gap;
    
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  if (products.length === 0) {
    return (
      <section
        data-section="featured-collection"
        className="bg-stone-50 py-16 sm:py-20 md:py-28 px-4 sm:px-6"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block w-20 h-0.5 bg-gray-900 mb-6"></div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 text-gray-900 tracking-tight">
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
          <div className="text-center py-20">
            <p className="text-gray-600">No hay productos destacados disponibles</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      data-section="featured-collection"
      className="bg-stone-50 py-16 sm:py-20 md:py-28 px-4 sm:px-6"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block w-20 h-0.5 bg-gray-900 mb-6"></div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 text-gray-900 tracking-tight">
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

        <div className="relative">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110"
              aria-label="Scroll left"
            >
              <svg
                className="w-6 h-6 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110"
              aria-label="Scroll right"
            >
              <svg
                className="w-6 h-6 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div
              className="flex gap-6 sm:gap-8 md:gap-10 pb-4"
              style={{ width: "max-content" }}
            >
              {allProducts.map((product, index) => {
                return (
                  <Link
                    key={product.id}
                    href="/collection"
                    className="group cursor-pointer flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
                  >
                    <div className="relative aspect-[3/4] mb-5 overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
                      <img
                        key={`${product.id}-${product.image}`}
                        src={product.image}
                        alt={`${product.name} - Impresión fine art y enmarcado profesional en Chile`}
                        width={1280}
                        height={1707}
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          display: failedImages.has(product.image) ? "none" : "block"
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const imageKey = `${product.id}-${product.image}`;
                          if (!imageErrors.has(imageKey)) {
                            setImageErrors(prev => new Set(prev).add(imageKey));
                            setFailedImages(prev => new Set(prev).add(product.image));
                            console.error('Featured product image failed to load:', {
                              productId: product.id,
                              productName: product.name,
                              imageUrl: product.image,
                              attemptedUrl: target.src
                            });
                          }
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          const imageKey = `${product.id}-${product.image}`;
                          if (imageErrors.has(imageKey)) {
                            setImageErrors(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(imageKey);
                              return newSet;
                            });
                          }
                          if (failedImages.has(product.image)) {
                            setFailedImages(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(product.image);
                              return newSet;
                            });
                          }
                        }}
                      />
                      {failedImages.has(product.image) && (
                        <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                          <div className="text-center p-4">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-500">Imagen no disponible</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors tracking-tight">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      Desde {formatCurrency(product.price)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

