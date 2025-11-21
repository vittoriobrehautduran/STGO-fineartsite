"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/currency";

const PRESET_AMOUNTS = [5000, 10000, 20000, 50000]; // CLP amounts

export default function DonationSection() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50000); // Default to $50
  const [customAmount, setCustomAmount] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getDonationAmount = (): number => {
    if (customAmount) {
      const parsed = parseInt(customAmount.replace(/\D/g, ""));
      return parsed || 0;
    }
    return selectedAmount || 0;
  };

  const handleDonate = async () => {
    setError(null);

    // Validate amount
    const amount = getDonationAmount();
    if (amount < 50) {
      setError("El monto mínimo de donación es $50 CLP");
      return;
    }

    // Validate customer info
    if (!customerName.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setError("Por favor ingresa un email válido");
      return;
    }

    setIsProcessing(true);

    try {
      // Create donation order
      // Note: special_requests column needs to be added via migration
      // If the column doesn't exist, this will fail - run migrations/add-special-requests-column.sql
      const orderData: any = {
        customer_email: customerEmail.trim(),
        customer_name: customerName.trim(),
        customer_phone: null,
        total_amount: amount,
        status: "pending",
        image_url: "/images/logo1.jpg", // Placeholder image for donations
        special_requests: "Donación",
      };

      const { data: orderDataResult, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Redirect to checkout page
      router.push(`/checkout?orderId=${orderDataResult.id}`);
    } catch (err: any) {
      console.error("Error creating donation order:", err);
      setError("Error al procesar la donación. Por favor, intenta de nuevo.");
      setIsProcessing(false);
    }
  };

  const donationAmount = getDonationAmount();

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Apoya Nuestro Proyecto
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
              Tu donación nos ayuda a seguir creando impresiones de arte fino de calidad museo.
              Cada contribución hace la diferencia.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10">
            {/* Amount Selection */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Selecciona el monto de tu donación
              </label>
              
              {/* Preset Amounts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      selectedAmount === amount
                        ? "bg-blue-600 text-white shadow-md scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  O ingresa un monto personalizado
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="Ej: 75000"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {donationAmount > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Monto de donación:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(donationAmount)}
                  </p>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="space-y-4 mb-6 sm:mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Donate Button */}
            <button
              onClick={handleDonate}
              disabled={isProcessing || donationAmount < 50 || !customerName.trim() || !customerEmail.trim()}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>Donar {donationAmount > 0 ? formatCurrency(donationAmount) : ""}</span>
                </>
              )}
            </button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Pago seguro procesado por Transbank
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

