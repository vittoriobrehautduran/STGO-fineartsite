"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const isHomePage = pathname === "/";
  const isCollectionPage = pathname === "/collection";

  useEffect(() => {
    if (isCollectionPage) {
      // Collection page: hide when scrolled down, show only at top
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 100) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
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
    { href: "/", label: "Home" },
    { href: "/framing", label: "Framing" },
    { href: "/collection", label: "Collection" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center justify-center pt-4 sm:pt-6 md:pt-8">
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
  );
}

