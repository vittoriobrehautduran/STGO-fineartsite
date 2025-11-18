"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const tokenWs = searchParams.get("token_ws");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed' | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      // If we have token_ws but no orderId, try to find order by token first
      if (tokenWs && !orderId) {
        try {
          const { data: orderByToken } = await supabase
            .from("orders")
            .select("*")
            .eq("transbank_token", tokenWs)
            .single();
          
          if (orderByToken) {
            // Use the found order ID
            const url = new URL(window.location.href);
            url.searchParams.set('order_id', orderByToken.id);
            window.history.replaceState({}, '', url.toString());
            // Continue with the found orderId
          }
        } catch (err) {
          console.error("Error finding order by token:", err);
        }
      }

      const currentOrderId = orderId || new URLSearchParams(window.location.search).get('order_id');
      
      if (!currentOrderId && !tokenWs) {
        setLoading(false);
        return;
      }

      try {
        // If we have a token_ws, commit the transaction first
        if (tokenWs) {
          setPaymentStatus('processing');
          
          const commitResponse = await fetch('/api/transbank/commit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token_ws: tokenWs,
              order_id: currentOrderId, // Pass order_id if available to help with lookup
            }),
          });

          if (!commitResponse.ok) {
            const errorData = await commitResponse.json();
            console.error('Commit API error:', errorData);
            setPaymentStatus('failed');
            // Still try to fetch order to show details
          } else {
            const commitData = await commitResponse.json();
            console.log('Commit response:', commitData);
            
            if (commitData.success) {
              setPaymentStatus('success');
              // Update orderId if we got a new one from the commit
              if (commitData.orderId) {
                // Fetch updated order
                const { data: orderData } = await supabase
                  .from("orders")
                  .select("*")
                  .eq("id", commitData.orderId)
                  .single();
                
                if (orderData) {
                  setOrder(orderData);
                }
              }
            } else {
              setPaymentStatus('failed');
              // Fetch order to show details even if payment failed
              if (commitData.orderId) {
                const { data: orderData } = await supabase
                  .from("orders")
                  .select("*")
                  .eq("id", commitData.orderId)
                  .single();
                
                if (orderData) {
                  setOrder(orderData);
                }
              }
            }
          }
        }

        // Fetch order details if we have an orderId
        if (currentOrderId) {
          const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", currentOrderId)
            .single();

          if (orderError) {
            console.error("Error fetching order:", orderError);
            // Don't throw, just continue
          } else if (orderData) {
            // Set order data if we don't already have it
            if (!order) {
              setOrder(orderData);
            }
            // If payment status wasn't set yet, check order status
            if (!paymentStatus) {
              if (orderData.status === 'paid') {
                setPaymentStatus('success');
              } else if (orderData.status === 'payment_failed') {
                setPaymentStatus('failed');
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Error verifying payment:", err);
        setPaymentStatus('failed');
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [orderId, tokenWs]);

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50">
        <Navbar />
        <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">Verificando pago...</p>
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
            {paymentStatus === 'failed' ? (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            ) : paymentStatus === 'processing' ? (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {paymentStatus === 'failed' ? 'Pago Fallido' : 
               paymentStatus === 'processing' ? 'Procesando Pago...' :
               '¡Pago Exitoso!'}
            </h1>
            <p className="text-gray-600">
              {paymentStatus === 'failed' 
                ? 'Hubo un problema al procesar tu pago. Por favor, intenta de nuevo.'
                : paymentStatus === 'processing'
                ? 'Estamos verificando tu pago...'
                : 'Tu pedido ha sido recibido y está siendo procesado.'}
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
                    order.status === "paid" ? "text-green-600" :
                    order.status === "payment_failed" ? "text-red-600" :
                    "text-blue-600"
                  }`}>
                    {order.status === "paid" ? "Pagado" : 
                     order.status === "payment_failed" ? "Pago Fallido" :
                     order.status === "pending_payment" ? "Pendiente de Pago" :
                     order.status}
                  </span>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Recibirás un email de confirmación en {order?.customer_email}
            </p>
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-stone-50">
          <Navbar />
          <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
            <div className="container mx-auto max-w-2xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando...</p>
            </div>
          </section>
          <Footer />
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

