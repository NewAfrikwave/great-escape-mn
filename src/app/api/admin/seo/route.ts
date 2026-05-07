import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const seoSettings = await db.seoSetting.findMany({
      orderBy: { pageKey: "asc" },
    });

    return NextResponse.json(seoSettings);
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch SEO settings" },
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
      pageKey,
      seoTitle,
      seoDescription,
      ogTitle,
      ogDescription,
      ogImage,
      keywords,
      canonicalUrl,
    } = body;

    if (!pageKey) {
      return NextResponse.json(
        { error: "Missing required field: pageKey" },
        { status: 400 }
      );
    }

    // Check for pageKey uniqueness
    const existing = await db.seoSetting.findUnique({ where: { pageKey } });
    if (existing) {
      return NextResponse.json(
        { error: "SEO settings for this pageKey already exist" },
        { status: 400 }
      );
    }

    const seoSetting = await db.seoSetting.create({
      data: {
        pageKey,
        seoTitle: seoTitle ?? null,
        seoDescription: seoDescription ?? null,
        ogTitle: ogTitle ?? null,
        ogDescription: ogDescription ?? null,
        ogImage: ogImage ?? null,
        keywords: keywords ?? null,
        canonicalUrl: canonicalUrl ?? null,
      },
    });

    return NextResponse.json(seoSetting, { status: 201 });
  } catch (error) {
    console.error("Error creating SEO setting:", error);
    return NextResponse.json(
      { error: "Failed to create SEO setting" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      pageKey,
      seoTitle,
      seoDescription,
      ogTitle,
      ogDescription,
      ogImage,
      keywords,
      canonicalUrl,
    } = body;

    if (!pageKey) {
      return NextResponse.json(
        { error: "Missing required field: pageKey" },
        { status: 400 }
      );
    }

    // Upsert: update if exists, create if not
    const seoSetting = await db.seoSetting.upsert({
      where: { pageKey },
      update: {
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(ogTitle !== undefined && { ogTitle }),
        ...(ogDescription !== undefined && { ogDescription }),
        ...(ogImage !== undefined && { ogImage }),
        ...(keywords !== undefined && { keywords }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
      },
      create: {
        pageKey,
        seoTitle: seoTitle ?? null,
        seoDescription: seoDescription ?? null,
        ogTitle: ogTitle ?? null,
        ogDescription: ogDescription ?? null,
        ogImage: ogImage ?? null,
        keywords: keywords ?? null,
        canonicalUrl: canonicalUrl ?? null,
      },
    });

    return NextResponse.json(seoSetting);
  } catch (error) {
    console.error("Error updating SEO setting:", error);
    return NextResponse.json(
      { error: "Failed to update SEO setting" },
      { status: 500 }
    );
  }
}
