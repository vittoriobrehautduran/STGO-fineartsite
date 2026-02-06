"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const steps = stepsRef.current;

    if (!section || !title || !steps) return;

    // Animate title
    const titleAnimation = gsap.fromTo(
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

    // Animate steps
    const stepCards = steps.querySelectorAll(".step-card");
    stepCards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.2,
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
      titleAnimation.kill();
      stepCards.forEach((card) => {
        const trigger = ScrollTrigger.getById(`step-${card}`);
        if (trigger) trigger.kill();
      });
    };
  }, []);

  const steps = [
    {
      number: "01",
      title: "Sube tu Imagen",
      description: "Carga tu imagen digital de alta calidad a través de nuestro sistema seguro.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Elige tus Opciones",
      description: "Selecciona el tamaño, medio de impresión y opciones de enmarcado que prefieras.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Revisa y Confirma",
      description: "Revisa todos los detalles de tu pedido y confirma tu compra de forma segura.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Producción",
      description: "Imprimimos tu obra con tecnología de última generación en 5 días hábiles.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      number: "05",
      title: "Entrega",
      description: "Recibe tu obra de arte terminada en 1-3 días hábiles, lista para colgar.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-white py-16 sm:py-20 md:py-28 px-4 sm:px-6"
    >
      <div className="container mx-auto max-w-[95%] lg:max-w-[92%]">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block w-20 h-0.5 bg-gray-900 mb-6"></div>
          <h2
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 tracking-tight"
          >
            Cómo Funciona
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Un proceso simple y transparente para transformar tus imágenes en obras de arte
          </p>
        </div>

        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="step-card bg-gray-50 rounded-2xl p-6 sm:p-8 border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 hover:shadow-xl group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl sm:text-6xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">
                  {step.number}
                </div>
                <div className="text-gray-900 bg-white rounded-xl p-3 shadow-sm group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/upload"
            className="inline-block px-10 py-5 bg-gray-900 text-white text-xl font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            Iniciar tu Pedido Ahora
          </Link>
        </div>
      </div>
    </section>
  );
}

