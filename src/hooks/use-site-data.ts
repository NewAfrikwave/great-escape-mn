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
      if (data) setPackages(data);
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
