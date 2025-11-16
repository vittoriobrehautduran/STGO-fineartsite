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
  title: "STGO Fine Art",
  description: "Fotografía de arte fino de alta resolución con servicios de enmarcado e instalación",
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
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}

