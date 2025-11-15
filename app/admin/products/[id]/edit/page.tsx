"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [sizes, setSizes] = useState<any[]>([]);
  const [framingOptions, setFramingOptions] = useState<any[]>([]);
  const [selectedFramingIds, setSelectedFramingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (productError) throw productError;

        // Fetch sizes
        const { data: sizesData, error: sizesError } = await supabase
          .from("product_sizes")
          .select("*")
          .eq("product_id", productId);

        if (sizesError) throw sizesError;

        // Fetch framing options
        const { data: framingData, error: framingError } = await supabase
          .from("product_framing_options")
          .select("framing_option_id")
          .eq("product_id", productId);

        if (framingError) throw framingError;

        // Fetch all framing options
        const { data: allFramingOptions } = await supabase
          .from("framing_options")
          .select("*");

        setProduct(productData);
        setSizes(sizesData || []);
        setFramingOptions(allFramingOptions || []);
        setSelectedFramingIds(
          framingData?.map((f) => f.framing_option_id) || []
        );
      } catch (error) {
        console.error("Error fetching product:", error);
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const handleSuccess = () => {
    router.push("/admin/products");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Editar Producto</h2>
        <p className="text-gray-600 mt-2">Modifica los detalles del producto</p>
      </div>
      <ProductForm
        product={product}
        initialSizes={sizes}
        initialFramingIds={selectedFramingIds}
        allFramingOptions={framingOptions}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

