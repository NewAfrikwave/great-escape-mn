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
    const image = await db.galleryImage.findUnique({ where: { id } });

    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("Error fetching gallery image:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery image" },
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

    const existing = await db.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
    }

    const image = await db.galleryImage.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return NextResponse.json(
      { error: "Failed to update gallery image" },
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

    const existing = await db.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
    }

    await db.galleryImage.delete({ where: { id } });

    return NextResponse.json({ message: "Gallery image deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery image" },
      { status: 500 }
    );
  }
}
