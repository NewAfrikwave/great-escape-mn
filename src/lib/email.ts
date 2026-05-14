import type { Booking } from "@prisma/client";

type ResendEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
};

const escapeHtml = (value: string | null | undefined) =>
  (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatBoolean = (value: boolean) => (value ? "Yes" : "No");

const bookingRows = (booking: Booking) => [
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
  ["Message", booking.message || "Not provided"],
];

export async function sendBookingNotification(booking: Booking) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.BOOKING_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
  const from = process.env.EMAIL_FROM || "A Great Escape <onboarding@resend.dev>";

  if (!apiKey || !recipient) {
    console.info("Booking email notification skipped: RESEND_API_KEY or recipient is not configured.");
    return;
  }

  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/admin/bookings`
    : "";

  const rows = bookingRows(booking);
  const text = [
    "New booking request",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    adminUrl ? "" : undefined,
    adminUrl ? `View in admin: ${adminUrl}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#475569;font-weight:600;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  const payload: ResendEmailPayload = {
    from,
    to: [recipient],
    subject: `New booking request from ${booking.fullName}`,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
        <h1 style="font-size:22px;margin:0 0 12px;">New booking request</h1>
        <p style="margin:0 0 16px;">A guest submitted a new A Great Escape booking request.</p>
        <table style="border-collapse:collapse;width:100%;max-width:720px;background:#ffffff;border:1px solid #e5e7eb;">
          <tbody>${htmlRows}</tbody>
        </table>
        ${
          adminUrl
            ? `<p style="margin:18px 0 0;"><a href="${escapeHtml(adminUrl)}" style="color:#1d4ed8;">View booking dashboard</a></p>`
            : ""
        }
      </div>`,
  };

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
