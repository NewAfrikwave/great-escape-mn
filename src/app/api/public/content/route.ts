import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const content = await db.pageContent.findMany();

    // Return as pageKey-keyed object
    const result: Record<string, { title: string | null; content: string | null }> = {};
    for (const item of content) {
      result[item.pageKey] = {
        title: item.title,
        content: item.content,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching public page content:", error);
    return NextResponse.json(
      { error: "Failed to fetch page content" },
      { status: 500 }
    );
  }
}
