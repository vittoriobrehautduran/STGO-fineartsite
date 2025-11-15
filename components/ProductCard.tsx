"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedFraming, setSelectedFraming] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSize(null);
    setSelectedFraming(null);
  }, []);

  // Prevent body scroll when modal is open and handle ESC key
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
      alert("Por favor selecciona un tamaño");
      return;
    }
    // TODO: Implement cart functionality
    console.log("Add to cart:", {
      productId: product.id,
      sizeId: selectedSize,
      framingId: selectedFraming,
    });
  };

  const handleBackdropClick = () => {
    handleCloseModal();
  };

  const selectedSizeObj = product.sizes.find((s) => s.id === selectedSize);
  const selectedFramingObj = product.framingOptions.find(
    (f) => f.id === selectedFraming
  );

  const totalPrice =
    (selectedSizeObj?.price || product.price) +
    (selectedFramingObj?.price || 0);

  return (
    <>
      {/* Product Card Preview */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative aspect-[3/4]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
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
                  Desde ${product.price}
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
              <div className="relative aspect-[3/4] md:sticky md:top-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                />
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
                          {size.width} cm × {size.height} cm - ${size.price}
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
                      {product.framingOptions.map((option) => (
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
                            {option.price > 0 && (
                              <div className="text-sm font-medium text-gray-900 mt-1">
                                +${option.price}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg sm:text-xl font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                        ${totalPrice}
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
    </>
  );
}

