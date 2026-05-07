export interface Package {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  capacity: string;
  includes: string[];
  price: string;
  priceNote?: string;
  cta: string;
  image: string;
  icon: string;
}

export const packages: Package[] = [
  {
    id: "sunset-cruise",
    title: "Sunset Cruise for Couples",
    slug: "sunset-cruise",
    description:
      "A private romantic lake cruise designed for couples who want a relaxing sunset experience with beautiful golden-hour views.",
    duration: "2 to 3 hours",
    capacity: "Up to 6 passengers",
    includes: [
      "Private lake tour",
      "Captain included",
      "Comfortable pontoon seating",
      "Golden hour / sunset views",
      "BYOB welcome",
      "Snacks and coolers welcome",
      "Optional fishing gear if requested",
    ],
    price: "Starting at $100",
    priceNote: "Confirm final pricing",
    cta: "Book Sunset Cruise",
    image: "/images/sunset-cruise.png",
    icon: "sunset",
  },
  {
    id: "family-fun-day",
    title: "Family Fun Day",
    slug: "family-fun-day",
    description:
      "A fun private lake outing for families who want a safe and memorable day on the water.",
    duration: "Up to 4 hours",
    capacity: "Up to 6 passengers",
    includes: [
      "Private pontoon ride",
      "Captain included",
      "Tubing / pull-behind activity if available",
      "Swimming / lake relaxation time",
      "Bring snacks, drinks, and coolers",
      "Great for kids and family celebrations",
    ],
    price: "Starting at $25/person",
    priceNote: "Confirm final pricing",
    cta: "Book Family Fun Day",
    image: "/images/family-fun-day.png",
    icon: "users",
  },
  {
    id: "fishing-trip",
    title: "Fishing With the Guys / Gals",
    slug: "fishing-trip",
    description:
      "A relaxed fishing-ready pontoon experience for friends, small groups, and lake lovers.",
    duration: "4 hours",
    capacity: "Up to 6 passengers",
    includes: [
      "Fishing-ready pontoon",
      "Rods, bait, and tackle available",
      "Captain included",
      "Bring drinks and snacks",
      "Great for friends, guys' day, gals' day, or casual group outing",
    ],
    price: "$150 - $450",
    priceNote: "Depending on group and lake",
    cta: "Book Fishing Trip",
    image: "/images/fishing-trip.png",
    icon: "fish",
  },
  {
    id: "bachelorette-cruise",
    title: "Bachelorette Cruise",
    slug: "bachelorette-cruise",
    description:
      "A private lake celebration perfect for bachelorette parties, birthdays, bridal groups, and special moments.",
    duration: "4 hours",
    capacity: "Up to 6 passengers",
    includes: [
      "Private pontoon experience",
      "Captain included",
      "Photo-friendly lake views",
      "BYOB welcome",
      "Bring snacks, coolers, and decorations if approved",
      "Custom music / celebration vibe",
    ],
    price: "Starting at $500",
    cta: "Book Bachelorette Cruise",
    image: "/images/bachelorette-cruise.png",
    icon: "sparkles",
  },
  {
    id: "fall-colors-tour",
    title: "Fall Colors Tour",
    slug: "fall-colors-tour",
    description:
      "A seasonal lake cruise created for guests who want to enjoy Minnesota's beautiful fall colors from the water.",
    duration: "2 to 3 hours",
    capacity: "Up to 6 passengers",
    includes: [
      "Scenic lake tour",
      "Captain included",
      "Relaxed ride",
      "Great for couples, families, photographers, and small groups",
    ],
    price: "Request pricing",
    cta: "Book Fall Colors Tour",
    image: "/images/fall-colors-tour.png",
    icon: "leaf",
  },
  {
    id: "custom-cruise",
    title: "Custom Private Cruise",
    slug: "custom-cruise",
    description:
      "A flexible private lake experience for special occasions, date nights, birthdays, small groups, family visits, or peaceful lake escapes.",
    duration: "Custom",
    capacity: "Up to 6 passengers",
    includes: [
      "Custom route",
      "Captain included",
      "BYOB welcome",
      "Lake options by request",
    ],
    price: "Request custom quote",
    cta: "Request Custom Cruise",
    image: "/images/custom-cruise.png",
    icon: "compass",
  },
];

export const featuredExperiences = packages.map((pkg) => ({
  id: pkg.id,
  title: pkg.title,
  description: pkg.description,
  duration: pkg.duration,
  price: pkg.price,
  cta: "View Details",
  image: pkg.image,
  slug: pkg.slug,
}));
