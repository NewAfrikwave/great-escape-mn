import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany();

    // Return as key-value object
    const result: Record<string, string | null> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
