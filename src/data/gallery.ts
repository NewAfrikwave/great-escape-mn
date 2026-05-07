export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

export const galleryImages: GalleryImage[] = [
  {
    id: "sunset-1",
    src: "/images/hero-sunset-cruise.png",
    alt: "Pontoon boat on calm Minnesota lake at sunset with golden hour light",
    category: "Sunset Cruises",
  },
  {
    id: "sunset-2",
    src: "/images/sunset-cruise.png",
    alt: "Romantic sunset cruise on Minnesota lake",
    category: "Sunset Cruises",
  },
  {
    id: "family-1",
    src: "/images/family-fun-day.png",
    alt: "Family enjoying a fun day on the pontoon boat",
    category: "Family Lake Days",
  },
  {
    id: "fishing-1",
    src: "/images/fishing-trip.png",
    alt: "Friends fishing from the pontoon on a Minnesota lake",
    category: "Fishing Trips",
  },
  {
    id: "celebration-1",
    src: "/images/bachelorette-cruise.png",
    alt: "Bachelorette party celebration on the pontoon",
    category: "Celebrations",
  },
  {
    id: "fall-1",
    src: "/images/fall-colors-tour.png",
    alt: "Stunning fall colors reflected in the lake",
    category: "Fall Colors",
  },
  {
    id: "pontoon-1",
    src: "/images/gallery-pontoon-interior.png",
    alt: "Luxury pontoon boat interior with comfortable seating",
    category: "Pontoon Boat",
  },
  {
    id: "aerial-1",
    src: "/images/gallery-lake-aerial.png",
    alt: "Aerial view of beautiful Minnesota lake at sunset",
    category: "Sunset Cruises",
  },
  {
    id: "couple-1",
    src: "/images/gallery-couple-sunset.png",
    alt: "Couple enjoying a romantic moment at sunset on the lake",
    category: "Sunset Cruises",
  },
  {
    id: "friends-1",
    src: "/images/gallery-friends-fun.png",
    alt: "Group of friends having fun on the pontoon",
    category: "Family Lake Days",
  },
  {
    id: "morning-1",
    src: "/images/gallery-lake-morning.png",
    alt: "Peaceful Minnesota lake at dawn with morning mist",
    category: "Fishing Trips",
  },
  {
    id: "custom-1",
    src: "/images/custom-cruise.png",
    alt: "Modern white and gray pontoon boat ready for a custom cruise",
    category: "Pontoon Boat",
  },
];

export const galleryCategories = [
  "All",
  "Sunset Cruises",
  "Family Lake Days",
  "Fishing Trips",
  "Celebrations",
  "Fall Colors",
  "Pontoon Boat",
];
