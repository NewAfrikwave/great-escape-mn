import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const HELD_STATUSES = ["pending", "confirmed", "completed"];

function dateKey(value: string | null) {
  if (!value) return null;
  return value.split("T")[0];
}

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      where: {
        preferredDate: { not: null },
        status: { in: HELD_STATUSES },
      },
      select: {
        preferredDate: true,
      },
    });

    const unavailableDates = Array.from(
      new Set(
        bookings
          .map((booking) => dateKey(booking.preferredDate))
          .filter((date): date is string => Boolean(date))
      )
    ).sort();

    return NextResponse.json({
      unavailableDates,
      heldStatuses: HELD_STATUSES,
    });
  } catch (error) {
    console.error("Availability fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load availability." },
      { status: 500 }
    );
  }
}
