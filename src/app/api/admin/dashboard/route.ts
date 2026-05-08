import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalBookings,
      newBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalPackages,
      activePackages,
      recentBookings,
      totalGalleryImages,
      totalTestimonials,
      unreadContactMessages,
    ] = await Promise.all([
      db.booking.count(),
      db.booking.count({ where: { status: "new" } }),
      db.booking.count({ where: { status: "pending" } }),
      db.booking.count({ where: { status: "confirmed" } }),
      db.booking.count({ where: { status: "completed" } }),
      db.booking.count({ where: { status: "cancelled" } }),
      db.package.count(),
      db.package.count({ where: { isActive: true } }),
      db.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.galleryImage.count({ where: { isActive: true } }),
      db.testimonial.count({ where: { isActive: true } }),
      db.contactMessage.count({ where: { read: false } }),
    ]);

    // Get upcoming bookings (future preferred dates)
    const today = new Date().toISOString().split("T")[0];
    const upcomingBookings = await db.booking.findMany({
      where: {
        preferredDate: { gte: today },
        status: { in: ["new", "contacted", "pending", "confirmed"] },
      },
      orderBy: { preferredDate: "asc" },
      take: 5,
    });

    // Payment stats
    const [totalRevenue, totalPayments, pendingPayments] = await Promise.all([
      db.payment.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      db.payment.count({ where: { status: "completed" } }),
      db.payment.count({ where: { status: "pending" } }),
    ]);

    return NextResponse.json({
      stats: {
        totalBookings,
        newBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalPackages,
        activePackages,
        totalGalleryImages,
        totalTestimonials,
        unreadContactMessages,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalPayments,
        pendingPayments,
      },
      recentBookings,
      upcomingBookings,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
