import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sections = await db.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Error fetching homepage sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage sections" },
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
    const body: Array<{
      sectionKey: string;
      isEnabled?: boolean;
      sortOrder?: number;
      title?: string;
      subtitle?: string;
    }> = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an array of sections" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      body.map((item) => {
        if (!item.sectionKey) {
          throw new Error("Each item must have a sectionKey");
        }

        const data: {
          isEnabled?: boolean;
          sortOrder?: number;
          title?: string;
          subtitle?: string;
        } = {};
        if (item.isEnabled !== undefined) data.isEnabled = item.isEnabled;
        if (item.sortOrder !== undefined) data.sortOrder = item.sortOrder;
        if (item.title !== undefined) data.title = item.title;
        if (item.subtitle !== undefined) data.subtitle = item.subtitle;

        return db.homepageSection.update({
          where: { sectionKey: item.sectionKey },
          data,
        });
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error updating homepage sections:", error);
    if (error instanceof Error && error.message === "Each item must have a sectionKey") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update homepage sections" },
      { status: 500 }
    );
  }
}
