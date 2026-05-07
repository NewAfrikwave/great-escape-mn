import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@greatescapemn.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "owner",
      isActive: true,
    },
  });
  console.log("✅ Admin user created:", adminEmail);

  // 2. Seed Packages
  const packagesData = [
    {
      title: "Sunset Cruise for Couples",
      slug: "sunset-cruise",
      shortDescription: "A private romantic lake cruise designed for couples who want a relaxing sunset experience with beautiful golden-hour views.",
      fullDescription: "A private romantic lake cruise designed for couples who want a relaxing sunset experience with beautiful golden-hour views. Enjoy peaceful waters, stunning colors, and the kind of quiet beauty that only a Minnesota sunset on the lake can offer.",
      duration: "2 to 3 hours",
      capacity: "Up to 6 passengers",
      startingPrice: "Starting at $100",
      priceLabel: "Confirm final pricing",
      priceType: "starting_at",
      isPriceVisible: true,
      isFeatured: true,
      isActive: true,
      showOnHomepage: true,
      showOnExperiencesPage: true,
      imageUrl: "/images/sunset-cruise.png",
      icon: "sunset",
      ctaLabel: "Book Sunset Cruise",
      sortOrder: 0,
      includedItems: JSON.stringify(["Private lake tour", "Captain included", "Comfortable pontoon seating", "Golden hour / sunset views", "BYOB welcome", "Snacks and coolers welcome", "Optional fishing gear if requested"]),
      highlights: JSON.stringify(["Romantic golden-hour views", "Peaceful and private", "Perfect for date night"]),
      optionalAddOns: JSON.stringify(["Fishing gear", "Photo session"]),
    },
    {
      title: "Family Fun Day",
      slug: "family-fun-day",
      shortDescription: "A fun private lake outing for families who want a safe and memorable day on the water.",
      fullDescription: "A fun private lake outing for families who want a safe and memorable day on the water. Great for kids, family celebrations, and making memories that will last a lifetime.",
      duration: "Up to 4 hours",
      capacity: "Up to 6 passengers",
      startingPrice: "Starting at $25/person",
      priceLabel: "Confirm final pricing",
      priceType: "per_person",
      isPriceVisible: true,
      isFeatured: true,
      isActive: true,
      showOnHomepage: true,
      showOnExperiencesPage: true,
      imageUrl: "/images/family-fun-day.png",
      icon: "users",
      ctaLabel: "Book Family Fun Day",
      sortOrder: 1,
      includedItems: JSON.stringify(["Private pontoon ride", "Captain included", "Tubing / pull-behind activity if available", "Swimming / lake relaxation time", "Bring snacks, drinks, and coolers", "Great for kids and family celebrations"]),
      highlights: JSON.stringify(["Safe for all ages", "Swimming time included", "Perfect for family celebrations"]),
      optionalAddOns: JSON.stringify(["Tubing", "Extra time"]),
    },
    {
      title: "Fishing With the Guys / Gals",
      slug: "fishing-trip",
      shortDescription: "A relaxed fishing-ready pontoon experience for friends, small groups, and lake lovers.",
      fullDescription: "A relaxed fishing-ready pontoon experience for friends, small groups, and lake lovers. Cast your lines, enjoy the company, and make it a day to remember.",
      duration: "4 hours",
      capacity: "Up to 6 passengers",
      startingPrice: "$150 - $450",
      priceLabel: "Depending on group and lake",
      priceType: "starting_at",
      isPriceVisible: true,
      isFeatured: true,
      isActive: true,
      showOnHomepage: true,
      showOnExperiencesPage: true,
      imageUrl: "/images/fishing-trip.png",
      icon: "fish",
      ctaLabel: "Book Fishing Trip",
      sortOrder: 2,
      includedItems: JSON.stringify(["Fishing-ready pontoon", "Rods, bait, and tackle available", "Captain included", "Bring drinks and snacks", "Great for friends, guys' day, gals' day, or casual group outing"]),
      highlights: JSON.stringify(["Fishing gear available", "Relaxed atmosphere", "Great for groups"]),
      optionalAddOns: JSON.stringify(["Extra fishing time", "Multiple lakes"]),
    },
    {
      title: "Bachelorette Cruise",
      slug: "bachelorette-cruise",
      shortDescription: "A private lake celebration perfect for bachelorette parties, birthdays, bridal groups, and special moments.",
      fullDescription: "A private lake celebration perfect for bachelorette parties, birthdays, bridal groups, and special moments. Make it unforgettable on the water with your crew.",
      duration: "4 hours",
      capacity: "Up to 6 passengers",
      startingPrice: "Starting at $500",
      priceLabel: "",
      priceType: "starting_at",
      isPriceVisible: true,
      isFeatured: true,
      isActive: true,
      showOnHomepage: true,
      showOnExperiencesPage: true,
      imageUrl: "/images/bachelorette-cruise.png",
      icon: "sparkles",
      ctaLabel: "Book Bachelorette Cruise",
      sortOrder: 3,
      includedItems: JSON.stringify(["Private pontoon experience", "Captain included", "Photo-friendly lake views", "BYOB welcome", "Bring snacks, coolers, and decorations if approved", "Custom music / celebration vibe"]),
      highlights: JSON.stringify(["Photo-worthy views", "Celebration vibes", "Decorations welcome with approval"]),
      optionalAddOns: JSON.stringify(["Decorations", "Extended time", "Custom playlist"]),
    },
    {
      title: "Fall Colors Tour",
      slug: "fall-colors-tour",
      shortDescription: "A seasonal lake cruise created for guests who want to enjoy Minnesota's beautiful fall colors from the water.",
      fullDescription: "A seasonal lake cruise created for guests who want to enjoy Minnesota's beautiful fall colors from the water. See the stunning autumn foliage from the best seat on the lake.",
      duration: "2 to 3 hours",
      capacity: "Up to 6 passengers",
      startingPrice: "Request pricing",
      priceLabel: "",
      priceType: "request_quote",
      isPriceVisible: true,
      isFeatured: false,
      isActive: true,
      showOnHomepage: true,
      showOnExperiencesPage: true,
      imageUrl: "/images/fall-colors-tour.png",
      icon: "leaf",
      ctaLabel: "Book Fall Colors Tour",
      sortOrder: 4,
      includedItems: JSON.stringify(["Scenic lake tour", "Captain included", "Relaxed ride", "Great for couples, families, photographers, and small groups"]),
      highlights: JSON.stringify(["Stunning autumn views", "Seasonal special", "Photographer friendly"]),
      optionalAddOns: JSON.stringify(["Extra time", "Photography stops"]),
    },
    {
      title: "Custom Private Cruise",
      slug: "custom-cruise",
      shortDescription: "A flexible private lake experience for special occasions, date nights, birthdays, small groups, family visits, or peaceful lake escapes.",
      fullDescription: "A flexible private lake experience for special occasions, date nights, birthdays, small groups, family visits, or peaceful lake escapes. You dream it, we help make it happen on the water.",
      duration: "Custom",
      capacity: "Up to 6 passengers",
      startingPrice: "Request custom quote",
      priceLabel: "",
      priceType: "request_quote",
      isPriceVisible: true,
      isFeatured: false,
      isActive: true,
      showOnHomepage: true,
      showOnExperiencesPage: true,
      imageUrl: "/images/custom-cruise.png",
      icon: "compass",
      ctaLabel: "Request Custom Cruise",
      sortOrder: 5,
      includedItems: JSON.stringify(["Custom route", "Captain included", "BYOB welcome", "Lake options by request"]),
      highlights: JSON.stringify(["Fully customizable", "Any occasion", "Multiple lake options"]),
      optionalAddOns: JSON.stringify(["Fishing gear", "Tubing", "Extended time"]),
    },
  ];

  for (const pkg of packagesData) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    });
  }
  console.log("✅ Packages seeded:", packagesData.length);

  // 3. Seed Lakes
  const lakesData = [
    { name: "Prior Lake", slug: "prior-lake", region: "Scott County", shortDescription: "A beautiful lake in the south metro, perfect for sunset cruises and family outings.", isFeatured: true, sortOrder: 0 },
    { name: "Marion Lake", slug: "marion-lake", region: "Dakota County", shortDescription: "A scenic lake offering peaceful waters and great views for pontoon experiences.", isFeatured: false, sortOrder: 1 },
    { name: "Lakeville", slug: "lakeville", region: "Dakota County", shortDescription: "Conveniently located lakes in the south metro for easy access to water fun.", isFeatured: false, sortOrder: 2 },
    { name: "Minnetonka Lake", slug: "minnetonka-lake", region: "Hennepin / Carver County", shortDescription: "Minnesota's most iconic lake, known for its size, beauty, and vibrant waterfront lifestyle.", isFeatured: true, sortOrder: 3 },
    { name: "Lake Minnetonka", slug: "lake-minnetonka", region: "Hennepin / Carver County", shortDescription: "One of the largest and most popular lakes in Minnesota, offering endless shoreline and stunning views.", isFeatured: true, sortOrder: 4 },
  ];

  for (const lake of lakesData) {
    await prisma.lake.upsert({
      where: { slug: lake.slug },
      update: {},
      create: lake,
    });
  }
  console.log("✅ Lakes seeded:", lakesData.length);

  // 4. Seed FAQs
  const faqsData = [
    { question: "How many passengers can ride?", answer: "Up to 6 passengers per experience. This ensures a comfortable and safe ride for everyone on board.", category: "Boat & Safety", sortOrder: 0 },
    { question: "Is a captain included?", answer: "Yes, all experiences are captain-led unless otherwise stated. Your captain handles the boat so you can relax and enjoy the ride.", category: "Booking", sortOrder: 1 },
    { question: "Can we bring our own drinks?", answer: "Yes, BYOB is welcome! Guests may bring drinks, snacks, and coolers. All guests must follow local lake and safety rules.", category: "Food & Drinks", sortOrder: 2 },
    { question: "Can we bring food?", answer: "Yes, light snacks and food are welcome. Bring whatever makes your experience special — just keep it lake-friendly!", category: "Food & Drinks", sortOrder: 3 },
    { question: "Is fishing gear included?", answer: "Fishing gear may be available for fishing packages. Please confirm when booking so we can have everything ready for you.", category: "Fishing", sortOrder: 4 },
    { question: "What lakes do you serve?", answer: "We serve Prior Lake, Marion Lake, Lakeville, Lake Minnetonka, and nearby lakes by request. Have a favorite lake? Just ask!", category: "Service Areas", sortOrder: 5 },
    { question: "Do we pay online?", answer: "Online deposit and payment options are coming soon. For now, booking requests are submitted and confirmed directly with our team.", category: "Pricing", sortOrder: 6 },
    { question: "What happens after I submit a booking request?", answer: "Our team will contact you to confirm availability, final pricing, lake location, and all the details to make your experience perfect.", category: "Booking", sortOrder: 7 },
    { question: "Can we decorate for birthdays or bachelorette events?", answer: "Yes, light decorations may be allowed if approved in advance. Let us know what you have in mind when booking!", category: "General", sortOrder: 8 },
    { question: "What happens if there's bad weather?", answer: "All bookings are subject to weather conditions. If we need to reschedule due to weather, we'll work with you to find the next best date at no extra charge.", category: "Weather", sortOrder: 9 },
  ];

  for (const faq of faqsData) {
    await prisma.fAQ.create({ data: faq });
  }
  console.log("✅ FAQs seeded:", faqsData.length);

  // 5. Seed Gallery Images
  const galleryData = [
    { title: "Sunset Cruise on the Lake", altText: "Pontoon boat on calm Minnesota lake at sunset with golden hour light", category: "Sunset Cruises", imageUrl: "/images/hero-sunset-cruise.png", isFeatured: true, sortOrder: 0 },
    { title: "Romantic Sunset", altText: "Romantic sunset cruise on Minnesota lake", category: "Sunset Cruises", imageUrl: "/images/sunset-cruise.png", isFeatured: true, sortOrder: 1 },
    { title: "Family Fun Day", altText: "Family enjoying a fun day on the pontoon boat", category: "Family Lake Days", imageUrl: "/images/family-fun-day.png", isFeatured: false, sortOrder: 2 },
    { title: "Fishing on the Lake", altText: "Friends fishing from the pontoon on a Minnesota lake", category: "Fishing Trips", imageUrl: "/images/fishing-trip.png", isFeatured: false, sortOrder: 3 },
    { title: "Bachelorette Celebration", altText: "Bachelorette party celebration on the pontoon", category: "Celebrations", imageUrl: "/images/bachelorette-cruise.png", isFeatured: true, sortOrder: 4 },
    { title: "Fall Colors Tour", altText: "Stunning fall colors reflected in the lake", category: "Fall Colors", imageUrl: "/images/fall-colors-tour.png", isFeatured: false, sortOrder: 5 },
    { title: "Pontoon Interior", altText: "Luxury pontoon boat interior with comfortable seating", category: "Pontoon Boat", imageUrl: "/images/gallery-pontoon-interior.png", isFeatured: false, sortOrder: 6 },
    { title: "Aerial Lake View", altText: "Aerial view of beautiful Minnesota lake at sunset", category: "Sunset Cruises", imageUrl: "/images/gallery-lake-aerial.png", isFeatured: true, sortOrder: 7 },
    { title: "Couple at Sunset", altText: "Couple enjoying a romantic moment at sunset on the lake", category: "Sunset Cruises", imageUrl: "/images/gallery-couple-sunset.png", isFeatured: false, sortOrder: 8 },
    { title: "Friends Having Fun", altText: "Group of friends having fun on the pontoon", category: "Family Lake Days", imageUrl: "/images/gallery-friends-fun.png", isFeatured: false, sortOrder: 9 },
    { title: "Peaceful Morning", altText: "Peaceful Minnesota lake at dawn with morning mist", category: "Fishing Trips", imageUrl: "/images/gallery-lake-morning.png", isFeatured: false, sortOrder: 10 },
    { title: "Custom Cruise Ready", altText: "Modern white and gray pontoon boat ready for a custom cruise", category: "Pontoon Boat", imageUrl: "/images/custom-cruise.png", isFeatured: false, sortOrder: 11 },
  ];

  for (const img of galleryData) {
    await prisma.galleryImage.create({ data: img });
  }
  console.log("✅ Gallery images seeded:", galleryData.length);

  // 6. Seed Testimonials
  const testimonialsData = [
    { customerName: "Sarah & Jake", customerTitleOrLocation: "Minneapolis, MN", rating: 5, quote: "The sunset cruise was absolutely magical. We celebrated our anniversary and it was the most romantic evening we've had in years. Captain was wonderful!", experienceType: "Sunset Cruise", isFeatured: true, sortOrder: 0 },
    { customerName: "The Anderson Family", customerTitleOrLocation: "Prior Lake, MN", rating: 5, quote: "Our kids had the best day ever on the lake! Swimming, tubing, and just enjoying being together. We'll definitely be back next summer.", experienceType: "Family Fun Day", isFeatured: true, sortOrder: 1 },
    { customerName: "Mike T.", customerTitleOrLocation: "Lakeville, MN", rating: 5, quote: "Great fishing day with the guys. The captain knew all the good spots and had everything ready for us. Highly recommend!", experienceType: "Fishing Trip", isFeatured: true, sortOrder: 2 },
    { customerName: "Bride Tribe", customerTitleOrLocation: "Minnetonka, MN", rating: 5, quote: "My bachelorette party on the lake was perfect! BYOB, great music, stunning views. The captain made sure we had the best time.", experienceType: "Bachelorette Cruise", isFeatured: false, sortOrder: 3 },
  ];

  for (const t of testimonialsData) {
    await prisma.testimonial.create({ data: t });
  }
  console.log("✅ Testimonials seeded:", testimonialsData.length);

  // 7. Seed Business Info
  await prisma.businessInfo.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      businessName: "Great Escape MN",
      brandSubtitle: "Private Lake Cruises & Pontoon Experiences",
      email: "greatescapemn@gmail.com",
      phone: "651-332-4859",
      serviceAreaDescription: "Minnesota lakes including Prior Lake, Marion Lake, Lakeville, Lake Minnetonka, and nearby areas by request.",
      footerDescription: "Private captain-led pontoon experiences on Minnesota's most beautiful lakes.",
      copyrightText: "Great Escape MN. All rights reserved.",
    },
  });
  console.log("✅ Business info seeded");

  // 8. Seed Page Content
  const pageContentData = [
    { pageKey: "homepage_hero_headline", title: "Hero Headline", content: "Private Lake Cruises & Pontoon Experiences in Minnesota" },
    { pageKey: "homepage_hero_subheadline", title: "Hero Subheadline", content: "Create unforgettable memories on the water with private sunset cruises, family lake days, fishing trips, bachelorette rides, and custom group experiences." },
    { pageKey: "homepage_hero_cta_primary", title: "Primary CTA Text", content: "Book Your Getaway" },
    { pageKey: "homepage_hero_cta_secondary", title: "Secondary CTA Text", content: "View Packages" },
    { pageKey: "homepage_intro_title", title: "Intro Section Title", content: "Your Private Lake Experience Awaits" },
    { pageKey: "homepage_intro_body", title: "Intro Section Body", content: "Great Escape MN offers private lake experiences designed for couples, families, friends, and small groups. Whether you are celebrating love, planning a birthday, enjoying a family day, fishing with friends, or just escaping for a peaceful sunset ride — we help create a simple, memorable, and beautiful experience on the water." },
    { pageKey: "homepage_why_title", title: "Why Choose Us Title", content: "Why Choose Us" },
    { pageKey: "homepage_cta_headline", title: "Final CTA Headline", content: "Ready to Book Your Lake Escape?" },
    { pageKey: "homepage_cta_body", title: "Final CTA Body", content: "Submit a booking request and our team will confirm availability, pricing, and all the details for your perfect day on the water." },
    { pageKey: "homepage_cta_button", title: "Final CTA Button", content: "Start Booking Request" },
    { pageKey: "about_headline", title: "About Headline", content: "Your Gateway to Minnesota Lake Memories" },
    { pageKey: "about_intro", title: "About Intro", content: "Great Escape MN was created to give couples, families, friends, and small groups an easy way to enjoy Minnesota lakes without the stress of owning or operating a boat." },
    { pageKey: "about_story", title: "About Story", content: "Every experience is private, captain-led, and designed around comfort, safety, and unforgettable views. Whether you're looking for a romantic sunset cruise, a fun family day, a fishing trip with friends, or a special celebration on the water — we're here to make it happen." },
    { pageKey: "booking_headline", title: "Booking Page Headline", content: "Request a Booking" },
    { pageKey: "booking_description", title: "Booking Page Description", content: "Fill out the form below and we'll get back to you to confirm availability and details." },
    { pageKey: "booking_confirmation", title: "Booking Confirmation Message", content: "Thank you! Your booking request has been received. Great Escape MN will contact you shortly to confirm availability, final pricing, and details." },
    { pageKey: "contact_headline", title: "Contact Page Headline", content: "Contact Us" },
    { pageKey: "gallery_headline", title: "Gallery Headline", content: "Moments on the Water" },
    { pageKey: "faq_headline", title: "FAQ Headline", content: "Frequently Asked Questions" },
  ];

  for (const pc of pageContentData) {
    await prisma.pageContent.upsert({
      where: { pageKey: pc.pageKey },
      update: {},
      create: pc,
    });
  }
  console.log("✅ Page content seeded:", pageContentData.length);

  // 9. Seed Homepage Sections
  const homepageSectionsData = [
    { sectionKey: "hero", title: "Hero Section", subtitle: "Main hero with background image and CTAs", isEnabled: true, sortOrder: 0 },
    { sectionKey: "featured_experiences", title: "Featured Experiences", subtitle: "Showcase of top packages", isEnabled: true, sortOrder: 1 },
    { sectionKey: "intro", title: "About Intro", subtitle: "Welcome and introduction", isEnabled: true, sortOrder: 2 },
    { sectionKey: "why_choose_us", title: "Why Choose Us", subtitle: "Key benefits and reasons", isEnabled: true, sortOrder: 3 },
    { sectionKey: "gallery_preview", title: "Gallery Preview", subtitle: "Selected photos from the gallery", isEnabled: true, sortOrder: 4 },
    { sectionKey: "testimonials", title: "Testimonials", subtitle: "Customer reviews and quotes", isEnabled: true, sortOrder: 5 },
    { sectionKey: "faq_preview", title: "FAQ Preview", subtitle: "Top frequently asked questions", isEnabled: true, sortOrder: 6 },
    { sectionKey: "cta", title: "Call to Action", subtitle: "Final booking CTA section", isEnabled: true, sortOrder: 7 },
  ];

  for (const hs of homepageSectionsData) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: hs.sectionKey },
      update: {},
      create: hs,
    });
  }
  console.log("✅ Homepage sections seeded:", homepageSectionsData.length);

  // 10. Seed SEO Settings
  const seoData = [
    { pageKey: "homepage", seoTitle: "Great Escape MN | Private Boat Cruises & Pontoon Experiences in Minnesota", seoDescription: "Book private captain-led pontoon cruises, sunset rides, family lake days, fishing trips, and bachelorette boat experiences across Minnesota lakes.", keywords: "Minnesota boat cruise,Minnesota pontoon rental with captain,Sunset cruise Minnesota,Private lake cruise Minnesota,Lake Minnetonka boat cruise,Prior Lake boat rental" },
    { pageKey: "experiences", seoTitle: "Lake Experiences & Packages | Great Escape MN", seoDescription: "Explore our private pontoon cruise packages — sunset cruises, family lake days, fishing trips, bachelorette parties, fall color tours, and custom experiences.", keywords: "Minnesota pontoon packages,private lake cruise packages,sunset cruise Minnesota" },
    { pageKey: "booking", seoTitle: "Book Your Lake Experience | Great Escape MN", seoDescription: "Request a private lake cruise booking. Choose your experience, lake, date, and let us create your perfect day on the water.", keywords: "book lake cruise Minnesota,pontoon rental booking" },
    { pageKey: "gallery", seoTitle: "Gallery | Great Escape MN", seoDescription: "See our private pontoon cruises in action. Beautiful sunset photos, family lake days, fishing trips, and celebrations on Minnesota lakes.", keywords: "Minnesota lake cruise photos,pontoon boat pictures" },
    { pageKey: "about", seoTitle: "About Great Escape MN | Private Lake Experiences", seoDescription: "Learn about Great Escape MN — your gateway to private captain-led pontoon experiences on Minnesota's most beautiful lakes.", keywords: "Great Escape MN about,Minnesota lake cruise company" },
    { pageKey: "faq", seoTitle: "FAQ | Great Escape MN", seoDescription: "Common questions about our private pontoon cruises — passengers, BYOB, fishing gear, lakes served, pricing, and more.", keywords: "lake cruise FAQ Minnesota,pontoon rental questions" },
    { pageKey: "contact", seoTitle: "Contact Us | Great Escape MN", seoDescription: "Get in touch with Great Escape MN. Email, phone, and contact form for booking inquiries and questions.", keywords: "Great Escape MN contact,Minnesota boat cruise contact" },
  ];

  for (const seo of seoData) {
    await prisma.seoSetting.upsert({
      where: { pageKey: seo.pageKey },
      update: {},
      create: seo,
    });
  }
  console.log("✅ SEO settings seeded:", seoData.length);

  // 11. Seed Site Settings
  const settingsData = [
    { key: "site_status", value: "live" },
    { key: "maintenance_message", value: "We're currently updating our site. Please check back soon!" },
    { key: "booking_form_enabled", value: "true" },
    { key: "booking_disabled_message", value: "Online bookings are temporarily disabled. Please call us to book." },
    { key: "show_pricing", value: "true" },
    { key: "show_testimonials", value: "true" },
    { key: "show_gallery", value: "true" },
    { key: "show_faqs", value: "true" },
    { key: "default_passenger_limit", value: "6" },
    { key: "default_booking_notice", value: "All bookings are subject to weather, availability, lake rules, and safety requirements." },
    { key: "weather_cancellation_disclaimer", value: "All bookings are subject to weather conditions. If we need to reschedule due to weather, we'll work with you to find the next best date at no extra charge." },
    { key: "safety_disclaimer", value: "Safety is our top priority. All passengers must follow captain instructions and wear life jackets when required." },
    { key: "footer_disclaimer", value: "All bookings are subject to weather, availability, lake rules, and safety requirements. Final pricing and availability are confirmed after the booking request is reviewed." },
    { key: "google_analytics_id", value: "" },
    { key: "meta_pixel_id", value: "" },
    { key: "google_search_console_verification", value: "" },
  ];

  for (const s of settingsData) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("✅ Site settings seeded:", settingsData.length);

  console.log("\n🎉 Database seeding complete!");
  console.log("📋 Admin login: " + adminEmail);
  console.log("🔑 Admin password: " + adminPassword);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
