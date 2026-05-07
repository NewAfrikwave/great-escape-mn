import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const lakes = await db.lake.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(lakes);
  } catch (error) {
    console.error("Error fetching public lakes:", error);
    return NextResponse.json(
      { error: "Failed to fetch lakes" },
      { status: 500 }
    );
  }
}
