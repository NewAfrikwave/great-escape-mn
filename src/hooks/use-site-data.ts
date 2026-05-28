"use client";

import { useState, useEffect } from "react";

interface PackageData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  duration: string;
  capacity: string;
  startingPrice: string | null;
  priceLabel: string | null;
  priceType: string;
  isPriceVisible: boolean;
  isFeatured: boolean;
  isActive: boolean;
  showOnHomepage: boolean;
  showOnExperiencesPage: boolean;
  imageUrl: string | null;
  icon: string;
  ctaLabel: string;
  sortOrder: number;
  includedItems: string;
  highlights: string;
  optionalAddOns: string;
}

const fallbackPackages: PackageData[] = [
  {
    id: "fallback-fishing-trip",
    title: "Fishing With the Guys / Gals",
    slug: "fishing-trip",
    shortDescription:
      "A four-hour fishing-ready pontoon trip with Sunday and Monday windows.",
    fullDescription:
      "A four-hour fishing-ready pontoon trip with Sunday and Monday windows.",
    duration: "4 hours",
    capacity: "Up to 6 passengers",
    startingPrice: "$400+",
    priceLabel: "Sun/Mon windows",
    priceType: "starting_at",
    isPriceVisible: true,
    isFeatured: true,
    isActive: true,
    showOnHomepage: true,
    showOnExperiencesPage: true,
    imageUrl: "/images/fishing-trip.png",
    icon: "fish",
    ctaLabel: "Book Fishing Trip",
    sortOrder: 0,
    includedItems: JSON.stringify([
      "Captain included",
      "Fishing-ready pontoon",
      "Sunday 8-12 or 1-5",
      "Monday 8-12 or 1-5",
    ]),
    highlights: JSON.stringify(["$400 and up", "4 hours", "Up to 6 passengers"]),
    optionalAddOns: JSON.stringify(["Extra fishing time", "Multiple lakes"]),
  },
  {
    id: "fallback-parties-events",
    title: "Parties & Events",
    slug: "parties-events",
    shortDescription:
      "A private event cruise for birthdays, bridal groups, celebrations, and special moments.",
    fullDescription:
      "A private event cruise for birthdays, bridal groups, celebrations, and special moments.",
    duration: "4 hours",
    capacity: "Up to 6 passengers",
    startingPrice: "$425",
    priceLabel: "Sun/Mon windows",
    priceType: "fixed",
    isPriceVisible: true,
    isFeatured: true,
    isActive: true,
    showOnHomepage: true,
    showOnExperiencesPage: true,
    imageUrl: "/images/bachelorette-cruise.png",
    icon: "sparkles",
    ctaLabel: "Book Party or Event",
    sortOrder: 1,
    includedItems: JSON.stringify([
      "Captain included",
      "Private pontoon experience",
      "Sunday 8-12 or 1-5",
      "Monday 1-5",
    ]),
    highlights: JSON.stringify(["$425 flat package", "4 hours", "Up to 6 passengers"]),
    optionalAddOns: JSON.stringify(["Decorations", "Extended time", "Custom playlist"]),
  },
  {
    id: "fallback-sunset-cruise",
    title: "Sunset Cruise",
    slug: "sunset-cruise",
    shortDescription:
      "A private golden-hour cruise available Monday, Tuesday, Saturday, and Sunday.",
    fullDescription:
      "A private golden-hour cruise available Monday, Tuesday, Saturday, and Sunday.",
    duration: "6:00 PM - 8:30 PM",
    capacity: "Up to 6 passengers",
    startingPrice: "$100/person",
    priceLabel: "Mon, Tue, Sat, Sun",
    priceType: "per_person",
    isPriceVisible: true,
    isFeatured: true,
    isActive: true,
    showOnHomepage: true,
    showOnExperiencesPage: true,
    imageUrl: "/images/sunset-cruise.png",
    icon: "sunset",
    ctaLabel: "Book Sunset Cruise",
    sortOrder: 2,
    includedItems: JSON.stringify([
      "Captain included",
      "Private sunset cruise",
      "Monday, Tuesday, Saturday, and Sunday",
      "6:00 PM - 8:30 PM",
    ]),
    highlights: JSON.stringify([
      "$100 per person",
      "Golden-hour views",
      "Up to 6 passengers",
    ]),
    optionalAddOns: JSON.stringify(["Decorations", "Cooler setup", "Custom music"]),
  },
];

