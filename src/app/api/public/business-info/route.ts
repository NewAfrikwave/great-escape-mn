import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let info = await db.businessInfo.findFirst();

    // Return empty object if no record exists
    if (!info) {
      return NextResponse.json({});
    }

    return NextResponse.json(info);
  } catch (error) {
    console.error("Error fetching public business info:", error);
    return NextResponse.json(
      { error: "Failed to fetch business info" },
      { status: 500 }
    );
  }
}
