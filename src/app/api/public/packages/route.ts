import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const fallbackPackages = [
  {
    id: "fallback-fishing-trip",
    title: "Fishing With the Guys / Gals",
    slug: "fishing-trip",
    shortDescription: "A four-hour fishing-ready pontoon trip with Sunday and Monday windows.",
    fullDescription: "A four-hour fishing-ready pontoon trip with Sunday and Monday windows.",
    duration: "4 hours",
    capacity: "Up to 6 passengers",
    startingPrice: "$400+",
    priceLabel: "Sun/Mon windows",
    priceType: "starting_at",
    isPriceVisible: true,
    isFeatured: true,
    isActive: true,
    showOnHomepage: true,
    showOnExperiencesPage: true,
    imageUrl: null,
    icon: "fish",
    ctaLabel: "Book Fishing Trip",
    sortOrder: 0,
    includedItems: JSON.stringify(["Captain included", "Fishing-ready pontoon", "Sunday 8-12 or 1-5", "Monday 8-12 or 1-5"]),
    highlights: JSON.stringify(["$400 and up", "4 hours", "Up to 6 passengers"]),
    optionalAddOns: JSON.stringify(["Extra fishing time", "Multiple lakes"]),
  },
  {
    id: "fallback-parties-events",
    title: "Parties & Events",
    slug: "parties-events",
    shortDescription: "A private event cruise for birthdays, bridal groups, celebrations, and special moments.",
    fullDescription: "A private event cruise for birthdays, bridal groups, celebrations, and special moments.",
    duration: "4 hours",
    capacity: "Up to 6 passengers",
    startingPrice: "$425",
    priceLabel: "Sun/Mon windows",
    priceType: "fixed",
    isPriceVisible: true,
    isFeatured: true,
    isActive: true,
    showOnHomepage: true,
    showOnExperiencesPage: true,
    imageUrl: null,
    icon: "sparkles",
    ctaLabel: "Book Party or Event",
    sortOrder: 1,
    includedItems: JSON.stringify(["Captain included", "Private pontoon experience", "Sunday 8-12 or 1-5", "Monday 1-5"]),
    highlights: JSON.stringify(["$425 flat package", "4 hours", "Up to 6 passengers"]),
    optionalAddOns: JSON.stringify(["Decorations", "Extended time", "Custom playlist"]),
  },
  {
    id: "fallback-sunset-cruise",
    title: "Sunset Cruise",
    slug: "sunset-cruise",
    shortDescription: "A private golden-hour cruise available Monday, Tuesday, Saturday, and Sunday.",
    fullDescription: "A private golden-hour cruise available Monday, Tuesday, Saturday, and Sunday.",
    duration: "6:00 PM - 8:30 PM",
    capacity: "Up to 6 passengers",
    startingPrice: "$100/person",
    priceLabel: "Mon, Tue, Sat, Sun",
    priceType: "per_person",
    isPriceVisible: true,
    isFeatured: true,
    isActive: true,
    showOnHomepage: true,
    showOnExperiencesPage: true,
    imageUrl: null,
    icon: "sunset",
    ctaLabel: "Book Sunset Cruise",
    sortOrder: 2,
    includedItems: JSON.stringify(["Captain included", "Private sunset cruise", "Monday, Tuesday, Saturday, and Sunday", "6:00 PM - 8:30 PM"]),
    highlights: JSON.stringify(["$100 per person", "Golden-hour views", "Up to 6 passengers"]),
    optionalAddOns: JSON.stringify(["Decorations", "Cooler setup", "Custom music"]),
  },
];

export async function GET() {
  try {
    const packages = await db.package.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(packages.length > 0 ? packages : fallbackPackages);
  } catch (error) {
    console.error("Error fetching public packages:", error);
    return NextResponse.json(fallbackPackages);
  }
}
