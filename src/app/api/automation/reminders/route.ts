import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPaymentReminder, sendWaiverReminder } from "@/lib/email";

function isAuthorized(request: Request) {
  const secret = process.env.REMINDER_AUTOMATION_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [waiverBookings, paymentBookings] = await Promise.all([
    db.booking.findMany({
      where: {
        waiverAccepted: false,
        status: { in: ["new", "contacted", "pending", "confirmed"] },
        OR: [
          { waiverReminderSentAt: null },
          { waiverReminderSentAt: { lt: oneDayAgo } },
        ],
      },
      orderBy: [{ preferredDate: "asc" }, { createdAt: "desc" }],
      take: 25,
    }),
    db.booking.findMany({
      where: {
        paymentStatus: "unpaid",
        quotedPrice: { gt: 0 },
        status: { in: ["pending", "confirmed"] },
        OR: [
          { paymentReminderSentAt: null },
          { paymentReminderSentAt: { lt: oneDayAgo } },
        ],
      },
      orderBy: [{ preferredDate: "asc" }, { createdAt: "desc" }],
      take: 25,
    }),
  ]);

  let waiverSent = 0;
  let paymentSent = 0;

  for (const booking of waiverBookings) {
    try {
      await sendWaiverReminder(booking);
      await db.booking.update({
        where: { id: booking.id },
        data: { waiverReminderSentAt: new Date() },
      });
      waiverSent += 1;
    } catch (error) {
      console.error("Automated waiver reminder failed:", booking.id, error);
    }
  }

  for (const booking of paymentBookings) {
    try {
      await sendPaymentReminder(booking);
      await db.booking.update({
        where: { id: booking.id },
        data: { paymentReminderSentAt: new Date() },
      });
      paymentSent += 1;
    } catch (error) {
      console.error("Automated payment reminder failed:", booking.id, error);
    }
  }

  return NextResponse.json({
    success: true,
    waiverSent,
    paymentSent,
  });
}
