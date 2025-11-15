"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/admin/products");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Agregar Producto</h2>
        <p className="text-gray-600 mt-2">Crea un nuevo producto para la tienda</p>
      </div>
      <ProductForm onSuccess={handleSuccess} />
    </div>
  );
}

