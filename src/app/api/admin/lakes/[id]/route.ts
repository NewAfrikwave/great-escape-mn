import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const lake = await db.lake.findUnique({ where: { id } });

    if (!lake) {
      return NextResponse.json({ error: "Lake not found" }, { status: 404 });
    }

    return NextResponse.json(lake);
  } catch (error) {
    console.error("Error fetching lake:", error);
    return NextResponse.json(
      { error: "Failed to fetch lake" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.lake.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lake not found" }, { status: 404 });
    }

    // If slug is being updated, check uniqueness
    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await db.lake.findUnique({ where: { slug: body.slug } });
      if (slugConflict) {
        return NextResponse.json(
          { error: "A lake with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const lake = await db.lake.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(lake);
  } catch (error) {
    console.error("Error updating lake:", error);
    return NextResponse.json(
      { error: "Failed to update lake" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await db.lake.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lake not found" }, { status: 404 });
    }

    await db.lake.delete({ where: { id } });

    return NextResponse.json({ message: "Lake deleted successfully" });
  } catch (error) {
    console.error("Error deleting lake:", error);
    return NextResponse.json(
      { error: "Failed to delete lake" },
      { status: 500 }
    );
  }
}
