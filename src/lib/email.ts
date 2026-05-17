import type { Booking } from "@prisma/client";
import { getBookingCalendarFile, getBookingCalendarUrl } from "@/lib/calendar";

type ResendEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: string }[];
};

const escapeHtml = (value: string | null | undefined) =>
  (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatBoolean = (value: boolean) => (value ? "Yes" : "No");
const formatCurrency = (cents: number | null | undefined) =>
  typeof cents === "number"
    ? (cents / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })
    : "Not set";

const bookingRows = (booking: Booking): [string, string][] => [
  ["Name", booking.fullName],
  ["Email", booking.email],
  ["Phone", booking.phone],
  ["Package", booking.packageSlug || "Custom cruise"],
  ["Preferred lake", booking.preferredLake || "Not provided"],
  ["Preferred date", booking.preferredDate || "Not provided"],
  ["Preferred time", booking.preferredTime || "Not provided"],
  ["Passengers", booking.passengers?.toString() || "Not provided"],
  ["Occasion", booking.occasion || "Not provided"],
  ["Fishing gear", formatBoolean(booking.fishingGear)],
  ["Tubing / pull-behind", formatBoolean(booking.tubing)],
  ["BYOB / cooler", formatBoolean(booking.byob)],
  ["Decorations", formatBoolean(booking.decorations)],
  ["Needs planning help", formatBoolean(booking.needHelpPlanning)],
  ["Waiver signed", formatBoolean(booking.waiverAccepted)],
  ["Waiver signature", booking.waiverSignature || "Not provided"],
  ["Message", booking.message || "Not provided"],
];

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.BOOKING_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
  const from = process.env.EMAIL_FROM || "A Great Escape <onboarding@resend.dev>";

  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/admin/bookings`
    : "";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "";

  return { apiKey, recipient, from, adminUrl, siteUrl };
}

async function sendEmail(payload: ResendEmailPayload) {
  const { apiKey } = getEmailConfig();

  if (!apiKey) {
    console.info("Email skipped: RESEND_API_KEY is not configured.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Resend email failed with ${response.status}: ${responseText}`);
  }
}

function renderRows(rows: [string, string][]) {
  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#475569;font-weight:600;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");
}

function cardHtml(title: string, intro: string, rows: [string, string][], footer = "") {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
      <h1 style="font-size:22px;margin:0 0 12px;">${escapeHtml(title)}</h1>
      <p style="margin:0 0 16px;">${escapeHtml(intro)}</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px;background:#ffffff;border:1px solid #e5e7eb;">
        <tbody>${renderRows(rows)}</tbody>
      </table>
      ${footer}
    </div>`;
}

function calendarAttachments(booking: Booking) {
  const file = getBookingCalendarFile(booking);
  return file ? [file] : undefined;
}

export async function sendBookingNotification(booking: Booking) {
  const { recipient, from, adminUrl } = getEmailConfig();

  if (!recipient) {
    console.info("Booking admin notification skipped: recipient is not configured.");
    return;
  }

  const rows = bookingRows(booking);
  const calendarUrl = getBookingCalendarUrl(booking);
  const text = [
    "New booking request",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    calendarUrl ? "" : undefined,
    calendarUrl ? `Add to Google Calendar: ${calendarUrl}` : undefined,
    adminUrl ? "" : undefined,
    adminUrl ? `View in admin: ${adminUrl}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  const payload: ResendEmailPayload = {
    from,
    to: [recipient],
    subject: `New booking request from ${booking.fullName}`,
    text,
    html: cardHtml(
      "New booking request",
      "A guest submitted a new A Great Escape booking request.",
      rows,
      `${
        calendarUrl
          ? `<p style="margin:18px 0 0;"><a href="${escapeHtml(calendarUrl)}" style="color:#1d4ed8;">Add to Google Calendar</a></p>`
          : ""
      }${
        adminUrl
          ? `<p style="margin:8px 0 0;"><a href="${escapeHtml(adminUrl)}" style="color:#1d4ed8;">View booking dashboard</a></p>`
          : ""
      }`
    ),
    attachments: calendarAttachments(booking),
  };

  await sendEmail(payload);
}

