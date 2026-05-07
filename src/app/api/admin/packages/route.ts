import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

function generateSlug(title: string): string {
  return title
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
    const { searchParams } = new URL(request.url);
    const activeFilter = searchParams.get("active");

    const where = activeFilter === "true" ? { isActive: true } : activeFilter === "false" ? { isActive: false } : {};

    const packages = await db.package.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
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
      title,
      slug: providedSlug,
      shortDescription,
      fullDescription,
      duration,
      capacity,
      startingPrice,
      priceLabel,
      priceType,
      isPriceVisible,
      isFeatured,
      isActive,
      showOnHomepage,
      showOnExperiencesPage,
      imageUrl,
      icon,
      ctaLabel,
      sortOrder,
      includedItems,
      highlights,
      optionalAddOns,
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !shortDescription || !fullDescription || !duration || !capacity || !ctaLabel) {
      return NextResponse.json(
        { error: "Missing required fields: title, shortDescription, fullDescription, duration, capacity, ctaLabel" },
        { status: 400 }
      );
    }

    const slug = providedSlug || generateSlug(title);

    // Check for slug uniqueness
    const existing = await db.package.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A package with this slug already exists" },
        { status: 400 }
      );
    }

    const pkg = await db.package.create({
      data: {
        title,
        slug,
        shortDescription,
        fullDescription,
        duration,
        capacity,
        startingPrice: startingPrice ?? null,
        priceLabel: priceLabel ?? null,
        priceType: priceType ?? "starting_at",
        isPriceVisible: isPriceVisible ?? true,
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        showOnHomepage: showOnHomepage ?? true,
        showOnExperiencesPage: showOnExperiencesPage ?? true,
        imageUrl: imageUrl ?? null,
        icon: icon ?? "compass",
        ctaLabel,
        sortOrder: sortOrder ?? 0,
        includedItems: includedItems ?? "[]",
        highlights: highlights ?? "[]",
        optionalAddOns: optionalAddOns ?? "[]",
        seoTitle: seoTitle ?? null,
        seoDescription: seoDescription ?? null,
      },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}
