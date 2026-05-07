"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useGallery } from "@/hooks/use-site-data";
import type { GalleryImageData } from "@/hooks/use-site-data";

const galleryCategories = [
  "All",
  "Sunset Cruises",
  "Family Lake Days",
  "Fishing Trips",
  "Celebrations",
  "Fall Colors",
  "Pontoon Boat",
];

export function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { images: dbImages, loading } = useGallery(
    activeCategory === "All" ? undefined : activeCategory
  );

  // Fallback to static data if database is empty and not loading
  const [staticImages] = useState<GalleryImageData[]>([]);
  const images = dbImages.length > 0 ? dbImages : staticImages;

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#2d5a3d]/10 border border-[#2d5a3d]/20 rounded-full px-4 py-1.5 text-[#2d5a3d] text-sm font-medium mb-4">
              Gallery
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2744] mb-4">
              Moments on the Water
            </h2>
            <p className="text-lg text-[#2a3d64]/60 max-w-2xl mx-auto">
              A glimpse into the beautiful experiences waiting for you on
              Minnesota&apos;s lakes.
            </p>
          </motion.div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {galleryCategories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className={
                activeCategory === cat
                  ? "bg-[#1a2744] hover:bg-[#2a3d64] text-white"
                  : "border-[#1a2744]/15 text-[#1a2744]/60 hover:bg-[#1a2744]/5"
              }
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Image Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative group cursor-pointer overflow-hidden rounded-xl aspect-[4/3]"
                  onClick={() => setSelectedImage(img.imageUrl)}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url(${img.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2 text-center">
                      {img.altText}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={selectedImage}
                alt="Gallery image"
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
