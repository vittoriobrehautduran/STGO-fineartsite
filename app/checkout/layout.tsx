import type { Metadata } from "next";

// Prevent checkout page from being indexed by search engines
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noindex: true,
    nofollow: true,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

