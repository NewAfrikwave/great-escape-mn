import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let info = await db.businessInfo.findFirst();

    // Auto-create default record if none exists
    if (!info) {
      info = await db.businessInfo.create({ data: {} });
    }

    return NextResponse.json(info);
  } catch (error) {
    console.error("Error fetching business info:", error);
    return NextResponse.json(
      { error: "Failed to fetch business info" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    let info = await db.businessInfo.findFirst();

    if (!info) {
      // Create if no record exists
      info = await db.businessInfo.create({ data: body });
    } else {
      // Update the first (default) record
      info = await db.businessInfo.update({
        where: { id: info.id },
        data: body,
      });
    }

    return NextResponse.json(info);
  } catch (error) {
    console.error("Error updating business info:", error);
    return NextResponse.json(
      { error: "Failed to update business info" },
      { status: 500 }
    );
  }
}
