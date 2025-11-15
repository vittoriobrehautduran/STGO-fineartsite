"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Product } from "@/types/product";

gsap.registerPlugin(ScrollTrigger);

// Mock products for featured collection
const mockFeaturedProducts: Product[] = [
  {
    id: "1",
    name: "Serenidad Costera",
    description: "Una vista impresionante de un paisaje costero sereno durante la hora dorada.",
    price: 299,
    image: "/images/collection/pexels-cao-vi-ton-449370203-15551600.jpg",
    sizes: [
      { id: "s1", width: 30, height: 40, unit: "cm", price: 299 },
      { id: "s2", width: 40, height: 60, unit: "cm", price: 399 },
      { id: "s3", width: 60, height: 90, unit: "cm", price: 599 },
    ],
    framingOptions: [
      { id: "f1", name: "Marco Negro Clásico", description: "Elegante marco de madera negra", price: 150 },
      { id: "f2", name: "Marco de Madera Natural", description: "Marco de madera natural", price: 180 },
    ],
  },
  {
    id: "2",
    name: "Paisaje Urbano",
    description: "Paisaje urbano moderno capturado con precisión.",
    price: 349,
    image: "/images/collection/pexels-james-frid-81279-2227958.jpg",
    sizes: [
      { id: "s1", width: 30, height: 40, unit: "cm", price: 349 },
      { id: "s2", width: 40, height: 60, unit: "cm", price: 449 },
      { id: "s3", width: 60, height: 90, unit: "cm", price: 649 },
    ],
    framingOptions: [
      { id: "f1", name: "Marco Negro Clásico", description: "Elegante marco de madera negra", price: 150 },
      { id: "f2", name: "Marco de Madera Natural", description: "Marco de madera natural", price: 180 },
    ],
  },
  {
    id: "3",
    name: "Abrazo de la Naturaleza",
    description: "Escenario natural exuberante que trae la belleza del aire libre.",
    price: 279,
    image: "/images/collection/pexels-khoa-vo-2347168-6533948.jpg",
    sizes: [
      { id: "s1", width: 30, height: 40, unit: "cm", price: 279 },
      { id: "s2", width: 40, height: 60, unit: "cm", price: 379 },
      { id: "s3", width: 60, height: 90, unit: "cm", price: 579 },
    ],
    framingOptions: [
      { id: "f1", name: "Marco Negro Clásico", description: "Elegante marco de madera negra", price: 150 },
      { id: "f2", name: "Marco de Madera Natural", description: "Marco de madera natural", price: 180 },
    ],
  },
  {
    id: "4",
    name: "Armonía Abstracta",
    description: "Una pieza contemporánea que añade elegancia moderna.",
    price: 319,
    image: "/images/collection/pexels-krivitskiy-1231258.jpg",
    sizes: [
      { id: "s1", width: 30, height: 40, unit: "cm", price: 319 },
      { id: "s2", width: 40, height: 60, unit: "cm", price: 419 },
      { id: "s3", width: 60, height: 90, unit: "cm", price: 619 },
    ],
    framingOptions: [
      { id: "f1", name: "Marco Negro Clásico", description: "Elegante marco de madera negra", price: 150 },
      { id: "f2", name: "Marco de Madera Natural", description: "Marco de madera natural", price: 180 },
    ],
  },
  {
    id: "5",
    name: "Vista Montañosa",
    description: "Cordilleras majestuosas capturadas con detalles impresionantes.",
    price: 329,
    image: "/images/collection/pexels-ron-lach-10507706.jpg",
    sizes: [
      { id: "s1", width: 30, height: 40, unit: "cm", price: 329 },
      { id: "s2", width: 40, height: 60, unit: "cm", price: 429 },
      { id: "s3", width: 60, height: 90, unit: "cm", price: 629 },
    ],
    framingOptions: [
      { id: "f1", name: "Marco Negro Clásico", description: "Elegante marco de madera negra", price: 150 },
      { id: "f2", name: "Marco de Madera Natural", description: "Marco de madera natural", price: 180 },
    ],
  },
  {
    id: "6",
    name: "Brisa Oceánica",
    description: "La esencia calmante del océano, trayendo tranquilidad a tu hogar.",
    price: 289,
    image: "/images/collection/pexels-shox-34699282.jpg",
    sizes: [
      { id: "s1", width: 30, height: 40, unit: "cm", price: 289 },
      { id: "s2", width: 40, height: 60, unit: "cm", price: 389 },
      { id: "s3", width: 60, height: 90, unit: "cm", price: 589 },
    ],
    framingOptions: [
      { id: "f1", name: "Marco Negro Clásico", description: "Elegante marco de madera negra", price: 150 },
      { id: "f2", name: "Marco de Madera Natural", description: "Marco de madera natural", price: 180 },
    ],
  },
  {
    id: "7",
    name: "Sueños de Atardecer",
    description: "Un atardecer vibrante que captura la magia de las horas del crepúsculo.",
    price: 309,
    image: "/images/collection/pexels-trayproductions-11963114.jpg",
    sizes: [
      { id: "s1", width: 30, height: 40, unit: "cm", price: 309 },
      { id: "s2", width: 40, height: 60, unit: "cm", price: 409 },
      { id: "s3", width: 60, height: 90, unit: "cm", price: 609 },
    ],
    framingOptions: [
      { id: "f1", name: "Marco Negro Clásico", description: "Elegante marco de madera negra", price: 150 },
      { id: "f2", name: "Marco de Madera Natural", description: "Marco de madera natural", price: 180 },
    ],
  },
  {
    id: "8",
    name: "Espejismo del Desierto",
    description: "Paisaje desértico impresionante con iluminación dramática.",
    price: 339,
    image: "/images/collection/pexels-wesleydavi-3622614.jpg",
    sizes: [
      { id: "s1", width: 30, height: 40, unit: "cm", price: 339 },
      { id: "s2", width: 40, height: 60, unit: "cm", price: 439 },
      { id: "s3", width: 60, height: 90, unit: "cm", price: 639 },
    ],
    framingOptions: [
      { id: "f1", name: "Marco Negro Clásico", description: "Elegante marco de madera negra", price: 150 },
      { id: "f2", name: "Marco de Madera Natural", description: "Marco de madera natural", price: 180 },
    ],
  },
];

