import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lakes = await db.lake.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(lakes);
  } catch (error) {
    console.error("Error fetching lakes:", error);
    return NextResponse.json(
      { error: "Failed to fetch lakes" },
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
      name,
      slug: providedSlug,
      shortDescription,
      locationNotes,
      region,
      imageUrl,
      isFeatured,
      isActive,
      sortOrder,
      seoTitle,
      seoDescription,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const slug = providedSlug || generateSlug(name);

    // Check for slug uniqueness
    const existing = await db.lake.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A lake with this slug already exists" },
        { status: 400 }
      );
    }

    const lake = await db.lake.create({
      data: {
        name,
        slug,
        shortDescription: shortDescription ?? null,
        locationNotes: locationNotes ?? null,
        region: region ?? null,
        imageUrl: imageUrl ?? null,
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        seoTitle: seoTitle ?? null,
        seoDescription: seoDescription ?? null,
      },
    });

    return NextResponse.json(lake, { status: 201 });
  } catch (error) {
    console.error("Error creating lake:", error);
    return NextResponse.json(
      { error: "Failed to create lake" },
      { status: 500 }
    );
  }
}
