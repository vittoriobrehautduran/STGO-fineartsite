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
      alert("Please select a size");
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
      <div className="bg-stone-50 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative aspect-[3/4]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 line-clamp-3">
                {product.description}
              </p>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  From ${product.price}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-gray-900 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-800 transition-colors duration-200"
                >
                  View Details
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
              className="relative bg-stone-50 rounded-lg shadow-2xl w-full max-w-4xl md:max-w-5xl max-h-[90vh] overflow-y-auto animate-slide-up z-10 pointer-events-auto"
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
              <div className="p-4 sm:p-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-6">
                  {product.description}
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                      Select Size
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(size.id)}
                          className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                            selectedSize === size.id
                              ? "border-gray-900 bg-gray-50 scale-105"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="font-medium text-base text-gray-900">
                            {size.width}" × {size.height}"
                          </div>
                          <div className="text-sm text-gray-600">
                            ${size.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                      Framing Options
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
                      className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors duration-200"
                    >
                      Add to Cart
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

