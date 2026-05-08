import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const gateway = searchParams.get("gateway");
    const bookingId = searchParams.get("bookingId");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (gateway) {
      where.gateway = gateway;
    }

    if (bookingId) {
      where.bookingId = bookingId;
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            fullName: true,
            email: true,
            preferredDate: true,
            packageSlug: true,
            quotedPrice: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
