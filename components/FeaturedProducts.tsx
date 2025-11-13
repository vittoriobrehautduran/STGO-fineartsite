"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mockProducts } from "@/data/mockProducts";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProducts() {
  const featuredProducts = mockProducts.slice(0, 4);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const products = productsRef.current;

    if (!section || !title || !products) return;

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
        },
      }
    );

    // Fade in products with stagger
    const productCards = products.querySelectorAll("a");
    gsap.fromTo(
      productCards,
      { opacity: 0, y: 80, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section="featured-collection"
      className="bg-stone-50 py-12 sm:py-16 md:py-20 px-4 sm:px-6"
    >
      <div className="container mx-auto">
        <h2
          ref={titleRef}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 text-gray-900"
        >
          Featured Collection
        </h2>
        <div
          ref={productsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {featuredProducts.map((product, index) => (
            <Link
              key={product.id}
              href="/collection"
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-600">From ${product.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

