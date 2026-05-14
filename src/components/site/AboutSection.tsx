"use client";

import { motion } from "framer-motion";
import {
  Anchor,
  Ship,
  Fish,
  Wine,
  Users,
  MapPin,
  Shield,
  Heart,
} from "lucide-react";

const highlights = [
  { icon: Ship, label: "Comfortable white & gray pontoon" },
  { icon: Fish, label: "Fishing-ready setup" },
  { icon: Users, label: "Private experiences" },
  { icon: Wine, label: "BYOB welcome" },
  { icon: Users, label: "Up to 6 passengers" },
  { icon: MapPin, label: "Multiple lakes" },
  { icon: Shield, label: "Safety first" },
  { icon: Heart, label: "Unforgettable memories" },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div
                className="aspect-[4/3] bg-cover bg-center"
                style={{
                  backgroundImage: "url(/images/gallery-lake-aerial.png)",
                }}
              />
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-[#1a2744] text-white rounded-2xl p-5 shadow-xl max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Anchor className="h-5 w-5 text-[#e8c878]" />
                <span className="font-bold text-sm">Since Day One</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Helping Minnesotans make beautiful memories on the water.
              </p>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#2d5a3d]/10 border border-[#2d5a3d]/20 rounded-full px-4 py-1.5 text-[#2d5a3d] text-sm font-medium mb-4">
              About Us
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2744] mb-6 leading-tight">
              Your Gateway to Minnesota Lake Memories
            </h2>
            <div className="space-y-4 text-[#2a3d64]/70 leading-relaxed">
              <p>
                A Great Escape was created to give couples, families, friends,
                and small groups an easy way to enjoy Minnesota lakes without the
                stress of owning or operating a boat.
              </p>
              <p>
                Every experience is private, captain-led, and designed around
                comfort, safety, and unforgettable views. Whether you&apos;re
                looking for a romantic sunset cruise, a fun family day, a
                fishing trip with friends, or a special celebration on the water
                — we&apos;re here to make it happen.
              </p>
              <p>
                We know the best routes, the hidden coves, and the perfect
                sunset spots on Prior Lake, Lake Minnetonka, and beyond. Our
                comfortable white and gray pontoon is fishing-ready, BYOB
                friendly, and ready to create the kind of memories that last a
                lifetime.
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center gap-2 text-sm text-[#2a3d64]/70"
                >
                  <h.icon className="h-4 w-4 text-[#c8993e] shrink-0" />
                  <span>{h.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
