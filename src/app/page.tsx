"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { IntroSection } from "@/components/site/IntroSection";
import { FeaturedExperiences } from "@/components/site/FeaturedExperiences";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { CTASection } from "@/components/site/CTASection";
import { PackageGrid } from "@/components/site/PackageGrid";
import { BookingForm } from "@/components/site/BookingForm";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { AboutSection } from "@/components/site/AboutSection";
import { FAQAccordion } from "@/components/site/FAQAccordion";
import { ContactSection } from "@/components/site/ContactSection";
import { Footer } from "@/components/site/Footer";
import { CheckCircle2, XCircle } from "lucide-react";

function PaymentBanner() {
  const searchParams = useSearchParams();
  const paymentParam = searchParams.get("payment");
  const [show, setShow] = useState(!!paymentParam);

  const type: "success" | "cancelled" | "error" | null =
    paymentParam === "success"
      ? "success"
      : paymentParam === "cancelled"
        ? "cancelled"
        : paymentParam === "error"
          ? "error"
          : null;

  useEffect(() => {
    if (paymentParam) {
      const timer = setTimeout(() => setShow(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [paymentParam]);

  if (!show || !type) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      bg: "bg-[#2d5a3d]",
      title: "Payment Successful!",
      message: "Your payment has been processed. We'll send you a confirmation email shortly.",
    },
    cancelled: {
      icon: XCircle,
      bg: "bg-[#c8993e]",
      title: "Payment Cancelled",
      message: "Your payment was cancelled. You can try again anytime from your booking confirmation.",
    },
    error: {
      icon: XCircle,
      bg: "bg-red-600",
      title: "Payment Error",
      message: "Something went wrong with your payment. Please contact us for assistance.",
    },
  };

  const { icon: Icon, bg, title, message } = config[type];

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] ${bg} text-white py-4 px-4 shadow-lg`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-white/80">{message}</p>
          </div>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-white/80 hover:text-white text-lg font-bold ml-4"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <PaymentBanner />
      </Suspense>
      <Header />
      <main className="flex-1">
        <Hero />
        <IntroSection />
        <FeaturedExperiences />
        <WhyChooseUs />
        <CTASection />
        <PackageGrid />
        <BookingFormWrapper />
        <GalleryGrid />
        <AboutSection />
        <FAQAccordion />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

// BookingForm uses useSearchParams which requires Suspense
function BookingFormWrapper() {
  return (
    <Suspense fallback={<BookingFormFallback />}>
      <BookingForm />
    </Suspense>
  );
}

function BookingFormFallback() {
  return (
    <section id="booking" className="py-20 sm:py-28 bg-[#faf8f0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2744] mb-4">
            Request a Booking
          </h2>
          <p className="text-lg text-[#2a3d64]/60">
            Loading booking form...
          </p>
        </div>
      </div>
    </section>
  );
}
