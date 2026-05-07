import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { isActive: true };
    if (category) {
      where.category = category;
    }

    const images = await db.galleryImage.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching public gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}
