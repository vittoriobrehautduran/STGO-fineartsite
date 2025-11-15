"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function UploadSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Fade in animations for each element
    const elements = [
      { ref: text1Ref, delay: 0 },
      { ref: image1Ref, delay: 0.1 },
      { ref: image2Ref, delay: 0.2 },
      { ref: text2Ref, delay: 0.3 },
    ];

    const triggers: ScrollTrigger[] = [];
    const elementIds = ['text1', 'img1', 'img2', 'text2'];

    elements.forEach(({ ref, delay }, index) => {
      const element = ref.current;
      if (!element) return;

      const elementId = elementIds[index];
      const triggerId = `upload-${elementId}`;

      // Set initial visible state
      gsap.set(element, { opacity: 1, y: 0 });

      const animation = gsap.fromTo(
        element,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none none",
            id: triggerId,
          },
        }
      );

      const trigger = ScrollTrigger.getById(triggerId);
      if (trigger) triggers.push(trigger);
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-gray-200 py-16 sm:py-20 md:py-28 px-4 sm:px-6"
    >
      <div className="container mx-auto max-w-[95%] lg:max-w-[92%]">
        {/* Top Row: Text and Portrait Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 mb-8 sm:mb-10 lg:mb-16">
          {/* Top Left: Text about uploading */}
          <div
            ref={text1Ref}
            className="flex flex-col justify-center space-y-6 sm:space-y-8 opacity-100 px-4 sm:px-0"
          >
            <div className="w-20 h-0.5 bg-gray-900 mb-8"></div>
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
              Fácil de subir tus imágenes con solicitudes especiales disponibles
            </h3>
            <Link
              href="/upload"
              className="inline-block w-fit px-8 py-4 bg-gray-900 text-white text-lg sm:text-xl font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200 mb-6"
            >
              Imprime tu foto
            </Link>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed font-normal">
              Sube tus fotografías y obras de arte de manera sencilla a través
              de nuestra plataforma. Ofrecemos atención personalizada para
              solicitudes especiales, asegurándonos de que cada proyecto se
              adapte perfectamente a tus necesidades.
            </p>
          </div>

          {/* Top Right: Portrait Woman Image */}
          <div ref={image1Ref} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl opacity-100 group">
            <Image
              src="/images/homepageimg/portrait_woman.jpg"
              alt="Retrato de mujer"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Bottom Row: Car Image and Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16">
          {/* Bottom Left: Car Dark Image - Square */}
          <div ref={image2Ref} className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl opacity-100 group">
            <Image
              src="/images/homepageimg/car_dark.jpg"
              alt="Automóvil"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Bottom Right: Additional Text */}
          <div
            ref={text2Ref}
            className="flex flex-col justify-center space-y-6 sm:space-y-8 opacity-100 px-4 sm:px-0"
          >
            <div className="w-20 h-0.5 bg-gray-900 mb-8"></div>
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
              Calidad profesional en cada detalle
            </h3>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed font-normal">
              Nuestro equipo de expertos se encarga de cada aspecto del proceso,
              desde la selección de materiales hasta la instalación final.
              Garantizamos resultados de calidad museo que transformarán tus
              espacios.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

