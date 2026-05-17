import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPaymentReminder, sendWaiverReminder } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as { type?: string };
    const type = body.type;

    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (type === "waiver") {
      await sendWaiverReminder(booking);
      await db.booking.update({
        where: { id },
        data: { waiverReminderSentAt: new Date() },
      });
      return NextResponse.json({ success: true, message: "Waiver reminder sent" });
    }

    if (type === "payment") {
      await sendPaymentReminder(booking);
      await db.booking.update({
        where: { id },
        data: { paymentReminderSentAt: new Date() },
      });
      return NextResponse.json({ success: true, message: "Payment reminder sent" });
    }

    return NextResponse.json(
      { error: "Reminder type must be waiver or payment" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Reminder email error:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}
