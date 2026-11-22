import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { TooltipProvider } from "@meridian/ui";

export const metadata: Metadata = {
  title: "Meridian | Geospatial Intelligence Platform",
  description: "High-performance geospatial infrastructure, observations, and spatial routing.",
};

// Anti-flash inline script to prevent light/dark FOUC before React hydrations
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('meridian-theme');
    var isDark = stored === 'dark' || (!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased min-h-screen bg-[var(--color-level0)] text-[var(--color-text-primary)]">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
