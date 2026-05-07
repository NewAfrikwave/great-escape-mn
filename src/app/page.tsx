"use client";

import { Suspense } from "react";
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

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
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
