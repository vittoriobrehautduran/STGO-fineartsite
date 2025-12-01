"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    // Validate required fields
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.address) {
      alert("Por favor completa todos los campos requeridos (Nombre, Apellido, Email y Dirección)");
      return;
    }

    setIsProcessing(true);

    try {
      const totalAmount = getTotalPrice();

      // Use first product image as image_url (required field)
      const firstProductImage = cartItems.length > 0 ? cartItems[0].productImage : null;

      // Combine first name and last name for customer_name
      const fullName = `${customerInfo.firstName} ${customerInfo.lastName}`.trim();
      
      // Create order in database
      const orderDataToInsert: any = {
        customer_email: customerInfo.email,
        customer_name: fullName,
        customer_phone: customerInfo.phone || null,
        total_amount: totalAmount,
        status: "pending",
        image_url: firstProductImage || "/images/logo1.jpg", // Use first product image or fallback
      };
      
      // Note: customer_address field is collected but not stored in database yet
      // The address column needs to be added to the orders table first
      
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(orderDataToInsert)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      // Note: order_items table doesn't have product_id or quantity columns
      // Each cart item is inserted as a separate order_item
      for (const item of cartItems) {
        // Insert one order_item per quantity unit
        for (let i = 0; i < item.quantity; i++) {
          const { error: itemError } = await supabase.from("order_items").insert({
            order_id: orderData.id,
            size_width: item.size.width,
            size_height: item.size.height,
            size_unit: item.size.unit,
            framing_option_id: item.framingId || null,
            item_price: item.totalPrice / item.quantity, // Price per unit
          });

          if (itemError) throw itemError;
        }
      }

      // Clear cart
      clearCart();

      // Redirect to checkout
      router.push(`/checkout?orderId=${orderData.id}`);
    } catch (error: any) {
      console.error("Error creating order:", error);
      alert("Error al procesar el pedido. Por favor, intenta de nuevo.");
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-stone-50">
        <Navbar />
        <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-white rounded-lg shadow-lg p-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Tu carrito está vacío
              </h1>
              <p className="text-gray-600 mb-8">
                Agrega productos desde la colección para comenzar
              </p>
              <Link
                href="/collection"
                className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Ver Colección
              </Link>
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
      <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Carrito de Compras
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="rounded-lg"
                      style={{ 
                        maxHeight: '300px',
                        width: 'auto',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">
                      {item.productName}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-2 break-words">
                      Tamaño: {item.size.width} × {item.size.height} {item.size.unit}
                    </p>
                    {item.framingName && (
                      <p className="text-sm sm:text-base text-gray-600 mb-2 break-words">
                        Enmarcado: <span className="whitespace-normal">{item.framingName}</span>
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-4">
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 whitespace-nowrap">Cantidad:</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
                          >
                            −
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="mt-4 text-red-600 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Información de Contacto
                </h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, firstName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Juan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, lastName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Pérez"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="juan@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, address: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Calle, Número, Comuna, Ciudad"
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full px-6 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? "Procesando..." : "Proceder al Pago"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

