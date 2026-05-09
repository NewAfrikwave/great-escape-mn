"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Anchor,
  Users,
  Fish,
  Wine,
  MapPin,
  Sparkles,
  ChevronDown,
} from "lucide-react";

const badges = [
  { icon: Anchor, label: "Private Captain-Led Cruises" },
  { icon: Users, label: "Up to 6 Passengers" },
  { icon: Fish, label: "Fishing Ready Pontoon" },
  { icon: Wine, label: "BYOB Friendly" },
  { icon: MapPin, label: "Multiple Minnesota Lakes" },
  { icon: Sparkles, label: "Custom Group Experiences" },
];

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/images/hero-sunset-cruise.png)" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16">
        <div className="mb-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white/90 text-sm">
          <Anchor className="h-4 w-4 text-[#e8c878]" />
          <span>Great Escape MN Private Lake Experiences</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
          Private Lake Cruises &{" "}
          <span className="text-[#e8c878]">Pontoon Experiences</span> in
          Minnesota
        </h1>

        <p className="text-lg sm:text-xl text-white/85 max-w-3xl mx-auto mb-10 leading-relaxed">
          Create unforgettable memories on the water with private sunset cruises,
          family lake days, fishing trips, bachelorette rides, and custom group
          experiences.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="#booking">
            <Button
              size="lg"
              className="bg-[#c8993e] hover:bg-[#b8892e] text-white font-semibold text-lg px-8 py-6 shadow-xl shadow-[#c8993e]/30 transition-all hover:scale-105"
            >
              Book Your Getaway
            </Button>
          </Link>
          <Link href="#experiences">
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 backdrop-blur-sm transition-all"
            >
              View Packages
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-4 text-center"
            >
              <badge.icon className="h-5 w-5 text-[#e8c878]" />
              <span className="text-xs sm:text-sm text-white/90 font-medium leading-tight">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <Link href="#intro">
          <ChevronDown className="h-8 w-8 text-white/60" />
        </Link>
      </div>
    </section>
  );
}
