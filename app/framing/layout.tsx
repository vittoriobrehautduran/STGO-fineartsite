import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicios de Enmarcado y Enramado Profesional | STGO Fine Art",
  description: "Servicios profesionales de enmarcado, enramado e impresión. Marcos personalizados, impresión fine art, canvas, papel museo. Enmarcado profesional para obras de arte de alta calidad.",
  keywords: [
    "enmarcado",
    "enramado",
    "marcos",
    "enmarcado profesional",
    "enramado profesional",
    "marcos personalizados",
    "impresión fine art",
    "impresión profesional",
    "imprenta",
    "impresión",
    "impresion",
    "canvas",
    "papel museo",
    "arte",
    "fine art",
    "arts",
    "fotografía artística",
  ],
  openGraph: {
    title: "Servicios de Enmarcado y Enramado Profesional | STGO Fine Art",
    description: "Servicios profesionales de enmarcado, enramado e impresión. Marcos personalizados y impresión fine art de alta calidad.",
    type: "website",
  },
};

export default function FramingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

