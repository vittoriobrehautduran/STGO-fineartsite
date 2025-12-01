"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const isHomePage = pathname === "/";
  const isCollectionPage = pathname === "/collection";
  const { getTotalItems, onItemAdded } = useCart();
  const cartItemCount = getTotalItems();

  // Trigger animation only when an item is actually added to cart
  useEffect(() => {
    const unsubscribe = onItemAdded(() => {
      setIsCartAnimating(true);
      const timer = setTimeout(() => {
        setIsCartAnimating(false);
      }, 1000); // Animation duration - 1 second
      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, [onItemAdded]);

  useEffect(() => {
    if (isCollectionPage) {
      // Collection page: always visible
      setIsVisible(true);
    } else if (isHomePage) {
      // Homepage: always visible, but change color when navbar is over the next section
      const handleScroll = () => {
        // Find the FeaturedProducts section (next section after Hero)
        const featuredSection = document.querySelector('section[data-section="featured-collection"]');
        
        if (featuredSection) {
          const sectionTop = featuredSection.getBoundingClientRect().top;
          // Change color when the next section reaches the navbar position (top of viewport)
          // The navbar is at the top, so when sectionTop <= 0, navbar is over the section
          const scrolledPastHero = sectionTop <= 0;
          setIsPastHero(scrolledPastHero);
        } else {
          // Fallback: check if scrolled past viewport height
          // Hero is pinned for 60% of viewport, so total scroll is ~1.6x viewport
          const scrolledPastHero = window.scrollY > window.innerHeight * 1.6;
          setIsPastHero(scrolledPastHero);
        }
        setIsVisible(true); // Always visible on homepage
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Check initial state
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      // Other pages: always visible
      setIsVisible(true);
    }
  }, [isHomePage, isCollectionPage]);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/framing", label: "Enmarcado" },
    { href: "/collection", label: "Colección" },
    { href: "/upload", label: "Subir" },
    { href: "/contact", label: "Contacto" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Logo - Positioned at top left, scrolls with page */}
      <Link
        href="/"
        className="absolute top-1 sm:top-2 md:top-2 left-1 sm:left-2 md:left-2 z-[60] flex-shrink-0"
      >
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20">
          <Image
            src={isHomePage && !isPastHero ? "/images/logowhite.png" : "/images/logoblack.png"}
            alt="STGO Fine Art - Imprenta profesional de arte fine art y enmarcado en Chile"
            fill
            className="object-contain"
            priority
          />
        </div>
      </Link>

      {/* Mobile Cart Icon - Only visible on screens < 525px and when navbar is visible */}
      {isVisible && (
        <Link
          href="/cart"
          className={`fixed top-4 right-16 z-[70] max-[525px]:block hidden p-2 rounded-lg transition-colors duration-200 ${isCartAnimating ? "animate-cart-bounce" : ""}`}
          style={{
            color: isHomePage && !isPastHero ? 'white' : '#111827',
          }}
          onMouseEnter={(e) => {
            if (isHomePage && !isPastHero) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            } else {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Carrito de compras"
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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          {cartItemCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                isHomePage
                  ? "bg-white text-gray-900"
                  : "bg-gray-900 text-white"
              } ${isCartAnimating ? "animate-badge-pop" : ""}`}
            >
              {cartItemCount > 9 ? "9+" : cartItemCount}
            </span>
          )}
        </Link>
      )}

      {/* Mobile Menu Button - Only visible on screens < 525px and when navbar is visible */}
      {isVisible && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 right-4 z-[70] max-[525px]:block hidden p-2 rounded-lg transition-colors duration-200"
          style={{
            color: isMobileMenuOpen ? 'white' : (isHomePage && !isPastHero ? 'white' : '#111827'),
            backgroundColor: isMobileMenuOpen ? 'transparent' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (isMobileMenuOpen || (isHomePage && !isPastHero)) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            } else {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileMenuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      )}

      {/* Mobile Menu Overlay - Dark background when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] max-[525px]:block hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Bar - Desktop: Can hide/show, Mobile: Always visible when menu is open */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } bg-transparent`}
      >
        {/* Desktop Navigation - Hidden on mobile (< 525px) */}
        <div className="hidden min-[525px]:flex items-center justify-center px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8">
          <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isNavbarBlack = isHomePage ? isPastHero : true;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link relative font-medium text-sm sm:text-base md:text-lg transition-colors duration-200 ${
                    isNavbarBlack
                      ? "text-gray-900 hover:text-gray-700"
                      : "text-white hover:text-gray-200"
                  }`}
                >
                  {link.label}
                  <span
                    className={`nav-underline absolute bottom-0 left-0 h-0.5 ${
                      isNavbarBlack ? "bg-gray-900" : "bg-white"
                    } ${isActive ? "nav-underline-active" : ""}`}
                  />
                </Link>
              );
            })}
            {/* Cart Icon */}
            <Link
              href="/cart"
              className={`relative p-2 rounded-lg transition-colors duration-200 ${
                isHomePage && !isPastHero
                  ? "text-white hover:bg-white/10"
                  : "text-gray-900 hover:bg-gray-100"
              } ${isCartAnimating ? "animate-cart-bounce" : ""}`}
              aria-label="Carrito de compras"
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                    isHomePage && !isPastHero
                      ? "bg-white text-gray-900"
                      : "bg-gray-900 text-white"
                  } ${isCartAnimating ? "animate-badge-pop" : ""}`}
                >
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu - Only visible on screens < 525px, rendered outside nav to avoid DOM issues */}
      <div
        className={`max-[525px]:block hidden fixed top-0 left-0 right-0 bg-black shadow-lg transition-transform duration-300 ease-in-out z-[60] ${
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ paddingTop: "80px" }}
      >
        <div className="flex flex-col px-4 py-6 space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`nav-link relative font-medium text-base py-2 transition-colors duration-200 ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="nav-underline absolute bottom-0 left-0 h-0.5 bg-white nav-underline-active" />
                )}
              </Link>
            );
          })}
          {/* Mobile Cart Link */}
          <Link
            href="/cart"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`nav-link relative font-medium text-base py-2 transition-colors duration-200 flex items-center gap-2 ${
              pathname === "/cart"
                ? "text-white font-semibold"
                : "text-gray-300 hover:text-white"
            }`}
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Carrito
            {cartItemCount > 0 && (
              <span className="ml-auto bg-white text-gray-900 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}

