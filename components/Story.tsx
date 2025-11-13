"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollReveal from "./ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;

    if (!section || !title) return;

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

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-stone-50 py-12 sm:py-16 md:py-20 px-4 sm:px-6"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8 sm:mb-12">
          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6"
          >
            Our Story
          </h2>
        </div>
        <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={5}
            blurStrength={15}
            containerClassName="text-base sm:text-lg"
            textClassName="text-gray-700"
            wordAnimationEnd="bottom center"
          >
            At STGO Fine Art, we specialize in transforming your most cherished
            moments into stunning, museum-quality prints. Using state-of-the-art
            high-resolution printing technology, we bring every detail to life
            with unparalleled clarity and color accuracy.
          </ScrollReveal>
          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={5}
            blurStrength={15}
            containerClassName="text-base sm:text-lg"
            textClassName="text-gray-700"
            wordAnimationEnd="bottom center"
          >
            Our commitment extends beyond printing. We offer expert framing
            services, carefully selecting materials that complement your artwork
            and protect it for generations. From classic wooden frames to modern
            metal designs, we ensure your piece is presented exactly as you
            envision.
          </ScrollReveal>
          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={5}
            blurStrength={15}
            containerClassName="text-base sm:text-lg"
            textClassName="text-gray-700"
            wordAnimationEnd="bottom center"
          >
            But we don't stop there. Our team provides professional installation
            services, hanging your artwork with precision and care in your home
            or office. We handle everything from delivery to final placement,
            making the entire process seamless and stress-free.
          </ScrollReveal>
          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={5}
            blurStrength={15}
            containerClassName="text-base sm:text-lg"
            textClassName="text-gray-900 font-medium"
            wordAnimationEnd="bottom center"
          >
            Experience the difference of true fine art printing. Let us help you
            create something beautiful that will be treasured for years to come.
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

