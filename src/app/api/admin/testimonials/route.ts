import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      customerName,
      customerTitleOrLocation,
      rating,
      quote,
      experienceType,
      isFeatured,
      isActive,
      sortOrder,
    } = body;

    if (!customerName || !quote) {
      return NextResponse.json(
        { error: "Missing required fields: customerName, quote" },
        { status: 400 }
      );
    }

    const testimonial = await db.testimonial.create({
      data: {
        customerName,
        customerTitleOrLocation: customerTitleOrLocation ?? null,
        rating: rating ?? 5,
        quote,
        experienceType: experienceType ?? null,
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
