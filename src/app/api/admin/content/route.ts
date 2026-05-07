import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = await db.pageContent.findMany({
      orderBy: { pageKey: "asc" },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching page content:", error);
    return NextResponse.json(
      { error: "Failed to fetch page content" },
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
    const body: Array<{ pageKey: string; title?: string; content?: string }> =
      await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an array of {pageKey, title?, content?}" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      body.map((item) => {
        if (!item.pageKey) {
          throw new Error("Each item must have a pageKey");
        }

        const data: { title?: string; content?: string } = {};
        if (item.title !== undefined) data.title = item.title;
        if (item.content !== undefined) data.content = item.content;

        return db.pageContent.upsert({
          where: { pageKey: item.pageKey },
          update: data,
          create: {
            pageKey: item.pageKey,
            title: item.title ?? null,
            content: item.content ?? null,
          },
        });
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error updating page content:", error);
    if (error instanceof Error && error.message === "Each item must have a pageKey") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update page content" },
      { status: 500 }
    );
  }
}
