import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";

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
    description: "Fotografía de arte fino de alta resolución, impresión profesional, enmarcado y servicios de instalación. Imprenta especializada en arte en Chile, impresión fine art, enramado y marcos personalizados en Santiago.",
  keywords: [
    "fine art",
    "arte",
    "arts",
    "imprenta",
    "imprenta chile",
    "imprenta santiago",
    "imprenta profesional chile",
    "imprenta arte chile",
    "impresión",
    "impresión chile",
    "impresión santiago",
    "impresión profesional chile",
    "impresión fine art chile",
    "impresion",
    "enramado",
    "enramado chile",
    "enramado santiago",
    "enmarcado",
    "enmarcado chile",
    "enmarcado santiago",
    "enmarcado profesional chile",
    "marcos",
    "marcos chile",
    "marcos personalizados chile",
    "fotografía artística",
    "fotografía artística chile",
    "arte fino",
    "impresión profesional",
    "enmarcado profesional",
    "impresión fine art",
    "arte decorativo",
    "arte decorativo chile",
    "fotografía de alta resolución",
    "impresión en canvas",
    "impresión canvas chile",
    "marcos personalizados",
    "arte para decoración",
    "impresión museo",
    "impresión museo chile",
    "imprenta fine art",
    "imprenta fine art chile",
    "servicios imprenta chile",
    "impresión profesional santiago",
  ],
  authors: [{ name: "STGO Fine Art" }],
  creator: "STGO Fine Art",
  publisher: "STGO Fine Art",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://stgofineart.com"),
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
    description: "Fotografía de arte fino de alta resolución, impresión profesional, enmarcado y servicios de instalación. Imprenta especializada en arte en Chile.",
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
    description: "Fotografía de arte fino de alta resolución, impresión profesional, enmarcado y servicios de instalación. Imprenta especializada en arte en Chile.",
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
      { url: "/favicons/favicon.ico", sizes: "any" },
      { url: "/favicons/favicon.svg", type: "image/svg+xml" },
      { url: "/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: ["/favicons/favicon.ico"],
    apple: [{ url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/favicons/site.webmanifest",
  other: {
    "msapplication-TileColor": "#000",
    "apple-mobile-web-app-title": "Fine Art",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stgofineart.com";
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "STGO Fine Art",
    "url": siteUrl,
    "logo": `${siteUrl}/images/logowhite.webp`,
    "description": "Fotografía de arte fino de alta resolución, impresión profesional, enmarcado y servicios de instalación. Imprenta especializada en arte en Chile.",
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Colección",
        "item": `${siteUrl}/collection`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Enmarcado",
        "item": `${siteUrl}/framing`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Contacto",
        "item": `${siteUrl}/contact`
      }
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}#organization`,
    "name": "STGO Fine Art",
    "image": `${siteUrl}/images/heroimg.jpg`,
    "description": "Servicios profesionales de impresión fine art, enmarcado y fotografía artística de alta resolución en Chile. Imprenta profesional en Santiago.",
    "url": siteUrl,
    "telephone": "",
    "priceRange": "CLP",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CL",
      "addressLocality": "Santiago"
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
            "description": "Impresión profesional de arte de alta calidad en Chile. Imprenta especializada en fine art, canvas y papel museo.",
            "serviceType": "Impresión Fine Art",
            "areaServed": {
              "@type": "Country",
              "name": "Chile"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Enmarcado Profesional",
            "description": "Servicios de enmarcado y enramado profesional en Santiago, Chile. Marcos personalizados para obras de arte.",
            "serviceType": "Enmarcado Profesional",
            "areaServed": {
              "@type": "Country",
              "name": "Chile"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Fotografía Artística",
            "description": "Fotografía de arte fino de alta resolución. Imprenta de arte decorativo en Chile.",
            "serviceType": "Fotografía Artística",
            "areaServed": {
              "@type": "Country",
              "name": "Chile"
            }
          }
        }
      ]
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Imprenta Profesional Chile",
          "description": "Imprenta especializada en impresión fine art, enmarcado y servicios de arte en Santiago, Chile"
        }
      }
    ]
  };

  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <meta name="google-site-verification" content="mIo0NeDLvLLvUfX8VxCTai3cOCGfweHzOunnF5NpVaI" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '885597414293879');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=885597414293879&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WPL6ZHNZ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

