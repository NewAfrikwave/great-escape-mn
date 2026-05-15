import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBookingNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      fullName,
      email,
      phone,
      packageSlug,
      preferredLake,
      preferredDate,
      preferredTime,
      passengers,
      occasion,
      fishingGear,
      tubing,
      byob,
      decorations,
      needHelpPlanning,
      message,
      waiverAccepted,
      waiverSignature,
    } = body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: "Full name, email, and phone are required." },
        { status: 400 }
      );
    }

    if (!waiverAccepted || !String(waiverSignature || "").trim()) {
      return NextResponse.json(
        { error: "Please accept and sign the damage responsibility waiver." },
        { status: 400 }
      );
    }

    const booking = await db.booking.create({
      data: {
        fullName,
        email,
        phone,
        packageSlug: packageSlug || "custom-cruise",
        preferredLake: preferredLake || null,
        preferredDate: preferredDate || null,
        preferredTime: preferredTime || null,
        passengers: passengers || null,
        occasion: occasion || null,
        fishingGear: fishingGear || false,
        tubing: tubing || false,
        byob: byob || false,
        decorations: decorations || false,
        needHelpPlanning: needHelpPlanning || false,
        message: message || null,
        waiverAccepted: true,
        waiverSignature: String(waiverSignature).trim(),
        waiverAcceptedAt: new Date(),
        waiverTextVersion: "damage-responsibility-v1",
      },
    });

    try {
      await sendBookingNotification(booking);
    } catch (notificationError) {
      console.error("Booking notification error:", notificationError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking request received successfully.",
        bookingId: booking.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking submission error:", error);
    return NextResponse.json(
      { error: "Failed to process booking request." },
      { status: 500 }
    );
  }
}
