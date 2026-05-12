import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const fallbackLakes = [
  {
    id: "fallback-lake-minnetonka",
    name: "Lake Minnetonka",
    slug: "lake-minnetonka",
    shortDescription: "A popular Minnesota lake for private cruises.",
    region: "Hennepin / Carver County",
    isFeatured: true,
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "fallback-prior-lake",
    name: "Prior Lake",
    slug: "prior-lake",
    shortDescription: "A south metro lake for sunset cruises and family outings.",
    region: "Scott County",
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
  },
];

export async function GET() {
  try {
    const lakes = await db.lake.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(lakes.length > 0 ? lakes : fallbackLakes);
  } catch (error) {
    console.error("Error fetching public lakes:", error);
    return NextResponse.json(fallbackLakes);
  }
}
