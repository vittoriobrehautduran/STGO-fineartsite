import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto | Impresión Fine Art y Enmarcado Profesional",
  description: "Contáctanos para consultas sobre impresión fine art, enmarcado profesional, enramado y servicios de instalación. Presupuestos personalizados para tu obra de arte.",
  keywords: [
    "contacto",
    "impresión fine art",
    "enmarcado profesional",
    "enramado",
    "imprenta",
    "impresión",
    "presupuesto",
    "consulta",
    "arte",
    "fine art",
    "arts",
  ],
  openGraph: {
    title: "Contacto | STGO Fine Art",
    description: "Contáctanos para consultas sobre impresión fine art, enmarcado profesional y servicios de instalación.",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

