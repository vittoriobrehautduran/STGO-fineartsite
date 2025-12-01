import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { getAllProducts } from "@/lib/products";
import type { Metadata } from "next";

// Force dynamic rendering to always fetch fresh data from Supabase
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Colección de Arte | Impresión Fine Art y Enmarcado",
  description: "Explora nuestra colección completa de obras de arte de alta calidad. Impresión fine art profesional, enmarcado y servicios de instalación. Arte decorativo, fotografía artística y impresión en canvas.",
  keywords: [
    "colección arte",
    "colección arte chile",
    "arte decorativo",
    "arte decorativo chile",
    "impresión fine art",
    "impresión fine art chile",
    "fotografía artística",
    "fotografía artística chile",
    "arte para decoración",
    "impresión profesional",
    "impresión profesional chile",
    "enmarcado profesional",
    "enmarcado profesional chile",
    "arte fino",
    "fine art",
    "arts",
    "imprenta",
    "imprenta chile",
    "imprenta santiago",
    "imprenta profesional chile",
    "impresión",
    "impresión chile",
    "impresión santiago",
    "enramado",
    "enramado chile",
    "marcos personalizados",
    "marcos personalizados chile",
  ],
  openGraph: {
    title: "Colección de Arte | STGO Fine Art",
    description: "Explora nuestra colección completa de obras de arte de alta calidad. Impresión fine art profesional y enmarcado.",
    type: "website",
  },
};

export default async function CollectionPage() {
  const products = await getAllProducts();

  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar />
      <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-block w-20 h-0.5 bg-gray-900 mb-6"></div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 text-gray-900 tracking-tight">
              Nuestra Colección
            </h1>
            <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto">
              Explora nuestra selección completa de obras de arte de alta calidad
            </p>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No hay productos disponibles en este momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

