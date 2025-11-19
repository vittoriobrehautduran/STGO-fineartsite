"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);
      } catch (err: any) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const handlePayWithTransbank = async () => {
    if (!order || !orderId) {
      setPaymentError('No se pudo cargar la información del pedido');
      return;
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      // Create Transbank transaction
      const response = await fetch('/api/transbank/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: order.total_amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Transbank API error:', data);
        throw new Error(data.error || data.details || 'Error al crear el pago');
      }

      if (!data.url || !data.token) {
        console.error('Invalid Transbank response:', data);
        throw new Error('No se recibió la URL de pago de Transbank. Respuesta: ' + JSON.stringify(data));
      }

      console.log('Redirecting to Transbank:', data.url, 'Token:', data.token);

      // Use the URL exactly as returned by the Transbank SDK
      // The SDK handles the correct endpoint format based on environment
      const transbankUrl = data.url;
      
      if (!transbankUrl) {
        throw new Error('No URL received from Transbank');
      }
      
      console.log('Using Transbank URL (from SDK):', transbankUrl);
      console.log('Form will POST with token_ws:', data.token);
      
      // Create a form and submit it
      // Transbank requires POST with token_ws parameter
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = transbankUrl;
      form.style.display = 'none';
      form.target = '_self';
      form.id = 'transbank-form';
      
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token_ws';
      tokenInput.value = data.token;
      form.appendChild(tokenInput);
      
      // Remove any existing form
      const existingForm = document.getElementById('transbank-form');
      if (existingForm) {
        existingForm.remove();
      }
      
      document.body.appendChild(form);
      
      // Show loading state - but don't set to false since we're redirecting
      // The form submission will navigate away from the page
      
      // Wait a moment to ensure form is in DOM, then submit
      setTimeout(() => {
        try {
          // Verify form is in DOM
          if (!document.body.contains(form)) {
            console.error('Form not in DOM, re-adding...');
            document.body.appendChild(form);
          }
          
          // Submit form
          console.log('Submitting form to:', transbankUrl);
          form.submit();
        } catch (submitError) {
          console.error('Form submit error:', submitError);
          setPaymentError('Error al redirigir a Transbank. Por favor, intenta de nuevo.');
          setProcessingPayment(false);
        }
      }, 50);
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      setPaymentError(error.message || 'Error al procesar el pago. Por favor, intenta de nuevo.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50">
        <Navbar />
        <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600">Cargando información del pedido...</p>
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
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {order?.status === 'paid' ? 'Pago Completado' : 'Completar Pago'}
            </h1>
            <p className="text-gray-600">
              {order?.status === 'paid' 
                ? 'Tu pago ha sido procesado exitosamente. Te contactaremos pronto para coordinar la entrega.'
                : 'Completa el pago de tu pedido de forma segura con Transbank.'}
            </p>
            {order && (
              <div className="bg-gray-50 rounded-lg p-6 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de Pedido:</span>
                  <span className="font-semibold text-gray-900">
                    {order.id.substring(0, 8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`font-semibold ${
                    order?.status === 'paid' ? 'text-green-600' : 
                    order?.status === 'payment_failed' ? 'text-red-600' : 
                    'text-blue-600'
                  }`}>
                    {order?.status === 'paid' ? 'Pagado' : 
                     order?.status === 'payment_failed' ? 'Pago Fallido' : 
                     'Pendiente de pago'}
                  </span>
                </div>
              </div>
            )}
            
            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{paymentError}</p>
              </div>
            )}

            {order?.status !== 'paid' && (
              <div className="space-y-4">
                {processingPayment && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-blue-800 font-medium">
                      Redirigiendo a Transbank...
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Por favor, espera mientras te redirigimos a la página de pago
                    </p>
                  </div>
                )}
                <button
                  onClick={handlePayWithTransbank}
                  disabled={processingPayment || !order}
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Pagar con Transbank</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Pago seguro procesado por Transbank
                </p>
              </div>
            )}

            {order?.status === 'paid' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-green-900 mb-2">¡Pago Confirmado!</h3>
                <p className="text-sm text-green-800">
                  Te contactaremos en breve a través de {order?.customer_email} para coordinar la entrega de tu pedido.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800"
              >
                Volver al Inicio
              </Link>
              <Link
                href="/collection"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Ver Colección
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-stone-50">
          <Navbar />
          <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
            <div className="container mx-auto max-w-2xl text-center">
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-600">Cargando...</p>
              </div>
            </div>
          </section>
          <Footer />
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

