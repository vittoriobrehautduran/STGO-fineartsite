"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MediaType {
  id: string;
  name: string;
  description: string;
}

interface FramingOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Size {
  width: number;
  height: number;
  unit: "cm";
  basePrice: number; // Base price for this size
}

const STANDARD_SIZES: Size[] = [
  { width: 20, height: 30, unit: "cm", basePrice: 199 },
  { width: 30, height: 40, unit: "cm", basePrice: 299 },
  { width: 40, height: 60, unit: "cm", basePrice: 399 },
  { width: 50, height: 70, unit: "cm", basePrice: 499 },
  { width: 60, height: 90, unit: "cm", basePrice: 699 },
];

type Step = "upload" | "upload-success" | "options" | "review";

export default function OrderFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Options
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([]);
  const [framingOptions, setFramingOptions] = useState<FramingOption[]>([]);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedFraming, setSelectedFraming] = useState<string | null>(null); // null = "Sin Marco"
  const [specialRequests, setSpecialRequests] = useState<string>("");

  // Customer info
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Error handling
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch options from database
  useEffect(() => {
    async function fetchOptions() {
      try {
        // Fetch media types
        const { data: mediaData, error: mediaError } = await supabase
          .from("media_types")
          .select("*")
          .order("name");

        if (mediaError) throw mediaError;
        setMediaTypes(mediaData || []);

        // Fetch framing options
        const { data: framingData, error: framingError } = await supabase
          .from("framing_options")
          .select("*")
          .order("name");

        if (framingError) throw framingError;
        setFramingOptions(framingData || []);
      } catch (err: any) {
        console.error("Error fetching options:", err);
        setError("Error al cargar las opciones. Por favor, recarga la página.");
      }
    }

    fetchOptions();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validate file size (max 50MB for high quality)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("El archivo es demasiado grande. Máximo 50MB.");
        return;
      }

      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona una imagen");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `order-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage - NO COMPRESSION
      // Use customer-uploads bucket for order images
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("customer-uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type, // Preserve original content type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the file URL (private, but we'll store the path)
      const { data: { publicUrl } } = supabase.storage
        .from("customer-uploads")
        .getPublicUrl(filePath);

      setUploadedImageUrl(filePath); // Store path, not full URL
      setUploadProgress(100);
      
      // Move to upload success step to show confirmation
      setTimeout(() => {
        setStep("upload-success");
        setUploading(false);
      }, 500);
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setError(err.message || "Error al subir la imagen. Por favor, intenta de nuevo.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const calculateTotal = (): number => {
    if (!selectedSize) return 0;
    
    let total = selectedSize.basePrice;
    
    // Add framing price if selected
    if (selectedFraming) {
      const framing = framingOptions.find(f => f.id === selectedFraming);
      if (framing) {
        total += framing.price;
      }
    }
    
    return total;
  };

  const handleContinueToReview = () => {
    if (!selectedMediaType || !selectedSize) {
      setError("Por favor selecciona todas las opciones requeridas");
      return;
    }
    setStep("review");
    setError(null);
  };

  const handleCreateOrder = async () => {
    if (!customerEmail || !customerName) {
      setError("Por favor completa tu información de contacto");
      return;
    }

    if (!uploadedImageUrl || !selectedMediaType || !selectedSize) {
      setError("Faltan datos del pedido. Por favor, vuelve al inicio.");
      return;
    }

    setIsProcessingOrder(true);
    setError(null);

    try {
      const totalAmount = calculateTotal();

      // Create order in database
      const orderDataToInsert: any = {
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone || null,
        total_amount: totalAmount,
        status: "pending",
        image_url: uploadedImageUrl,
      };

      // Add special requests if provided (only if the field exists in the database)
      if (specialRequests.trim()) {
        orderDataToInsert.special_requests = specialRequests.trim();
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(orderDataToInsert)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item
      const { error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderData.id,
          media_type_id: selectedMediaType,
          size_width: selectedSize.width,
          size_height: selectedSize.height,
          size_unit: selectedSize.unit,
          framing_option_id: selectedFraming || null,
          item_price: totalAmount,
        });

      if (itemError) throw itemError;

      // Redirect to checkout page
      router.push(`/checkout?orderId=${orderData.id}`);
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.message || "Error al crear el pedido. Por favor, intenta de nuevo.");
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {["upload", "options", "review"].map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === s
                  ? "bg-gray-900 text-white"
                  : ["upload", "options", "review"].indexOf(step) > index
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {index + 1}
            </div>
            {index < 2 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  ["upload", "options", "review"].indexOf(step) > index
                    ? "bg-gray-900"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Sube tu Imagen
          </h2>
          <p className="text-gray-600 text-center">
            Selecciona una imagen de alta calidad. No se aplicará compresión.
          </p>

          {!preview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-lg font-medium text-gray-700 mb-2">
                  Haz clic para seleccionar una imagen
                </span>
                <span className="text-sm text-gray-500">
                  Formatos: JPG, PNG, HEIC (Máx. 50MB)
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">{file?.name}</p>
                <p className="text-xs text-gray-500">
                  {(file?.size ? file.size / 1024 / 1024 : 0).toFixed(2)} MB
                </p>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cambiar Imagen
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? "Subiendo..." : "Continuar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1.5: Upload Success - Show confirmation */}
      {step === "upload-success" && (
        <div className="space-y-6">
          <div className="text-center space-y-4">
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
            <h2 className="text-2xl font-bold text-gray-900">
              ¡Imagen Subida Exitosamente!
            </h2>
            <p className="text-gray-600">
              Tu imagen ha sido subida exitosamente.
            </p>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={preview}
                alt="Uploaded image"
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Upload Details */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nombre del archivo:</span>
              <span className="font-semibold text-gray-900">{file?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tamaño:</span>
              <span className="font-semibold text-gray-900">
                {(file?.size ? file.size / 1024 / 1024 : 0).toFixed(2)} MB
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tu imagen está lista:</strong>
              <br />
              La imagen ha sido guardada correctamente y está lista para continuar con tu pedido.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setUploadedImageUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                setStep("upload");
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Subir Otra Imagen
            </button>
            <button
              onClick={() => setStep("options")}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800"
            >
              Continuar con Opciones
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Options */}
      {step === "options" && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Selecciona tus Opciones
          </h2>

          {/* Media Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tipo de Medio *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaTypes.map((media) => (
                <button
                  key={media.id}
                  onClick={() => setSelectedMediaType(media.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedMediaType === media.id
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-gray-900">{media.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {media.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tamaño *
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {STANDARD_SIZES.map((size, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSize(size)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    selectedSize?.width === size.width &&
                    selectedSize?.height === size.height
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-gray-900">
                    {size.width}×{size.height}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{size.unit}</div>
                  <div className="text-sm font-medium text-gray-700 mt-2">
                    ${size.basePrice}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Framing Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Opciones de Enmarcado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedFraming(null)}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  selectedFraming === null
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-900">Sin Marco</div>
                <div className="text-sm text-gray-600 mt-1">Solo impresión</div>
                <div className="text-sm font-medium text-gray-700 mt-2">$0</div>
              </button>
              {framingOptions
                .filter((f) => f.name !== "Sin Marco")
                .map((framing) => (
                  <button
                    key={framing.id}
                    onClick={() => setSelectedFraming(framing.id)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      selectedFraming === framing.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">
                      {framing.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {framing.description}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mt-2">
                      +${framing.price}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Special Requests / Other */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Solicitudes Especiales o Notas Adicionales
            </h3>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Si tienes alguna solicitud especial, tamaño personalizado, o nota adicional, escríbela aquí..."
              rows={4}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none resize-none transition-all duration-300 hover:border-gray-400 bg-white shadow-sm"
            />
            <p className="text-sm text-gray-500 mt-2">
              Opcional: Comparte cualquier detalle adicional sobre tu pedido
            </p>
          </div>

          {/* Total Preview */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                ${calculateTotal()}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep("upload")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              onClick={handleContinueToReview}
              className="flex-1 px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === "review" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Revisa tu Pedido
          </h2>

          {/* Image Preview */}
          {preview && (
            <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={preview}
                alt="Order preview"
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo de Medio:</span>
              <span className="font-semibold text-gray-900">
                {mediaTypes.find((m) => m.id === selectedMediaType)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tamaño:</span>
              <span className="font-semibold text-gray-900">
                {selectedSize?.width}×{selectedSize?.height} {selectedSize?.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Enmarcado:</span>
              <span className="font-semibold text-gray-900">
                {selectedFraming
                  ? framingOptions.find((f) => f.id === selectedFraming)?.name
                  : "Sin Marco"}
              </span>
            </div>
            {specialRequests.trim() && (
              <div className="border-t border-gray-300 pt-4">
                <div className="text-gray-600 mb-2">Solicitudes Especiales:</div>
                <div className="bg-white p-3 rounded border border-gray-200 text-gray-900">
                  {specialRequests}
                </div>
              </div>
            )}
            <div className="border-t border-gray-300 pt-4 flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                ${calculateTotal()}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Información de Contacto
            </h3>
            <input
              type="text"
              placeholder="Nombre completo *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              required
            />
            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep("options")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              onClick={handleCreateOrder}
              disabled={isProcessingOrder}
              className="flex-1 px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessingOrder ? "Procesando..." : "Continuar al Pago"}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

