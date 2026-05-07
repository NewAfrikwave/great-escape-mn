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
    const category = searchParams.get("category");

    const where = category ? { category } : {};

    const images = await db.galleryImage.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
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
    const { title, altText, caption, imageUrl, category, isFeatured, isActive, sortOrder } = body;

    if (!title || !altText || !imageUrl || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, altText, imageUrl, category" },
        { status: 400 }
      );
    }

    const image = await db.galleryImage.create({
      data: {
        title,
        altText,
        caption: caption ?? null,
        imageUrl,
        category,
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return NextResponse.json(
      { error: "Failed to create gallery image" },
      { status: 500 }
    );
  }
}
