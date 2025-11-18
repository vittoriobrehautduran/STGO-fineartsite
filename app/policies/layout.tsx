import type { Metadata } from "next";

// Prevent policies page from being indexed by search engines
export const metadata: Metadata = {
  robots: {
    noindex: true,
    nofollow: true,
  },
};

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

