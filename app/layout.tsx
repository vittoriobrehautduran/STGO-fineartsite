import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "STGO Fine Art | Impresión y Enmarcado Profesional de Arte",
    template: "%s | STGO Fine Art",
  },
  description: "Fotografía de arte fino de alta resolución, impresión profesional, enmarcado y servicios de instalación. Imprenta especializada en arte, impresión fine art, enramado y marcos personalizados.",
  keywords: [
    "fine art",
    "arte",
    "arts",
    "imprenta",
    "impresión",
    "impresion",
    "enramado",
    "enmarcado",
    "marcos",
    "fotografía artística",
    "arte fino",
    "impresión profesional",
    "enmarcado profesional",
    "impresión fine art",
    "arte decorativo",
    "fotografía de alta resolución",
    "impresión en canvas",
    "marcos personalizados",
    "arte para decoración",
    "impresión museo",
  ],
  authors: [{ name: "STGO Fine Art" }],
  creator: "STGO Fine Art",
  publisher: "STGO Fine Art",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://stgofineart.netlify.app"),
  alternates: {
    canonical: "/",
    languages: {
      "es": "/",
      "en": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "STGO Fine Art",
    title: "STGO Fine Art | Impresión y Enmarcado Profesional de Arte",
    description: "Fotografía de arte fino de alta resolución, impresión profesional, enmarcado y servicios de instalación. Imprenta especializada en arte.",
    images: [
      {
        url: "/images/heroimg.jpg",
        width: 1200,
        height: 630,
        alt: "STGO Fine Art - Impresión y Enmarcado Profesional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "STGO Fine Art | Impresión y Enmarcado Profesional de Arte",
    description: "Fotografía de arte fino de alta resolución, impresión profesional, enmarcado y servicios de instalación.",
    images: ["/images/heroimg.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicons/android-chrome-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/favicons/android-chrome-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon-57x57.webp", sizes: "57x57", type: "image/webp" },
      { url: "/favicons/apple-touch-icon-60x60.webp", sizes: "60x60", type: "image/webp" },
      { url: "/favicons/apple-touch-icon-72x72.webp", sizes: "72x72", type: "image/webp" },
      { url: "/favicons/apple-touch-icon-76x76.webp", sizes: "76x76", type: "image/webp" },
      { url: "/favicons/apple-touch-icon-114x114.webp", sizes: "114x114", type: "image/webp" },
      { url: "/favicons/apple-touch-icon-120x120.webp", sizes: "120x120", type: "image/webp" },
      { url: "/favicons/apple-touch-icon-144x144.webp", sizes: "144x144", type: "image/webp" },
      { url: "/favicons/apple-touch-icon-152x152.webp", sizes: "152x152", type: "image/webp" },
      { url: "/favicons/apple-touch-icon-167x167.webp", sizes: "167x167", type: "image/webp" },
      { url: "/favicons/apple-touch-icon-180x180.webp", sizes: "180x180", type: "image/webp" },
      { url: "/favicons/apple-touch-icon-1024x1024.webp", sizes: "1024x1024", type: "image/webp" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/favicons/apple-touch-icon-precomposed.webp",
      },
    ],
  },
  manifest: "/favicons/manifest.webmanifest",
  other: {
    "msapplication-TileColor": "#000",
    "msapplication-TileImage": "/favicons/mstile-144x144.webp",
    "msapplication-config": "/favicons/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stgofineart.netlify.app";
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "STGO Fine Art",
    "url": siteUrl,
    "logo": `${siteUrl}/images/logowhite.png`,
    "description": "Fotografía de arte fino de alta resolución, impresión profesional, enmarcado y servicios de instalación",
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Spanish", "English"]
    },
    "areaServed": {
      "@type": "Country",
      "name": "Chile"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}#organization`,
    "name": "STGO Fine Art",
    "image": `${siteUrl}/images/heroimg.jpg`,
    "description": "Servicios profesionales de impresión fine art, enmarcado y fotografía artística de alta resolución",
    "url": siteUrl,
    "telephone": "",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CL"
    },
    "geo": {
      "@type": "GeoCoordinates"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ]
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servicios de Arte",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Impresión Fine Art",
            "description": "Impresión profesional de arte de alta calidad"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Enmarcado Profesional",
            "description": "Servicios de enmarcado y enramado profesional"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Fotografía Artística",
            "description": "Fotografía de arte fino de alta resolución"
          }
        }
      ]
    }
  };

  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

