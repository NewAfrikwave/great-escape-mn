import { NextResponse } from "next/server";
import { getPaymentSettings, getStripeClient } from "@/lib/payments";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(new URL("/?payment=error", request.url));
    }

    const settings = await getPaymentSettings();
    const stripe = getStripeClient(settings);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Payment already completed via webhook, redirect to success
      return NextResponse.redirect(new URL("/?payment=success", request.url));
    }

    // If not paid, redirect to the Stripe Checkout page
    if (session.url) {
      return NextResponse.redirect(session.url);
    }

    return NextResponse.redirect(new URL("/?payment=error", request.url));
  } catch (error) {
    console.error("Stripe redirect error:", error);
    return NextResponse.redirect(new URL("/?payment=error", request.url));
  }
}
