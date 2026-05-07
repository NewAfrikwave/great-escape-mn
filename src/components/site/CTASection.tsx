"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Waves, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf8f0] relative overflow-hidden">
      {/* Decorative wave pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 1440 600" fill="none">
          <path
            d="M0,300 C240,200 480,400 720,300 C960,200 1200,400 1440,300 L1440,600 L0,600 Z"
            fill="#1a2744"
          />
          <path
            d="M0,350 C240,250 480,450 720,350 C960,250 1200,450 1440,350 L1440,600 L0,600 Z"
            fill="#2d5a3d"
          />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#c8993e]/10 border border-[#c8993e]/20 rounded-full px-4 py-1.5 text-[#c8993e] text-sm font-medium mb-6">
            <Waves className="h-4 w-4" />
            Ready?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a2744] mb-6 leading-tight">
            Ready to Book Your Lake Escape?
          </h2>
          <p className="text-lg text-[#2a3d64]/60 mb-10 max-w-2xl mx-auto">
            Submit a booking request and our team will confirm availability,
            pricing, and all the details for your perfect day on the water.
          </p>
          <Link href="#booking">
            <Button
              size="lg"
              className="bg-[#c8993e] hover:bg-[#b8892e] text-white font-semibold text-lg px-10 py-6 shadow-xl shadow-[#c8993e]/25 transition-all hover:scale-105 gap-2"
            >
              Start Booking Request
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