// Duplicate products to create seamless loop
const duplicatedProducts = mockFeaturedProducts.map((product, index) => ({
  ...product,
  id: `${product.id}-dup-${index}`,
}));

const allFeaturedProducts = [...mockFeaturedProducts, ...duplicatedProducts];

export default function FeaturedProducts() {
  const [featuredProducts] = useState<Product[]>(allFeaturedProducts);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
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

    // Create infinite scroll animation
    animationRef.current = gsap.to(carousel, {
      x: -totalWidth,
      duration: 100, // Adjust speed (higher = slower)
      ease: "none",
      repeat: -1,
    });

    return () => {
      const titleTrigger = ScrollTrigger.getById("featured-title");
      if (titleTrigger) titleTrigger.kill();
      if (animationRef.current) animationRef.current.kill();
    };
  }, [featuredProducts]);

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
          <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
            Descubre nuestras piezas más exclusivas, seleccionadas por su calidad excepcional
          </p>
        </div>
        <div
          className="overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={carouselRef}
            className="flex gap-6 sm:gap-8 md:gap-10"
            style={{ width: "max-content" }}
          >
            {featuredProducts.map((product, index) => (
              <Link
                key={`${product.id}-${index}`}
                href="/collection"
                className="group cursor-pointer flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
              >
                <div className="relative aspect-[3/4] mb-5 overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={320}
                    height={427}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors tracking-tight">
                  {product.name}
                </h3>
                <p className="text-gray-600 font-medium">Desde ${product.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