interface LakeData {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  region: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface FAQData {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

interface GalleryImageData {
  id: string;
  title: string;
  altText: string;
  caption: string | null;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface TestimonialData {
  id: string;
  customerName: string;
  customerTitleOrLocation: string | null;
  rating: number;
  quote: string;
  experienceType: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface BusinessInfoData {
  id: string;
  businessName: string;
  brandSubtitle: string;
  email: string;
  phone: string;
  alternatePhone: string | null;
  address: string | null;
  serviceAreaDescription: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  googleBusinessUrl: string | null;
  footerDescription: string | null;
  copyrightText: string | null;
}

interface SiteSettings {
  [key: string]: string | null;
}

interface PageContentData {
  [key: string]: { title: string | null; content: string | null };
}

async function fetchApi<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function usePackages() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<PackageData[]>("/api/public/packages").then((data) => {
      setPackages(data && data.length > 0 ? data : fallbackPackages);
      setLoading(false);
    });
  }, []);

  return { packages, loading };
}

export function useLakes() {
  const [lakes, setLakes] = useState<LakeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<LakeData[]>("/api/public/lakes").then((data) => {
      if (data) setLakes(data);
      setLoading(false);
    });
  }, []);

  return { lakes, loading };
}

export function useFAQs() {
  const [faqs, setFaqs] = useState<FAQData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<FAQData[]>("/api/public/faqs").then((data) => {
      if (data) setFaqs(data);
      setLoading(false);
    });
  }, []);

  return { faqs, loading };
}

export function useGallery(category?: string) {
  const [images, setImages] = useState<GalleryImageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = category && category !== "All"
      ? `/api/public/gallery?category=${encodeURIComponent(category)}`
      : "/api/public/gallery";
    fetchApi<GalleryImageData[]>(url).then((data) => {
      if (data) setImages(data);
      setLoading(false);
    });
  }, [category]);

  return { images, loading };
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<TestimonialData[]>("/api/public/testimonials").then((data) => {
      if (data) setTestimonials(data);
      setLoading(false);
    });
  }, []);

  return { testimonials, loading };
}

export function useBusinessInfo() {
  const [info, setInfo] = useState<BusinessInfoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<BusinessInfoData>("/api/public/business-info").then((data) => {
      if (data) setInfo(data);
      setLoading(false);
    });
  }, []);

  return { info, loading };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<SiteSettings>("/api/public/settings").then((data) => {
      if (data) setSettings(data);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}

export function usePageContent() {
  const [content, setContent] = useState<PageContentData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<PageContentData>("/api/public/content").then((data) => {
      if (data) setContent(data);
      setLoading(false);
    });
  }, []);

  return { content, loading };
}

interface PaymentSettingsData {
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  stripePublishableKey: string | null;
  paypalClientId: string | null;
  currency: string;
  depositType: string;
  depositValue: string;
  requireDeposit: boolean;
  allowFullPayment: boolean;
  paymentDescription: string;
}

export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<PaymentSettingsData>("/api/public/payment-settings").then((data) => {
      if (data) setSettings(data);
      setLoading(false);
    });
  }, []);

  return { paymentSettings: settings, loading };
}

export type {
  PackageData,
  LakeData,
  FAQData,
  GalleryImageData,
  TestimonialData,
  BusinessInfoData,
  SiteSettings,
  PageContentData,
  PaymentSettingsData,
};
