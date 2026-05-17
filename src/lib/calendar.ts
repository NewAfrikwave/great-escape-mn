import type { Booking } from "@prisma/client";

type CalendarBooking = Pick<
  Booking,
  | "fullName"
  | "email"
  | "phone"
  | "packageSlug"
  | "preferredLake"
  | "passengers"
  | "message"
> & {
  preferredDate: string | Date | null;
  preferredTime: string | null;
};

function parseTime(timeValue: string | null) {
  if (!timeValue) return { hours: 12, minutes: 0 };

  const trimmed = timeValue.trim();
  const twelveHour = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2] ?? "0");
    const period = twelveHour[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  }

  const twentyFourHour = trimmed.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (twentyFourHour) {
    return {
      hours: Number(twentyFourHour[1]),
      minutes: Number(twentyFourHour[2] ?? "0"),
    };
  }

  return { hours: 12, minutes: 0 };
}

function parseBookingDate(booking: CalendarBooking) {
  if (!booking.preferredDate) return null;
  const datePart =
    booking.preferredDate instanceof Date
      ? booking.preferredDate.toISOString().slice(0, 10)
      : String(booking.preferredDate).split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  const { hours, minutes } = parseTime(booking.preferredTime);

  const date = new Date(year, month - 1, day, hours, minutes);
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

function escapeIcsText(value: string | null | undefined) {
  return (value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function getBookingCalendarFile(booking: CalendarBooking) {
  const start = parseBookingDate(booking);
  if (!start) return null;

  const end = addHours(start, 3);
  const title = `A Great Escape booking - ${booking.fullName}`;
  const description = [
    `Customer: ${booking.fullName}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone}`,
    `Package: ${booking.packageSlug || "Custom cruise"}`,
    `Passengers: ${booking.passengers || "Not provided"}`,
    booking.message ? `Notes: ${booking.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//A Great Escape//Booking Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(`${booking.email}-${formatIcsDate(start)}@agreatescape`)}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(booking.preferredLake || "Minnesota lake")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    filename: `a-great-escape-${formatIcsDate(start).slice(0, 8)}.ics`,
    content: Buffer.from(ics, "utf8").toString("base64"),
  };
}

export function getBookingCalendarUrl(booking: CalendarBooking) {
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
