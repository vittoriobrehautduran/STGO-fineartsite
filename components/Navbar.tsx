"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isBrightBackground, setIsBrightBackground] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHomePage = pathname === "/";
  const isCollectionPage = pathname === "/collection";

  // Function to detect background brightness at logo position
  const checkBackgroundBrightness = useCallback(() => {
    try {
      // Logo is fixed at top-left corner
      const logoX = 20;
      const logoY = 20;
      
      let backgroundColor = '';
      
      // Create a temporary element to check what's behind the logo
      // Temporarily hide logo to see what's behind it
      const logoLink = document.querySelector('a[href="/"]');
      const logoLinkElement = logoLink as HTMLElement;
      const originalDisplay = logoLinkElement?.style.display;
      
      if (logoLinkElement) {
        logoLinkElement.style.display = 'none';
      }
      
      // Get element at logo position
      const elementAtPoint = document.elementFromPoint(logoX, logoY);
      
      // Restore logo visibility
      if (logoLinkElement) {
        logoLinkElement.style.display = originalDisplay || '';
      }
      
      if (elementAtPoint) {
        let current: HTMLElement | null = elementAtPoint as HTMLElement;
        
        // Walk up the DOM tree to find an element with a background color
        let depth = 0;
        while (current && depth < 10) {
          const style = window.getComputedStyle(current);
          const bg = style.backgroundColor;
          
          // Check if this element has a non-transparent background
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            // Check if it's actually a color (not just default)
            const rgbMatch = bg.match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
              backgroundColor = bg;
              break;
            }
          }
          
          // Check background color classes
          const classList = current.classList;
          if (classList) {
            const classString = classList.toString();
            // Check for common background color classes
            if (classString.includes('bg-white') || classString.includes('bg-gray-50') || 
                classString.includes('bg-stone-50') || classString.includes('bg-gray-100') ||
                classString.includes('bg-gray-200')) {
              backgroundColor = 'rgb(255, 255, 255)'; // White or light
              break;
            }
            if (classString.includes('bg-black') || classString.includes('bg-gray-900')) {
              backgroundColor = 'rgb(0, 0, 0)'; // Black or dark
              break;
            }
          }
          
          current = current.parentElement;
          depth++;
        }
      }
      
      // Fallback: check all sections to see which one contains the logo position
      if (!backgroundColor || backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        const sections = document.querySelectorAll('section, main');
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          // Check if logo position (in viewport) is within this section
          if (logoX >= rect.left && logoX <= rect.right && 
              logoY >= rect.top && logoY <= rect.bottom) {
            const sectionStyle = window.getComputedStyle(section as HTMLElement);
            const sectionBg = sectionStyle.backgroundColor;
            const classList = (section as HTMLElement).classList;
            
            // Check background color
            if (sectionBg && sectionBg !== 'rgba(0, 0, 0, 0)' && sectionBg !== 'transparent') {
              const rgbMatch = sectionBg.match(/\d+/g);
              if (rgbMatch && rgbMatch.length >= 3) {
                backgroundColor = sectionBg;
              }
            }
            
            // Check for background classes
            if (classList) {
              const classString = classList.toString();
              if (classString.includes('bg-white') || classString.includes('bg-gray-50') || 
                  classString.includes('bg-stone-50') || classString.includes('bg-gray-100') ||
                  classString.includes('bg-gray-200')) {
                backgroundColor = 'rgb(255, 255, 255)';
              } else if (classString.includes('bg-black') || classString.includes('bg-gray-900')) {
                backgroundColor = 'rgb(0, 0, 0)';
              }
            }
          }
        });
      }
      
      // Final fallback: check body background
      if (!backgroundColor || backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        const bodyStyle = window.getComputedStyle(document.body);
        const bodyBg = bodyStyle.backgroundColor;
        if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
          backgroundColor = bodyBg;
        }
      }

      // Parse RGB values
      const rgbMatch = backgroundColor.match(/\d+/g);
      if (!rgbMatch || rgbMatch.length < 3) {
        // Default to dark background if can't detect
        setIsBrightBackground(false);
        return;
      }

      const r = parseInt(rgbMatch[0]);
      const g = parseInt(rgbMatch[1]);
      const b = parseInt(rgbMatch[2]);
      
      // Calculate brightness using relative luminance formula
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      // Consider background bright if luminance > 0.4 (lowered threshold for better detection)
      const isBright = luminance > 0.4;
      setIsBrightBackground(isBright);
    } catch (error) {
      console.error('Error checking background brightness:', error);
      // Default to dark on error
      setIsBrightBackground(false);
    }
  }, []);

  useEffect(() => {
    // Check background on initial load with multiple attempts
    const checkInitial = () => {
      // Multiple checks to ensure it works after page loads
      setTimeout(() => checkBackgroundBrightness(), 100);
      setTimeout(() => checkBackgroundBrightness(), 500);
      setTimeout(() => checkBackgroundBrightness(), 1000);
    };
    checkInitial();

    // Throttle function for scroll events
    let ticking = false;
    const throttledCheck = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkBackgroundBrightness();
          ticking = false;
        });
        ticking = true;
      }
    };

    if (isCollectionPage) {
      // Collection page: hide when scrolled down, show only at top
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 100) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
        throttledCheck();
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    } else if (isHomePage) {
      // Homepage: hide only when Featured Collection section is in view
      const handleScroll = () => {
        const featuredSection = document.querySelector(
          'section[data-section="featured-collection"]'
        );

        if (!featuredSection) {
          setIsVisible(true);
          throttledCheck();
          return;
        }

        const sectionTop = featuredSection.getBoundingClientRect().top;
        const sectionBottom = featuredSection.getBoundingClientRect().bottom;
        const viewportHeight = window.innerHeight;

        // Show navbar at top or when section is not in view
        if (window.scrollY < 100) {
          setIsVisible(true);
        } else if (sectionTop < viewportHeight * 0.8 && sectionBottom > 0) {
          // Hide when Featured Collection section is in view
          setIsVisible(false);
        } else {
          // Show when past the section
          setIsVisible(true);
        }
        throttledCheck();
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Check initial state
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      // Other pages: always visible
      setIsVisible(true);
      const handleScroll = () => {
        throttledCheck();
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      checkBackgroundBrightness();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isHomePage, isCollectionPage, checkBackgroundBrightness]);

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
      {/* Logo - Always visible, separate from navbar */}
      <Link
        href="/"
        className="fixed top-1 sm:top-2 md:top-2 left-1 sm:left-2 md:left-2 z-[60] flex-shrink-0"
      >
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20">
          <Image
            src={isBrightBackground ? "/images/logoblack.png" : "/images/logowhite.png"}
            alt="STGO Fine Art Logo"
            fill
            className="object-contain transition-opacity duration-300"
            priority
          />
        </div>
      </Link>

      {/* Mobile Menu Button - Only visible on screens < 525px and when navbar is visible */}
      {isVisible && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 right-4 z-[70] max-[525px]:block hidden p-2 rounded-lg transition-colors duration-200 text-white hover:bg-white/10"
          style={{
            color: isHomePage ? 'white' : '#111827',
            backgroundColor: isHomePage ? 'transparent' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (isHomePage) {
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
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Desktop Navigation - Hidden on mobile (< 525px) */}
        <div className="hidden min-[525px]:flex items-center justify-center px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8">
          <div className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link relative font-medium text-sm sm:text-base md:text-lg transition-colors duration-200 ${
                    isHomePage
                      ? "text-white hover:text-gray-200"
                      : "text-gray-900 hover:text-gray-700"
                  }`}
                >
                  {link.label}
                  <span
                    className={`nav-underline absolute bottom-0 left-0 h-0.5 ${
                      isHomePage ? "bg-white" : "bg-gray-900"
                    } ${isActive ? "nav-underline-active" : ""}`}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu - Only visible on screens < 525px, rendered outside nav to avoid DOM issues */}
      <div
        className={`max-[525px]:block hidden fixed top-0 left-0 right-0 bg-white shadow-lg transition-transform duration-300 ease-in-out z-[60] ${
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
                    ? "text-gray-900 font-semibold"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="nav-underline absolute bottom-0 left-0 h-0.5 bg-gray-900 nav-underline-active" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

