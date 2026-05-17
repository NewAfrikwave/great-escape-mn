import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

export async function POST(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
      return NextResponse.json({ error: "No image file uploaded" }, { status: 400 });
    }

    const upload = file as File;
    const extension = ALLOWED_TYPES.get(upload.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Only JPG and PNG images are allowed" },
        { status: 400 }
      );
    }

    if (upload.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be 8MB or smaller" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await upload.arrayBuffer());
    const url = `data:${upload.type};base64,${bytes.toString("base64")}`;

    return NextResponse.json({
      url,
      filename: upload.name,
      size: upload.size,
      contentType: upload.type,
      storage: "database",
    });
  } catch (error) {
    console.error("Admin image upload failed:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
