import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STGO Fine Art",
  description: "High resolution fine art photography with framing and installation services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

