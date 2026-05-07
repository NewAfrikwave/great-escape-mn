import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ session });
}
