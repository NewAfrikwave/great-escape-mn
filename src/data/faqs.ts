export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    id: "passengers",
    question: "How many passengers can ride?",
    answer:
      "Up to 6 passengers per experience. This ensures a comfortable and safe ride for everyone on board.",
  },
  {
    id: "captain",
    question: "Is a captain included?",
    answer:
      "Yes, all experiences are captain-led unless otherwise stated. Your captain handles the boat so you can relax and enjoy the ride.",
  },
  {
    id: "drinks",
    question: "Can we bring our own drinks?",
    answer:
      "Yes, BYOB is welcome! Guests may bring drinks, snacks, and coolers. All guests must follow local lake and safety rules.",
  },
  {
    id: "food",
    question: "Can we bring food?",
    answer:
      "Yes, light snacks and food are welcome. Bring whatever makes your experience special — just keep it lake-friendly!",
  },
  {
    id: "fishing-gear",
    question: "Is fishing gear included?",
    answer:
      "Fishing gear may be available for fishing packages. Please confirm when booking so we can have everything ready for you.",
  },
  {
    id: "lakes",
    question: "What lakes do you serve?",
    answer:
      "We serve Prior Lake, Marion Lake, Lakeville, Lake Minnetonka, and nearby lakes by request. Have a favorite lake? Just ask!",
  },
  {
    id: "payment",
    question: "Do we pay online?",
    answer:
      "Online deposit and payment options are coming soon. For now, booking requests are submitted and confirmed directly with our team.",
  },
  {
    id: "after-booking",
    question: "What happens after I submit a booking request?",
    answer:
      "Our team will contact you to confirm availability, final pricing, lake location, and all the details to make your experience perfect.",
  },
  {
    id: "decorations",
    question: "Can we decorate for birthdays or bachelorette events?",
    answer:
      "Yes, light decorations may be allowed if approved in advance. Let us know what you have in mind when booking!",
  },
  {
    id: "weather",
    question: "What happens if there's bad weather?",
    answer:
      "All bookings are subject to weather conditions. If we need to reschedule due to weather, we'll work with you to find the next best date at no extra charge.",
  },
];
