"use client";

import { motion } from "framer-motion";
import {
  Ship,
  Armchair,
  Fish,
  Heart,
  Sun,
  Wine,
  MapPin,
} from "lucide-react";

const reasons = [
  {
    icon: Ship,
    title: "Captain-Led Private Experience",
    description:
      "Relax and enjoy while our experienced captain handles the boat. Your ride, your pace, your memories.",
  },
  {
    icon: Armchair,
    title: "Comfortable White & Gray Pontoon",
    description:
      "Our clean, modern pontoon features comfortable seating for up to 6 passengers with plenty of room to stretch out.",
  },
  {
    icon: Fish,
    title: "Fishing-Ready with Rods, Bait & Tackle",
    description:
      "Add fishing gear to your experience. We can have everything ready so you can cast a line and enjoy the lake.",
  },
  {
    icon: Heart,
    title: "Great for Romantic Dates & Celebrations",
    description:
      "Perfect for couples, birthdays, anniversaries, bachelorette parties, and any special occasion on the water.",
  },
  {
    icon: Sun,
    title: "Beautiful Sunset & Golden Hour Views",
    description:
      "Minnesota sunsets from the water are unmatched. Golden hour cruises offer the most breathtaking views.",
  },
  {
    icon: Wine,
    title: "BYOB Welcome — Drinks & Snacks",
    description:
      "Bring your favorite drinks, snacks, and coolers. Make it your own celebration on the lake.",
  },
  {
    icon: MapPin,
    title: "Local Minnesota Lake Knowledge",
    description:
      "We know the best routes, hidden coves, and sunset spots on Prior Lake, Lake Minnetonka, and more.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 sm:py-28 bg-[#1a2744] text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c8993e]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#2d5a3d]/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#c8993e]/20 border border-[#c8993e]/30 rounded-full px-4 py-1.5 text-[#e8c878] text-sm font-medium mb-4">
              Why A Great Escape
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              We make it easy to get on the water and create memories that last a
              lifetime.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="bg-[#c8993e]/20 rounded-xl p-3 w-fit mb-4 group-hover:bg-[#c8993e]/30 transition-colors">
                <reason.icon className="h-6 w-6 text-[#e8c878]" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {reason.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
