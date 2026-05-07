import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://greatescapemn.com"),
  title:
    "Great Escape MN | Private Boat Cruises & Pontoon Experiences in Minnesota",
  description:
    "Book private captain-led pontoon cruises, sunset rides, family lake days, fishing trips, and bachelorette boat experiences across Minnesota lakes. Prior Lake, Lake Minnetonka, and more.",
  keywords: [
    "Minnesota boat cruise",
    "Minnesota pontoon rental with captain",
    "Sunset cruise Minnesota",
    "Private lake cruise Minnesota",
    "Lake Minnetonka boat cruise",
    "Prior Lake boat rental",
    "Bachelorette boat cruise Minnesota",
    "Family boat ride Minnesota",
    "Fishing pontoon Minnesota",
    "Great Escape MN",
    "pontoon cruise Minnesota",
    "lake cruise near me",
  ],
  authors: [{ name: "Great Escape MN" }],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    title:
      "Great Escape MN | Private Boat Cruises & Pontoon Experiences in Minnesota",
    description:
      "Book private captain-led pontoon cruises, sunset rides, family lake days, fishing trips, and bachelorette boat experiences across Minnesota lakes.",
    url: "https://greatescapemn.com",
    siteName: "Great Escape MN",
    type: "website",
    images: [
      {
        url: "/images/hero-sunset-cruise.png",
        width: 1344,
        height: 768,
        alt: "Great Escape MN - Private Pontoon Cruise on Minnesota Lake at Sunset",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Great Escape MN | Private Boat Cruises & Pontoon Experiences in Minnesota",
    description:
      "Book private captain-led pontoon cruises, sunset rides, family lake days, fishing trips, and bachelorette boat experiences across Minnesota lakes.",
    images: ["/images/hero-sunset-cruise.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