export async function sendCustomerBookingConfirmation(booking: Booking) {
  const { from, adminUrl } = getEmailConfig();
  const rows = bookingRows(booking).filter(
    ([label]) => !["Waiver signed", "Waiver signature"].includes(label)
  );
  const calendarUrl = getBookingCalendarUrl(booking);

  await sendEmail({
    from,
    to: [booking.email],
    subject: "We received your A Great Escape booking request",
    text: [
      `Hi ${booking.fullName},`,
      "",
      "We received your A Great Escape booking request. The team will review it and follow up to confirm availability, final pricing, and next steps.",
      "",
      ...rows.map(([label, value]) => `${label}: ${value}`),
      calendarUrl ? "" : undefined,
      calendarUrl ? `Calendar hold: ${calendarUrl}` : undefined,
      adminUrl ? "" : undefined,
      "Thank you,",
      "A Great Escape",
    ]
      .filter(Boolean)
      .join("\n"),
    html: cardHtml(
      "Booking request received",
      "Thanks for reaching out. We received your request and will follow up to confirm availability, final pricing, and next steps.",
      rows,
      calendarUrl
        ? `<p style="margin:18px 0 0;">A calendar file is attached for your requested date/time. You can also <a href="${escapeHtml(calendarUrl)}" style="color:#1d4ed8;">open it in Google Calendar</a>.</p>`
        : ""
    ),
    attachments: calendarAttachments(booking),
  });
}

export async function sendCustomerBookingConfirmed(booking: Booking) {
  const { from } = getEmailConfig();
  const calendarUrl = getBookingCalendarUrl(booking);
  await sendEmail({
    from,
    to: [booking.email],
    subject: "Your A Great Escape booking is confirmed",
    text: [
      `Hi ${booking.fullName},`,
      "",
      "Your A Great Escape booking is confirmed.",
      "",
      ...bookingRows(booking).map(([label, value]) => `${label}: ${value}`),
      calendarUrl ? "" : undefined,
      calendarUrl ? `Add to Google Calendar: ${calendarUrl}` : undefined,
      "",
      "We look forward to seeing you on the water.",
    ]
      .filter(Boolean)
      .join("\n"),
    html: cardHtml(
      "Booking confirmed",
      "Your A Great Escape booking is confirmed. The calendar file is attached for convenience.",
      bookingRows(booking),
      calendarUrl
        ? `<p style="margin:18px 0 0;"><a href="${escapeHtml(calendarUrl)}" style="color:#1d4ed8;">Add to Google Calendar</a></p>`
        : ""
    ),
    attachments: calendarAttachments(booking),
  });
}

export async function sendWaiverReminder(booking: Booking) {
  const { from, siteUrl } = getEmailConfig();
  await sendEmail({
    from,
    to: [booking.email],
    subject: "Reminder: please complete your A Great Escape waiver",
    text: [
      `Hi ${booking.fullName},`,
      "",
      "We still need your damage responsibility waiver before your boat experience.",
      siteUrl ? `Please visit ${siteUrl}/#booking and submit/sign the waiver section, or reply to this email if you need help.` : "Please reply to this email if you need help completing the waiver.",
      "",
      "Thank you,",
      "A Great Escape",
    ].join("\n"),
    html: cardHtml(
      "Waiver reminder",
      "We still need your damage responsibility waiver before your boat experience.",
      bookingRows(booking).slice(0, 8),
      siteUrl
        ? `<p style="margin:18px 0 0;"><a href="${escapeHtml(`${siteUrl}/#booking`)}" style="color:#1d4ed8;">Open booking form</a></p>`
        : ""
    ),
  });
}

export async function sendPaymentReminder(booking: Booking) {
  const { from } = getEmailConfig();
  await sendEmail({
    from,
    to: [booking.email],
    subject: "Reminder: payment needed for your A Great Escape booking",
    text: [
      `Hi ${booking.fullName},`,
      "",
      `This is a friendly reminder that payment is still needed for your A Great Escape booking.`,
      `Quoted price: ${formatCurrency(booking.quotedPrice)}`,
      "",
      "Please reply to this email or contact A Great Escape to complete payment.",
      "",
      "Thank you,",
      "A Great Escape",
    ].join("\n"),
    html: cardHtml(
      "Payment reminder",
      "This is a friendly reminder that payment is still needed for your A Great Escape booking.",
      [
        ...bookingRows(booking).slice(0, 8),
        ["Quoted price", formatCurrency(booking.quotedPrice)],
        ["Payment status", booking.paymentStatus],
      ],
      `<p style="margin:18px 0 0;">Please reply to this email or contact A Great Escape to complete payment.</p>`
    ),
    attachments: calendarAttachments(booking),
  });
}
