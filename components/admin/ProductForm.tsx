"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { formatCurrency } from "@/lib/currency";
import { FIXED_SIZES, FixedSize } from "@/lib/fixed-sizes";

interface ProductFormProps {
  product?: any;
  initialSizes?: any[];
  initialFramingIds?: string[];
  allFramingOptions?: any[];
  onSuccess: () => void;
}

interface SizePrice {
  sizeKey: string; // e.g., "20x30"
  price: number;
}

export default function ProductForm({
  product,
  initialSizes = [],
  initialFramingIds = [],
  allFramingOptions = [],
  onSuccess,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url || null
  );
  
  const initializeSizePrices = (): Record<string, number> => {
    const prices: Record<string, number> = {};
    FIXED_SIZES.forEach((size) => {
      const sizeKey = `${size.width}x${size.height}`;
      // Try to find existing price from initialSizes
      const existingSize = initialSizes.find(
        (s) => s.width === size.width && s.height === size.height
      );
      prices[sizeKey] = existingSize?.price || size.basePrice;
    });
    return prices;
  };

  const [sizePrices, setSizePrices] = useState<Record<string, number>>(
    initializeSizePrices()
  );
  
  const [framingOptions, setFramingOptions] = useState<any[]>([]);
  
  // Default framing options that should always be selected
  const DEFAULT_FRAMING_OPTIONS = [
    'Sin Marco',
    'Dorado',
    'Blanco',
    'Marco Negro Clásico',
    'Marco de Madera Natural',
    'Plateado'
  ];

  const initializeFramingIds = (options: any[]): string[] => {
    if (product && initialFramingIds.length > 0) {
      // For existing products, use the existing selections
      return initialFramingIds;
    }
    // For new products, select all default options
    return options
      .filter((opt) => DEFAULT_FRAMING_OPTIONS.includes(opt.name))
      .map((opt) => opt.id);
  };

  const [selectedFramingIds, setSelectedFramingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFramingOptions() {
      let options: any[] = [];
      
      if (allFramingOptions.length > 0) {
        options = allFramingOptions;
      } else {
        try {
          const response = await fetch("/api/admin/framing-options");
          const result = await response.json();
          if (response.ok) {
            options = result.data || [];
          } else {
            console.error("Error fetching framing options:", result.error);
          }
        } catch (error) {
          console.error("Error fetching framing options:", error);
        }
      }

      const seenNames = new Set<string>();
      const uniqueOptions = options.filter((opt) => {
        if (seenNames.has(opt.name)) {
          return false;
        }
        seenNames.add(opt.name);
        return true;
      });

      const defaultOptions = DEFAULT_FRAMING_OPTIONS.map((name) =>
        uniqueOptions.find((opt) => opt.name === name)
      ).filter(Boolean) as any[];

      setFramingOptions(defaultOptions);
      
      if (defaultOptions.length > 0) {
        const defaultIds = defaultOptions.map((opt) => opt.id);
        
        if (product && initialFramingIds.length > 0) {
          const existingDefaultIds = defaultOptions
            .filter((opt) => initialFramingIds.includes(opt.id))
            .map((opt) => opt.id);
          const mergedIds = [...new Set([...defaultIds, ...existingDefaultIds])];
          setSelectedFramingIds(mergedIds);
        } else {
          setSelectedFramingIds(defaultIds);
        }
      }
    }

    fetchFramingOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFramingOptions, product?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSizePriceChange = (sizeKey: string, price: number) => {
    setSizePrices({
      ...sizePrices,
      [sizeKey]: price,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let finalImageUrl = imageUrl;

      // Upload image if new file selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        // Check if response is JSON before parsing
        const contentType = uploadResponse.headers.get("content-type");
        let uploadResult;
        
        if (contentType && contentType.includes("application/json")) {
          uploadResult = await uploadResponse.json();
        } else {
          const text = await uploadResponse.text();
          throw new Error(`Error al subir la imagen: ${text.substring(0, 100)}`);
        }

        if (!uploadResponse.ok) {
          throw new Error(uploadResult.error || "Error al subir la imagen");
        }

        finalImageUrl = uploadResult.url;
      }

      if (!finalImageUrl) {
        throw new Error("Se requiere una imagen del producto");
      }

      // Prepare sizes from fixed sizes with their prices
      const sizes = FIXED_SIZES.map((size) => {
        const sizeKey = `${size.width}x${size.height}`;
        return {
          width: size.width,
          height: size.height,
          unit: size.unit,
          price: sizePrices[sizeKey] || size.basePrice,
        };
      }).filter((s) => s.price > 0); // Only include sizes with prices > 0

      if (sizes.length === 0) {
        throw new Error("Debe configurar al menos un tamaño con precio");
      }

      const defaultFramingIds = framingOptions
        .filter((opt) => DEFAULT_FRAMING_OPTIONS.includes(opt.name))
        .map((opt) => opt.id);
      
      const allFramingIds = [...new Set([...defaultFramingIds, ...selectedFramingIds])];

      // Create or update product via API
      const productData = {
        name,
        description,
        image_url: finalImageUrl,
        featured: false, // Featured collection is now hardcoded, always set to false
        sizes: sizes,
        framing_option_ids: allFramingIds,
      };

      const url = product?.id
        ? "/api/admin/products"
        : "/api/admin/products";
      const method = product?.id ? "PUT" : "POST";

      const requestBody = product?.id
        ? { ...productData, id: product.id }
        : productData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Error al guardar el producto: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(result.error || "Error al guardar el producto");
      }

      onSuccess();
    } catch (err: any) {
      console.error("Error saving product:", err);
      setError(err.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Información Básica
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>

      </div>

      {/* Image */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Imagen</h3>

        {imagePreview && (
          <div className="relative w-48 h-48 border border-gray-300 rounded-lg overflow-hidden">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {product ? "Cambiar Imagen" : "Imagen del Producto *"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required={!product}
          />
          {product && !imageFile && (
            <p className="mt-2 text-sm text-gray-500">
              Imagen actual: {imageUrl}
            </p>
          )}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tamaños y Precios</h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure el precio para cada tamaño disponible. Los precios son en pesos chilenos (CLP).
          </p>
        </div>

        <div className="space-y-3">
          {FIXED_SIZES.map((size) => {
            const sizeKey = `${size.width}x${size.height}`;
            const currentPrice = sizePrices[sizeKey] || size.basePrice;
            return (
              <div
                key={sizeKey}
                className="grid grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg items-center"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamaño
                  </label>
                  <div className="text-sm font-semibold text-gray-900">
                    {size.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {size.width} × {size.height} {size.unit}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (CLP) *
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={currentPrice}
                    onChange={(e) =>
                      handleSizePriceChange(
                        sizeKey,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder={size.basePrice.toString()}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Precio sugerido: {formatCurrency(size.basePrice)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Precio actual:</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(currentPrice)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Framing Options */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Opciones de Enmarcado
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Todas las opciones están incluidas por defecto. Los precios se calculan proporcionalmente al tamaño seleccionado.
          </p>
        </div>
        <div className="space-y-2">
          {framingOptions.map((option) => {
            const isSelected = selectedFramingIds.includes(option.id);
            const isSinMarco = option.name === 'Sin Marco';
            
            return (
              <div
                key={option.id}
                className={`flex items-center p-3 border rounded-lg ${
                  isSinMarco
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={true}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-not-allowed opacity-60"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {option.name}
                    </span>
                    {isSinMarco && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">
                        Por defecto
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{option.description}</p>
                  <p className="text-xs text-gray-600 italic">
                    Precio calculado proporcionalmente al tamaño
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : product ? "Actualizar" : "Crear Producto"}
        </button>
        <button
          type="button"
          onClick={onSuccess}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

