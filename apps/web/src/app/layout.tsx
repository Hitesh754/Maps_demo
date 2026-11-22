import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meridian | Geospatial Intelligence Platform",
  description: "High-performance geospatial infrastructure, observations, and spatial routing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
