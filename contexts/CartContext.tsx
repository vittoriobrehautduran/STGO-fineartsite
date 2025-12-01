"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  sizeId: string;
  size: { width: number; height: number; unit: string };
  sizePrice: number;
  framingId: string | null;
  framingName: string | null;
  framingPrice: number;
  quantity: number;
  totalPrice: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  onItemAdded: (callback: () => void) => () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const itemAddedCallbacks = useRef<Set<() => void>>(new Set());

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
    // Notify all listeners that an item was added
    itemAddedCallbacks.current.forEach((callback) => callback());
  };

  const onItemAdded = (callback: () => void) => {
    itemAddedCallbacks.current.add(callback);
    // Return unsubscribe function
    return () => {
      itemAddedCallbacks.current.delete(callback);
    };
  };

  const removeFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity, totalPrice: (item.sizePrice + item.framingPrice) * quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        onItemAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

