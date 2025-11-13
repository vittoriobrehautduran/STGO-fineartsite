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
});

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const text = textRef.current;

    if (!hero || !text) return;

    // Text slides to the right - starts immediately, completes first
    gsap.to(text, {
      x: "100%",
      opacity: 0,
      ease: "power2.in",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=80%",
        scrub: 0.5,
      },
    });

    // Pin the hero section - holds until text is almost gone
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "+=80%",
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden"
    >
      <div ref={imageRef} className="absolute inset-0 z-0">
        <Image
          src="/images/heroimg.jpg"
          alt="STGO Fine Art Hero"
          fill
          priority
          className="object-cover"
          quality={90}
        />
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black/20"
        />
      </div>
      <div className="relative z-10 h-full flex items-center justify-center overflow-hidden">
        <h1
          ref={textRef}
          className={`${zenTokyoZoo.className} text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-wide text-center px-4`}
        >
          <SplittingText text="STGO FINE ART" delay={300} />
        </h1>
      </div>
    </section>
  );
}

