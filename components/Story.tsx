"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;

    if (!section || !title) return;

    // Fade in title
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
          id: "story-title",
        },
      }
    );

    const titleTrigger = ScrollTrigger.getById("story-title");

    return () => {
      if (titleTrigger) titleTrigger.kill();
      if (titleAnimation) titleAnimation.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-gray-200 py-16 sm:py-20 md:py-28 px-4 sm:px-6"
    >
      <div className="container mx-auto max-w-[95%] lg:max-w-[92%]">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block w-20 h-0.5 bg-gray-900 mb-6"></div>
          <h2
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 tracking-tight"
          >
            Nuestra Historia
          </h2>
        </div>
        <div className="space-y-6 sm:space-y-8 text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed">
          <p>
            En STGO Fine Art, nos especializamos en transformar tus momentos más
            preciados en impresiones impresionantes de calidad museo. Utilizando
            tecnología de impresión de alta resolución de última generación,
            damos vida a cada detalle con una claridad y precisión de color
            inigualables.
          </p>
          <p>
            Nuestro compromiso va más allá de la impresión. Ofrecemos servicios
            de enmarcado expertos, seleccionando cuidadosamente materiales que
            complementan tu obra de arte y la protegen durante generaciones.
            Desde marcos de madera clásicos hasta diseños metálicos modernos,
            nos aseguramos de que tu pieza se presente exactamente como la
            imaginas.
          </p>
          <p>
            Pero no nos detenemos ahí. Nuestro equipo proporciona servicios
            profesionales de instalación, colgando tu obra de arte con
            precisión y cuidado en tu hogar u oficina. Nos encargamos de todo,
            desde la entrega hasta la colocación final, haciendo que todo el
            proceso sea fluido y sin estrés.
          </p>
          <p className="text-gray-900 font-medium">
            Experimenta la diferencia de la verdadera impresión de arte fino.
            Permítenos ayudarte a crear algo hermoso que será atesorado durante
            años.
          </p>
        </div>
      </div>
    </section>
  );
}

