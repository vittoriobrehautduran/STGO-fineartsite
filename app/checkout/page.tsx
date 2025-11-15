"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No se encontró el ID del pedido");
      setLoading(false);
      return;
    }

    // Redirect to Stripe Checkout
    async function redirectToCheckout() {
      try {
        const response = await fetch(`/api/checkout?orderId=${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          // If Stripe is not configured, show a message instead of error
          if (data.configured === false || response.status === 503) {
            setError("El sistema de pago no está configurado. Tu pedido ha sido guardado. Por favor, contacta con nosotros para completar el pago.");
            setLoading(false);
            return;
          }
          throw new Error(data.error || "Error al crear la sesión de pago");
        }

        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          throw new Error("No se recibió la URL de pago");
        }
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message || "Error al procesar el pago");
        setLoading(false);
      }
    }

    redirectToCheckout();
  }, [orderId]);

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50">
        <Navbar />
        <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p>{error}</p>
              <button
                onClick={() => router.push("/upload")}
                className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Volver
              </button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar />
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600">Redirigiendo al pago...</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

