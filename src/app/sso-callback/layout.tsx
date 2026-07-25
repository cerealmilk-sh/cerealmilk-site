import type { Metadata } from "next";

// The page is a client component ("use client"), so its robots directive
// lives here: an OAuth trampoline must never appear in a search index.
export const metadata: Metadata = {
  title: "Signing you in",
  robots: { index: false, follow: false },
};

export default function SsoCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
