"use client";

import Image from "next/image";
import { Zen_Tokyo_Zoo } from "next/font/google";
import SplittingText from "./SplittingText";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const zenTokyoZoo = Zen_Tokyo_Zoo({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const text = textRef.current;

    if (!hero || !text) return;

    // Check if ScrollTrigger already exists for this hero
    const existingSlide = ScrollTrigger.getById("hero-text-slide");
    
    if (existingSlide) {
      return;
    }

    // Set initial state - text is visible and centered
    gsap.set(text, { x: 0, opacity: 1 });

    let slideAnimation: gsap.core.Tween | null = null;

    // Slide animation without pinning - text slides as user scrolls
    slideAnimation = gsap.to(text, {
      x: "100%",
      opacity: 0,
      ease: "power1.in",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "top -50%",
        scrub: 0.5,
        id: "hero-text-slide",
      },
    });

    return () => {
      if (slideAnimation) slideAnimation.kill();
      const trigger = ScrollTrigger.getById("hero-text-slide");
      if (trigger) trigger.kill();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ 
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <div 
        className="absolute inset-0 z-0 w-full h-full"
        style={{ 
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        <Image
          src="/images/heroimg4.webp"
          alt="STGO Fine Art - Imprenta profesional de arte fine art y enmarcado en Chile"
          fill
          priority
          className="object-cover"
          style={{ 
            objectPosition: 'center top',
          }}
          quality={85}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center overflow-hidden">
        <div ref={textRef} className="text-center px-4 w-full">
          <h1
            className={`${zenTokyoZoo.className} font-normal text-white tracking-wide mb-4 sm:mb-6 whitespace-nowrap overflow-hidden`}
            style={{ 
              fontFamily: zenTokyoZoo.style.fontFamily || '"Zen Tokyo Zoo", sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(2.5rem, 8vw, 10rem)',
              lineHeight: '1',
            }}
          >
            <SplittingText text="STGO FINE ART" delay={300} />
          </h1>
          <p className="text-white text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-light tracking-[0.15em] uppercase opacity-95 px-2">
            Estudio de impresión Fine Art y enmarcado en Chile
          </p>
        </div>
        
        {/* Brand Logos Section */}
        <div className="absolute bottom-0 left-0 right-0 z-20 py-6 sm:py-8 px-4 sm:px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-center">
              <div className="flex items-center justify-center h-12 sm:h-14 md:h-16 lg:h-20 opacity-80 hover:opacity-100 transition-opacity duration-300 mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16">
                <Image
                  src="/images/brandlogos/logo Awagami.png"
                  alt="Awagami"
                  width={160}
                  height={64}
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-12 sm:h-14 md:h-16 lg:h-20 opacity-80 hover:opacity-100 transition-opacity duration-300 mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16">
                <Image
                  src="/images/brandlogos/logo Canon.webp"
                  alt="Canon"
                  width={160}
                  height={64}
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-12 sm:h-14 md:h-16 lg:h-20 opacity-80 hover:opacity-100 transition-opacity duration-300 mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16">
                <Image
                  src="/images/brandlogos/logo Canson.webp"
                  alt="Canson"
                  width={160}
                  height={64}
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-12 sm:h-14 md:h-16 lg:h-20 opacity-80 hover:opacity-100 transition-opacity duration-300 mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16">
                <Image
                  src="/images/brandlogos/logo Eizo.webp"
                  alt="Eizo"
                  width={160}
                  height={64}
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-12 sm:h-14 md:h-16 lg:h-20 opacity-80 hover:opacity-100 transition-opacity duration-300 mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16">
                <Image
                  src="/images/brandlogos/logo hahnemuhle.webp"
                  alt="Hahnemühle"
                  width={160}
                  height={64}
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

