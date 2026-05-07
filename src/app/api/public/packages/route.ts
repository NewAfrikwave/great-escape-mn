import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const packages = await db.package.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching public packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
