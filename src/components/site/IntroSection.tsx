"use client";

import { motion } from "framer-motion";

export function IntroSection() {
  return (
    <section
      id="intro"
      className="py-20 sm:py-28 bg-[#faf8f0]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#c8993e]/10 border border-[#c8993e]/20 rounded-full px-4 py-1.5 text-[#c8993e] text-sm font-medium mb-6">
            Welcome to Great Escape MN
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2744] mb-6 leading-tight">
            Your Private Lake Experience Awaits
          </h2>
          <p className="text-lg text-[#2a3d64]/70 leading-relaxed max-w-3xl mx-auto">
            Great Escape MN offers private lake experiences designed for couples,
            families, friends, and small groups. Whether you are celebrating love,
            planning a birthday, enjoying a family day, fishing with friends, or
            just escaping for a peaceful sunset ride — we help create a simple,
            memorable, and beautiful experience on the water.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
