import type { Booking } from "@prisma/client";

function parseBookingDate(booking: Booking) {
  if (!booking.preferredDate) return null;
  const time = booking.preferredTime || "12:00";
  const date = new Date(`${booking.preferredDate}T${time}`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function addHours(date: Date, hours: number) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

function formatGoogleDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function getBookingCalendarUrl(booking: Booking) {
  const start = parseBookingDate(booking);
  if (!start) return "";

  const end = addHours(start, 3);
  const title = `A Great Escape booking - ${booking.fullName}`;
  const details = [
    `Customer: ${booking.fullName}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone}`,
    `Package: ${booking.packageSlug || "Custom cruise"}`,
    `Passengers: ${booking.passengers || "Not provided"}`,
    booking.message ? `Notes: ${booking.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details,
    location: booking.preferredLake || "Minnesota lake",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
