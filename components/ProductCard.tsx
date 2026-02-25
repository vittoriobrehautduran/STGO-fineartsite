"use client";

import { Product } from "@/types/product";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/contexts/ToastContext";
import { calculateFramePrice } from "@/lib/fixed-sizes";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullSizeOpen, setIsFullSizeOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedFraming, setSelectedFraming] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { addToCart } = useCart();
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSize(null);
    setSelectedFraming(null);
  }, []);

  useEffect(() => {
    if (isModalOpen && !selectedFraming) {
      const sinMarcoOption = product.framingOptions.find(
        (opt) => opt.name === "Sin Marco" || opt.name.toLowerCase().includes("sin marco")
      );
      if (sinMarcoOption) {
        setSelectedFraming(sinMarcoOption.id);
      }
    }
  }, [isModalOpen, product.framingOptions, selectedFraming]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleCloseModal();
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isModalOpen, handleCloseModal]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      showError("Por favor selecciona un tamaño");
      return;
    }

    const selectedSizeObj = product.sizes.find((s) => s.id === selectedSize);
    const selectedFramingObj = product.framingOptions.find(
      (f) => f.id === selectedFraming
    );

    if (!selectedSizeObj) {
      showError("Error: Tamaño no encontrado");
      return;
    }

    const calculatedFramePrice = selectedFramingObj
      ? calculateFramePrice(selectedFramingObj.name, selectedSizeObj.price)
      : 0;

    const cartItem = {
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      sizeId: selectedSize,
      size: {
        width: selectedSizeObj.width,
        height: selectedSizeObj.height,
        unit: selectedSizeObj.unit,
      },
      sizePrice: selectedSizeObj.price,
      framingId: selectedFraming || null,
      framingName: selectedFramingObj?.name || null,
      framingPrice: calculatedFramePrice,
      quantity: 1,
      totalPrice: selectedSizeObj.price + calculatedFramePrice,
    };

    addToCart(cartItem);
    handleCloseModal();
    
    // Show success message
    showSuccess("Producto agregado al carrito");
  };

  const handleBackdropClick = () => {
    handleCloseModal();
  };

  const selectedSizeObj = product.sizes.find((s) => s.id === selectedSize);
  const selectedFramingObj = product.framingOptions.find(
    (f) => f.id === selectedFraming
  );

  const printPrice = selectedSizeObj?.price || product.price || 0;
  const framePrice = selectedFramingObj
    ? calculateFramePrice(selectedFramingObj.name, printPrice)
    : 0;

  const totalPrice = printPrice + framePrice;

  return (
    <>
      {/* Product Card Preview */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative aspect-[3/4] cursor-pointer overflow-hidden"
            aria-label={`Ver detalles de ${product.name}`}
          >
            <img
              key={`${product.id}-${product.image}`}
              src={product.image}
              alt={`${product.name} - Arte decorativo impresión fine art Chile`}
              className="object-cover w-full h-full"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const imageKey = `${product.id}-${product.image}`;
                if (!imageErrors.has(imageKey)) {
                  setImageErrors(prev => new Set(prev).add(imageKey));
                  setFailedImages(prev => new Set(prev).add(product.image));
                  console.error('Image failed to load:', {
                    productId: product.id,
                    productName: product.name,
                    imageUrl: product.image,
                    attemptedUrl: target.src
                  });
                }
              }}
            />
          </button>
              <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                {product.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 line-clamp-3 leading-relaxed font-light">
                {product.description}
              </p>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  Desde {formatCurrency(product.price)}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-gray-900 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg tracking-wide"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay - Rendered via Portal */}
      {isModalOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            {/* Backdrop - clickable overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

            {/* Modal Content - centered */}
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl md:max-w-5xl max-h-[90vh] overflow-y-auto animate-slide-up z-10 pointer-events-auto border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-gray-900 hover:text-gray-700 transition-colors duration-200 shadow-lg"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
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
            </button>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:sticky md:top-0">
                <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                  <img
                    key={`${product.id}-modal-${product.image}`}
                    src={product.image}
                    alt={`${product.name} - Impresión fine art profesional Chile`}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const imageKey = `${product.id}-modal-${product.image}`;
                      if (!imageErrors.has(imageKey)) {
                        setImageErrors(prev => new Set(prev).add(imageKey));
                        setFailedImages(prev => new Set(prev).add(product.image));
                        console.error('Modal image failed to load:', {
                          productId: product.id,
                          productName: product.name,
                          imageUrl: product.image,
                          attemptedUrl: target.src
                        });
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => setIsFullSizeOpen(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                  Ver tamaño completo
                </button>
              </div>
              <div className="p-6 sm:p-8">
                <div className="w-16 h-0.5 bg-gray-900 mb-6"></div>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  {product.name}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed font-light">
                  {product.description}
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                      Seleccionar Tamaño
                    </h4>
                    <select
                      value={selectedSize || ""}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base text-gray-900 bg-white focus:border-gray-900 focus:outline-none transition-all duration-300 hover:border-gray-400 shadow-sm"
                    >
                      <option value="">Elegir tamaño</option>
                      {product.sizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.width} cm × {size.height} cm - {formatCurrency(size.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {product.mediaTypes && product.mediaTypes.length > 0 && (
                    <div>
                      <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                        Opciones de Medio
                      </h4>
                      <div className="space-y-2">
                        {product.mediaTypes.map((media) => (
                          <div
                            key={media.id}
                            className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50"
                          >
                            <div className="font-medium text-base text-gray-900">
                              {media.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {media.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                      Opciones de Enmarcado
                    </h4>
                    <div className="space-y-2">
                      {product.framingOptions.map((option) => {
                        const printPrice = selectedSizeObj?.price || product.price || 0;
                        const calculatedFramePrice = calculateFramePrice(option.name, printPrice);
                        
                        return (
                          <label
                            key={option.id}
                            className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200"
                          >
                            <input
                              type="radio"
                              name={`framing-${product.id}`}
                              value={option.id}
                              checked={selectedFraming === option.id}
                              onChange={() => setSelectedFraming(option.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-base text-gray-900">
                                {option.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {option.description}
                              </div>
                              {calculatedFramePrice > 0 && (
                                <div className="text-sm font-medium text-gray-900 mt-1">
                                  +{formatCurrency(calculatedFramePrice)}
                                  {selectedSizeObj && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      (proporcional al tamaño)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg sm:text-xl font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-gray-900 text-white py-4 px-8 rounded-xl text-base font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg tracking-wide"
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
          document.body
        )}

      {/* Full Size Image Modal */}
      {isFullSizeOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsFullSizeOpen(false)}
          >
            <button
              onClick={() => setIsFullSizeOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-gray-900 hover:text-gray-700 transition-colors duration-200 shadow-lg"
              aria-label="Cerrar"
            >
              <svg
                className="w-6 h-6"
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
            </button>
            <div
              className="relative max-w-[95vw] max-h-[95vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                key={`${product.id}-fullsize-${product.image}`}
                src={product.image}
                alt={`${product.name} - Tamaño completo`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const imageKey = `${product.id}-fullsize-${product.image}`;
                  if (!imageErrors.has(imageKey)) {
                    setImageErrors(prev => new Set(prev).add(imageKey));
                    try {
                      const url = new URL(target.src);
                      url.searchParams.set('_t', Date.now().toString());
                      target.src = url.toString();
                    } catch {
                      const separator = target.src.includes('?') ? '&' : '?';
                      target.src = `${target.src}${separator}_t=${Date.now()}`;
                    }
                  }
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

