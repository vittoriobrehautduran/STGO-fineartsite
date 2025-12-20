"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { formatCurrency } from "@/lib/currency";

interface ProductFormProps {
  product?: any;
  initialSizes?: any[];
  initialFramingIds?: string[];
  allFramingOptions?: any[];
  onSuccess: () => void;
}

interface Size {
  id?: string;
  width: number;
  height: number;
  unit: "cm" | "inches";
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
  const [basePrice, setBasePrice] = useState(product?.base_price || "");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url || null
  );
  const [sizes, setSizes] = useState<Size[]>(
    initialSizes.length > 0
      ? initialSizes.map((s) => ({
          id: s.id,
          width: s.width,
          height: s.height,
          unit: s.unit,
          price: s.price,
        }))
      : [{ width: 0, height: 0, unit: "cm" as const, price: 0 }]
  );
  const [framingOptions, setFramingOptions] = useState<any[]>([]);
  const [selectedFramingIds, setSelectedFramingIds] = useState<string[]>(
    initialFramingIds
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFramingOptions() {
      if (allFramingOptions.length > 0) {
        setFramingOptions(allFramingOptions);
        return;
      }

      try {
        const response = await fetch("/api/admin/framing-options");
        const result = await response.json();
        if (response.ok) {
          setFramingOptions(result.data || []);
        } else {
          console.error("Error fetching framing options:", result.error);
        }
      } catch (error) {
        console.error("Error fetching framing options:", error);
      }
    }

    fetchFramingOptions();
  }, [allFramingOptions]);

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

  const handleAddSize = () => {
    setSizes([...sizes, { width: 0, height: 0, unit: "cm", price: 0 }]);
  };

  const handleRemoveSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleSizeChange = (
    index: number,
    field: keyof Size,
    value: any
  ) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizes(newSizes);
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

      // Prepare valid sizes
      const validSizes = sizes.filter(
        (s) => s.width > 0 && s.height > 0 && s.price > 0
      );

      // Create or update product via API
      const productData = {
        name,
        description,
        base_price: basePrice,
        image_url: finalImageUrl,
        featured,
        sizes: validSizes,
        framing_option_ids: selectedFramingIds,
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Base *
            </label>
            <input
              type="number"
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center pt-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <span className="ml-2 text-sm text-gray-700">Producto Destacado</span>
            </label>
          </div>
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Tamaños</h3>
          <button
            type="button"
            onClick={handleAddSize}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            + Agregar Tamaño
          </button>
        </div>

        {sizes.map((size, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ancho
              </label>
              <input
                type="number"
                value={size.width || ""}
                onChange={(e) =>
                  handleSizeChange(index, "width", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alto
              </label>
              <input
                type="number"
                value={size.height || ""}
                onChange={(e) =>
                  handleSizeChange(index, "height", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Unidad
              </label>
              <select
                value={size.unit}
                onChange={(e) =>
                  handleSizeChange(index, "unit", e.target.value as "cm" | "inches")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="cm">cm</option>
                <option value="inches">inches</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                value={size.price || ""}
                onChange={(e) =>
                  handleSizeChange(index, "price", parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => handleRemoveSize(index)}
                className="w-full px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Framing Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Opciones de Enmarcado
        </h3>
        <div className="space-y-2">
          {framingOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedFramingIds.includes(option.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFramingIds([...selectedFramingIds, option.id]);
                  } else {
                    setSelectedFramingIds(
                      selectedFramingIds.filter((id) => id !== option.id)
                    );
                  }
                }}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <div className="ml-3 flex-1">
                <span className="text-sm font-medium text-gray-900">
                  {option.name}
                </span>
                <p className="text-xs text-gray-500">{option.description}</p>
                <p className="text-xs text-gray-600">{formatCurrency(option.price)}</p>
              </div>
            </label>
          ))}
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

