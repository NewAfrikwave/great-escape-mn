import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.redirect(new URL("/?payment=cancelled", request.url));
    }

    const payment = await db.payment.findUnique({ where: { id: paymentId } });

    if (payment && payment.status === "pending") {
      await db.payment.update({
        where: { id: paymentId },
        data: { status: "cancelled" },
      });
    }

    return NextResponse.redirect(
      new URL("/?payment=cancelled", request.url)
    );
  } catch (error) {
    console.error("Error processing payment cancel:", error);
    return NextResponse.redirect(
      new URL("/?payment=cancelled", request.url)
    );
  }
}
