"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FramingPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const framesRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const frames = framesRef.current;
    const sizes = sizesRef.current;
    const media = mediaRef.current;

    if (!section) return;

    // Animate title
    if (title) {
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
            id: "framing-title",
          },
        }
      );
    }

    // Animate frame types
    if (frames) {
      const frameCards = frames.querySelectorAll(".frame-card");
      gsap.fromTo(
        frameCards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: frames,
            start: "top 75%",
            toggleActions: "play none none none",
            id: "framing-frames",
          },
        }
      );
    }

    // Animate sizes
    if (sizes) {
      const sizeCards = sizes.querySelectorAll(".size-card");
      gsap.fromTo(
        sizeCards,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sizes,
            start: "top 75%",
            toggleActions: "play none none none",
            id: "framing-sizes",
          },
        }
      );
    }

    // Animate media options
    if (media) {
      const mediaCards = media.querySelectorAll(".media-card");
      gsap.fromTo(
        mediaCards,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: media,
            start: "top 75%",
            toggleActions: "play none none none",
            id: "framing-media",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        const id = trigger.vars?.id as string;
        if (id && id.startsWith("framing-")) {
          trigger.kill();
        }
      });
    };
  }, []);

  const frameTypes = [
    {
      name: "Madera Natural",
      description:
        "Marco elegante de madera natural que aporta calidez y un toque orgánico a tus obras. Perfecto para crear un ambiente acogedor y sofisticado.",
      barColor: "bg-amber-600",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      features: ["Madera de alta calidad", "Acabado natural", "Protección UV"],
    },
    {
      name: "Negro Clásico",
      description:
        "Marco negro clásico y atemporal que realza cualquier obra de arte. Ideal para un look moderno y minimalista que nunca pasa de moda.",
      barColor: "bg-gray-900",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      features: ["Diseño atemporal", "Versátil y elegante", "Vidrio protector"],
    },
    {
      name: "Solo Impresión",
      description:
        "Solo la impresión con respaldo de cartón duro de alta calidad. Sin marco, perfecto para un estilo minimalista o para enmarcar posteriormente.",
      barColor: "bg-stone-400",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      features: ["Cartón duro premium", "Sin marco", "Listo para enmarcar"],
    },
    {
      name: "Plateado",
      description:
        "Marco plateado elegante y moderno que aporta un toque sofisticado y contemporáneo. Perfecto para obras que buscan un acabado brillante y refinado.",
      barColor: "bg-gray-400",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      features: ["Acabado metálico", "Brillo elegante", "Diseño moderno"],
    },
    {
      name: "Dorado",
      description:
        "Marco dorado lujoso que añade un toque de elegancia y opulencia a cualquier obra. Ideal para piezas que requieren un acabado premium y distinguido.",
      barColor: "bg-yellow-500",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      features: ["Acabado dorado premium", "Elegancia clásica", "Vidrio protector"],
    },
    {
      name: "Blanco",
      description:
        "Marco blanco limpio y minimalista que realza la pureza de tus obras. Perfecto para espacios modernos y luminosos que buscan un estilo fresco y atemporal.",
      barColor: "bg-white border border-gray-300",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      features: ["Diseño minimalista", "Versátil y limpio", "Protección UV"],
    },
  ];

  const sizes = [
    { width: 20, height: 30 },
    { width: 30, height: 40 },
    { width: 40, height: 60 },
    { width: 50, height: 70 },
    { width: 60, height: 90 },
  ];

  const mediaOptions = [
    {
      name: "Lienzo (Canvas)",
      description:
        "Impresión en lienzo de alta calidad, perfecta para un acabado artístico y texturizado. Ideal para obras que buscan un aspecto más tradicional y orgánico.",
      specs: ["Textura natural", "Colores vibrantes", "Durabilidad excepcional"],
    },
    {
      name: "Papel Fine Art",
      description:
        "Papel 100% algodón, diseñado para preservar tus obras durante generaciones. Sin ácidos y con protección UV integrada.",
      specs: ["Calidad museo", "Sin ácidos", "Protección UV"],
    },
    {
      name: "Papel Fotográfico",
      description:
        "Papel fotográfico profesional de alta resolución, ideal para fotografías con colores vibrantes y detalles nítidos.",
      specs: ["Alta resolución", "Colores precisos", "Acabado brillante o mate"],
    },
  ];

  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar />
      <section
        ref={sectionRef}
        className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6"
      >
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-20 sm:mb-24">
            <div className="inline-block w-20 h-0.5 bg-gray-900 mb-8"></div>
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-6 text-gray-900 tracking-tight"
            >
              Servicios de Enmarcado
            </h1>
            <p className="text-gray-600 text-xl sm:text-2xl font-light max-w-3xl mx-auto leading-relaxed">
              Ofrecemos enmarcado profesional de alta calidad para preservar y
              realzar tus obras de arte. Cada marco es cuidadosamente seleccionado
              para complementar y proteger tu pieza única.
            </p>
          </div>

          {/* Frame Types */}
          <div className="mb-24 sm:mb-32">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tipos de Marcos
            </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
                Selecciona el estilo perfecto que complemente tu obra de arte
              </p>
            </div>
            <div
              ref={framesRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10"
            >
              {frameTypes.map((frame, index) => (
                <div
                  key={index}
                  className="frame-card bg-white rounded-3xl p-0 shadow-xl border-2 border-gray-200 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group overflow-hidden"
                >
                  {/* Colored bar at the top */}
                  <div className={`${frame.barColor} h-2 w-full`}></div>
                  
                  <div className="p-10 sm:p-12">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-5 text-gray-900">
                    {frame.name}
                  </h3>
                    <p className="text-base sm:text-lg leading-relaxed mb-8 text-gray-700 font-light">
                    {frame.description}
                  </p>
                    <ul className="space-y-4">
                    {frame.features.map((feature, idx) => (
                      <li
                        key={idx}
                          className="text-sm sm:text-base flex items-start text-gray-700"
                        >
                          <svg
                            className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-gray-900"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                      >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Sizes */}
          <div className="mb-24 sm:mb-32">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tamaños Estándar
            </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
                Formatos disponibles para todas nuestras impresiones
              </p>
            </div>
            <div
              ref={sizesRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 max-w-5xl mx-auto"
            >
              {sizes.map((size, index) => (
                <div
                  key={index}
                  className="size-card bg-white rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gray-200 text-center flex items-center justify-center"
                >
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 whitespace-nowrap inline-block">
                    {size.width} × {size.height} <span className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider ml-1">CM</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-12 text-base sm:text-lg font-light">
              Todos los tamaños están disponibles en centímetros. También ofrecemos tamaños personalizados por un precio adicional.
            </p>
          </div>

          {/* Media Options */}
          <div className="mb-24 sm:mb-32">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Opciones de Medio
            </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
                Materiales de impresión de calidad profesional para cada proyecto
              </p>
            </div>
            <div
              ref={mediaRef}
              className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10"
            >
              {mediaOptions.map((option, index) => (
                <div
                  key={index}
                  className="media-card bg-white rounded-3xl p-10 sm:p-12 shadow-xl border-2 border-gray-200 transition-all duration-500 hover:shadow-2xl hover:border-gray-900 hover:scale-[1.02] group"
                >
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">
                    {option.name}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-light mb-8">
                    {option.description}
                  </p>
                  <ul className="space-y-4">
                    {option.specs.map((spec, idx) => (
                      <li
                        key={idx}
                        className="text-sm sm:text-base text-gray-700 flex items-start"
                      >
                        <svg
                          className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-gray-900"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 sm:p-16 shadow-2xl text-center text-white">
            <div className="max-w-3xl mx-auto">
              <div className="inline-block w-16 h-1 bg-white mb-6"></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Solicitudes Especiales
            </h2>
              <p className="text-xl sm:text-2xl text-gray-200 mb-10 font-light leading-relaxed">
              ¿Necesitas un tamaño personalizado o tienes una solicitud
              especial? Estamos aquí para ayudarte a crear exactamente lo que
                imaginas. Nuestro equipo está listo para trabajar contigo en proyectos únicos.
            </p>
            <Link
              href="/contact"
                className="inline-block bg-white text-gray-900 py-5 px-10 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-xl tracking-wide text-lg"
            >
              Contáctanos
            </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}


