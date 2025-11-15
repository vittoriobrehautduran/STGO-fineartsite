"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [orderItem, setOrderItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError) throw orderError;

        // Fetch order item
        const { data: itemData, error: itemError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId)
          .single();

        if (itemError && itemError.code !== "PGRST116") {
          // PGRST116 is "not found" - it's okay if there's no item
          console.error("Error fetching order item:", itemError);
        }

        setOrder(orderData);
        setOrderItem(itemData);
      } catch (error) {
        console.error("Error fetching order:", error);
        router.push("/admin/orders");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`¿Cambiar el estado del pedido a "${newStatus}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error al actualizar el estado del pedido");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!order?.image_url) return;

    try {
      // Extract file path from URL
      const url = new URL(order.image_url);
      const pathParts = url.pathname.split("/");
      const bucket = pathParts[2]; // e.g., "customer-uploads"
      const filePath = pathParts.slice(3).join("/"); // rest of the path

      // Download file from Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);

      if (error) throw error;

      // Create download link
      // data is already a Blob from Supabase storage
      const downloadUrl = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `order-${orderId}-${filePath.split("/").pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Fallback: open in new tab
      window.open(order.image_url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const labels: Record<string, string> = {
      pending: "Pendiente",
      paid: "Pagado",
      processing: "En Proceso",
      completed: "Completado",
      cancelled: "Cancelado",
    };

    return (
      <span
        className={`px-3 py-1 text-sm font-semibold rounded-full ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Volver a Pedidos
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Detalles del Pedido</h2>
          <p className="text-gray-600 mt-2">ID: {order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Pedido
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updating}
                    className="ml-2 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="processing">En Proceso</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-gray-900">
                  ${order.total_amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="text-gray-900">
                  {new Date(order.created_at).toLocaleString("es-CL")}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Cliente
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Nombre:</span>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium text-gray-900">{order.customer_email}</p>
              </div>
              {order.customer_phone && (
                <div>
                  <span className="text-gray-600">Teléfono:</span>
                  <p className="font-medium text-gray-900">{order.customer_phone}</p>
                </div>
              )}
            </div>
          </div>

          {orderItem && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalles del Item
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Tamaño:</span>
                  <p className="font-medium text-gray-900">
                    {orderItem.size_width} x {orderItem.size_height}{" "}
                    {orderItem.size_unit}
                  </p>
                </div>
                {orderItem.framing_option_id && (
                  <div>
                    <span className="text-gray-600">Enmarcado:</span>
                    <p className="font-medium text-gray-900">
                      ID: {orderItem.framing_option_id.substring(0, 8)}...
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Precio del Item:</span>
                  <p className="font-medium text-gray-900">
                    ${orderItem.item_price}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Imagen del Cliente
          </h3>
          {order.image_url ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-square border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={order.image_url}
                  alt="Customer upload"
                  fill
                  className="object-contain"
                />
              </div>
              <button
                onClick={handleDownloadImage}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Descargar Imagen
              </button>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">URL:</p>
                <p className="break-all text-xs">{order.image_url}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No hay imagen disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}

