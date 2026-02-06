"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TrustIndicators() {
  const sectionRef = useRef<HTMLElement>(null);
  const indicatorsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const indicators = indicatorsRef.current;

    if (!section || !indicators) return;

    // Animate indicators
    const indicatorCards = indicators.querySelectorAll(".indicator-card");
    indicatorCards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay: index * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => {
      indicatorCards.forEach((card) => {
        const trigger = ScrollTrigger.getById(`indicator-${card}`);
        if (trigger) trigger.kill();
      });
    };
  }, []);

  const indicators = [
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Calidad Garantizada",
      description: "Museo Quality garantizado en cada impresión",
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Entrega Rápida",
      description: "Producción en 5 días, entrega en 1-3 días",
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Pago Seguro",
      description: "Transacciones protegidas y encriptadas",
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Soporte Experto",
      description: "Equipo dedicado para ayudarte en cada paso",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 sm:py-20 md:py-28 px-4 sm:px-6"
    >
      <div className="container mx-auto max-w-[95%] lg:max-w-[92%]">
        <div
          ref={indicatorsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12"
        >
          {indicators.map((indicator, index) => (
            <div
              key={index}
              className="indicator-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="flex justify-center mb-4 text-white">
                {indicator.icon}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {indicator.title}
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                {indicator.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/upload"
            className="inline-block px-10 py-5 bg-white text-gray-900 text-xl font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            Comenzar Ahora
          </Link>
        </div>
      </div>
    </section>
  );
}

