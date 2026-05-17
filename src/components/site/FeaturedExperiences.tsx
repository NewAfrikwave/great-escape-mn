"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Sunset,
  Users,
  Fish,
  Sparkles,
  Leaf,
  Compass,
  Clock,
  ArrowRight,
} from "lucide-react";
import { usePackages } from "@/hooks/use-site-data";

const iconMap: Record<string, React.ElementType> = {
  sunset: Sunset,
  users: Users,
  fish: Fish,
  sparkles: Sparkles,
  leaf: Leaf,
  compass: Compass,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturedExperiences() {
  const { packages, loading } = usePackages();
  const homepagePackages = packages.filter((p) => p.showOnHomepage);
  const activePackages = packages.filter((p) => p.isActive);
  const featured =
    homepagePackages.length > 0 ? homepagePackages : activePackages;

  return (
    <section id="experiences" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#2d5a3d]/10 border border-[#2d5a3d]/20 rounded-full px-4 py-1.5 text-[#2d5a3d] text-sm font-medium mb-4">
              Our Experiences
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2744] mb-4">
              Find Your Perfect Lake Experience
            </h2>
            <p className="text-lg text-[#2a3d64]/60 max-w-2xl mx-auto">
              From romantic sunset cruises to fishing trips and bachelorette
              celebrations — there&apos;s something for everyone on the water.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {(loading ? [] : featured.slice(0, 6)).map((pkg) => {
            const Icon = iconMap[pkg.icon] || Compass;

            return (
              <motion.div key={pkg.id} variants={cardVariants}>
                <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
                  <div className="relative h-52 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: `url(${pkg.imageUrl || "/images/custom-cruise.png"})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-[#1a2744]">
                      <Clock className="h-3 w-3" />
                      {pkg.duration}
                    </div>
                    <div className="absolute top-3 right-3 bg-[#c8993e] text-white rounded-full p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold text-[#1a2744] mb-2">
                      {pkg.title}
                    </h3>
                    <p className="text-sm text-[#2a3d64]/60 mb-4 line-clamp-2">
                      {pkg.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#c8993e]">
                        {pkg.startingPrice || "Request pricing"}
                      </span>
                      <Link href={`#booking?package=${pkg.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#1a2744] hover:text-[#c8993e] hover:bg-[#c8993e]/10 gap-1 font-medium"
                        >
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
