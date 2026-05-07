import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await db.siteSetting.findMany();

    // Return as key-value object
    const result: Record<string, string | null> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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
    const body: Record<string, string> = await request.json();

    if (typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an object of key-value pairs" },
        { status: 400 }
      );
    }

    const updates = Object.entries(body);

    const results = await Promise.all(
      updates.map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    // Return as key-value object
    const result: Record<string, string | null> = {};
    for (const setting of results) {
      result[setting.key] = setting.value;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
