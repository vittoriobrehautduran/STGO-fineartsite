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
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textAnimationCompleteRef = useRef(false);

  useEffect(() => {
    const hero = heroRef.current;
    const text = textRef.current;

    if (!hero || !text) return;

    // Check if ScrollTrigger already exists for this hero
    const existingSlide = ScrollTrigger.getById("hero-text-slide");
    const existingPin = ScrollTrigger.getById("hero-pin");
    
    if (existingSlide || existingPin) {
      // Already initialized, don't re-initialize
      return;
    }

    // Set initial state - text is visible and centered
    gsap.set(text, { x: 0, opacity: 1 });

    let slideAnimation: gsap.core.Tween | null = null;
    let pinAnimation: ScrollTrigger | null = null;

    // Initialize ScrollTrigger immediately so it's ready when user scrolls
    slideAnimation = gsap.fromTo(
      text,
      { x: 0, opacity: 1 }, // Start position
      {
        x: "100%",
        opacity: 0,
        ease: "power2.in",
        immediateRender: false,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=60%",
          scrub: 1,
          id: "hero-text-slide",
          onUpdate: (self) => {
            // Only allow animation progress if text animation is complete
            if (!textAnimationCompleteRef.current) {
              // Force animation to stay at start (progress 0)
              slideAnimation?.progress(0);
            }
          },
        },
      }
    );

    // Pin the hero section - initialize immediately with optimized settings
    pinAnimation = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "+=60%",
      pin: true,
      pinSpacing: true,
      anticipatePin: 0,
      pinReparent: false,
      id: "hero-pin",
    });

    // Wait for SplittingText animation to complete (delay 300ms + animation time ~1.5s)
    // Then enable the scroll animation
    const timeout = setTimeout(() => {
      textAnimationCompleteRef.current = true;
      ScrollTrigger.refresh();
    }, 2000); // Wait for SplittingText to complete

    return () => {
      clearTimeout(timeout);
      if (slideAnimation) slideAnimation.kill();
      if (pinAnimation) pinAnimation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        const id = (trigger as any).vars?.id;
        if (id && (id === "hero-text-slide" || id === "hero-pin")) {
          trigger.kill();
        }
      });
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
        ref={imageRef} 
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
          src="/images/heroimg4.jpg"
          alt="STGO Fine Art Hero"
          fill
          priority
          className="object-cover"
          style={{ 
            objectPosition: 'center top',
          }}
          quality={85}
          sizes="100vw"
        />
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black/20"
        />
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
            Estudio de impresión Fine Art y enmarcado
          </p>
        </div>
      </div>
    </section>
  );
}

