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
      color: "bg-amber-50 border-amber-200",
      features: ["Madera de alta calidad", "Acabado natural", "Protección UV"],
    },
    {
      name: "Negro Clásico",
      description:
        "Marco negro clásico y atemporal que realza cualquier obra de arte. Ideal para un look moderno y minimalista que nunca pasa de moda.",
      color: "bg-gray-900 border-gray-800 text-white",
      features: ["Diseño atemporal", "Versátil y elegante", "Vidrio protector"],
    },
    {
      name: "Solo Impresión",
      description:
        "Solo la impresión con respaldo de cartón duro de alta calidad. Sin marco, perfecto para un estilo minimalista o para enmarcar posteriormente.",
      color: "bg-stone-100 border-stone-300",
      features: ["Cartón duro premium", "Sin marco", "Listo para enmarcar"],
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
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block w-20 h-0.5 bg-gray-900 mb-6"></div>
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 text-gray-900 tracking-tight"
            >
              Servicios de Enmarcado
            </h1>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              Ofrecemos enmarcado profesional de alta calidad para preservar y
              realzar tus obras de arte
            </p>
          </div>

          {/* Frame Types */}
          <div className="mb-20 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
              Tipos de Marcos
            </h2>
            <div
              ref={framesRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
            >
              {frameTypes.map((frame, index) => (
                <div
                  key={index}
                  className={`frame-card ${frame.color} rounded-2xl p-8 sm:p-10 shadow-lg border-2 transition-all duration-300 hover:shadow-xl`}
                >
                  <h3
                    className={`text-2xl sm:text-3xl font-bold mb-4 ${
                      frame.color.includes("gray-900") ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {frame.name}
                  </h3>
                  <p
                    className={`text-base sm:text-lg leading-relaxed mb-6 ${
                      frame.color.includes("gray-900")
                        ? "text-gray-200"
                        : "text-gray-700"
                    } font-light`}
                  >
                    {frame.description}
                  </p>
                  <ul className="space-y-3">
                    {frame.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className={`text-sm sm:text-base flex items-center ${
                          frame.color.includes("gray-900")
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="mr-3 text-lg">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Sizes */}
          <div className="mb-20 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
              Tamaños Estándar
            </h2>
            <div
              ref={sizesRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6"
            >
              {sizes.map((size, index) => (
                <div
                  key={index}
                  className="size-card bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 text-center transition-all duration-300 hover:shadow-xl hover:border-gray-900"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {size.width}
                  </div>
                  <div className="text-gray-600 mb-2">×</div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    {size.height}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">cm</div>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-8 text-base sm:text-lg font-light">
              Todos los tamaños están disponibles en centímetros
            </p>
          </div>

          {/* Media Options */}
          <div className="mb-20 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
              Opciones de Medio
            </h2>
            <div
              ref={mediaRef}
              className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
            >
              {mediaOptions.map((option, index) => (
                <div
                  key={index}
                  className="media-card bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-gray-900"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    {option.name}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light mb-6">
                    {option.description}
                  </p>
                  <ul className="space-y-3">
                    {option.specs.map((spec, idx) => (
                      <li
                        key={idx}
                        className="text-sm sm:text-base text-gray-600 flex items-center"
                      >
                        <span className="mr-3 text-gray-900 font-bold">•</span>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-200 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Solicitudes Especiales
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 font-light max-w-2xl mx-auto">
              ¿Necesitas un tamaño personalizado o tienes una solicitud
              especial? Estamos aquí para ayudarte a crear exactamente lo que
              imaginas.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-gray-900 text-white py-4 px-8 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg tracking-wide"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

