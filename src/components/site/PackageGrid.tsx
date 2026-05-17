"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Sunset,
  Users,
  Fish,
  Sparkles,
  Leaf,
  Compass,
  Clock,
  Check,
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
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function PackageGrid() {
  const { packages, loading } = usePackages();
  const experiencesPagePackages = packages.filter(
    (p) => p.showOnExperiencesPage
  );
  const activePackages = packages.filter((p) => p.isActive);
  const visible =
    experiencesPagePackages.length > 0
      ? experiencesPagePackages
      : activePackages;

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#c8993e]/10 border border-[#c8993e]/20 rounded-full px-4 py-1.5 text-[#c8993e] text-sm font-medium mb-4">
              Packages & Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2744] mb-4">
              Choose Your Experience
            </h2>
            <p className="text-lg text-[#2a3d64]/60 max-w-2xl mx-auto">
              Every experience is private, captain-led, and designed around
              comfort, safety, and unforgettable views.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {(loading ? [] : visible).map((pkg) => {
            const Icon = iconMap[pkg.icon] || Compass;
            let includedItems: string[] = [];
            try {
              includedItems = JSON.parse(pkg.includedItems || "[]");
            } catch {
              // keep empty
            }

            return (
              <motion.div key={pkg.id} variants={cardVariants}>
                <Card className="h-full flex flex-col overflow-hidden border border-[#1a2744]/5 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-2xl group">
                  <div className="relative h-56 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: `url(${pkg.imageUrl || "/images/custom-cruise.png"})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/70 via-[#1a2744]/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="bg-[#c8993e] text-white rounded-full p-2.5 shadow-lg">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {pkg.title}
                      </h3>
                      <div className="flex items-center gap-3 text-white/80 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {pkg.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {pkg.capacity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 flex-1">
                    <p className="text-sm text-[#2a3d64]/60 mb-4 leading-relaxed">
                      {pkg.shortDescription}
                    </p>
                    <div className="space-y-2 mb-4">
                      {includedItems.map((item: string) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-[#2d5a3d] mt-0.5 shrink-0" />
                          <span className="text-[#2a3d64]/70">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 pb-6 pt-0">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-lg font-bold text-[#c8993e]">
                            {pkg.startingPrice || "Request pricing"}
                          </span>
                          {pkg.priceLabel && (
                            <span className="text-xs text-[#2a3d64]/40 ml-1.5">
                              / {pkg.priceLabel}
                            </span>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-[#2d5a3d]/10 text-[#2d5a3d] text-xs"
                        >
                          {pkg.capacity}
                        </Badge>
                      </div>
                      <Link href={`#booking?package=${pkg.slug}`}>
                        <Button className="w-full bg-[#1a2744] hover:bg-[#2a3d64] text-white font-semibold gap-2 shadow-lg transition-all hover:shadow-xl">
                          {pkg.ctaLabel}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
