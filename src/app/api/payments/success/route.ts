import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentSettings, getStripeClient, getPayPalClient } from "@/lib/payments";
import paypal from "@paypal/checkout-server-sdk";
import type Stripe from "stripe";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gateway = searchParams.get("gateway");

    if (!gateway || !["stripe", "paypal"].includes(gateway)) {
      return NextResponse.json(
        { error: "Invalid or missing gateway parameter" },
        { status: 400 }
      );
    }

    const settings = await getPaymentSettings();

    if (gateway === "stripe") {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        return NextResponse.json(
          { error: "Missing session_id parameter" },
          { status: 400 }
        );
      }

      const stripe = getStripeClient(settings);

      // Retrieve the checkout session
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
      });

      if (session.payment_status !== "paid") {
        return NextResponse.redirect(
          new URL("/?payment=failed", request.url)
        );
      }

      // Find the payment record by the session ID
      const payment = await db.payment.findFirst({
        where: { gatewayPaymentId: sessionId },
      });

      if (!payment) {
        return NextResponse.redirect(
          new URL("/?payment=failed", request.url)
        );
      }

      if (payment.status === "completed") {
        // Already processed (e.g., via webhook)
        return NextResponse.redirect(
          new URL("/?payment=success", request.url)
        );
      }

      // Get charge details
      const paymentIntent =
        typeof session.payment_intent === "object"
          ? (session.payment_intent as Stripe.PaymentIntent)
          : null;

      const chargeId =
        typeof session.payment_intent === "string"
          ? null
          : paymentIntent?.latest_charge;

      const receiptUrl =
        typeof chargeId === "object" && chargeId !== null
          ? (chargeId as { receipt_url?: string }).receipt_url || null
          : null;

      // Update payment record
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "completed",
          paidAt: new Date(),
          gatewayChargeId:
            paymentIntent?.latest_charge
              ? String(paymentIntent.latest_charge)
              : typeof chargeId === "string"
                ? chargeId
                : null,
          receiptUrl,
        },
      });

      // Update booking payment status
      const paymentType = payment.paymentType;
      await db.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: paymentType === "full" ? "paid" : "deposit_paid",
        },
      });

      return NextResponse.redirect(
        new URL("/?payment=success", request.url)
      );
    }

    if (gateway === "paypal") {
      const paymentId = searchParams.get("paymentId");
      const token = searchParams.get("token"); // PayPal order ID from return
      const PayerID = searchParams.get("PayerID");

      if (!paymentId || !token) {
        return NextResponse.json(
          { error: "Missing paymentId or token parameter" },
          { status: 400 }
        );
      }

      const payment = await db.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return NextResponse.redirect(
          new URL("/?payment=failed", request.url)
        );
      }

      if (payment.status === "completed") {
        return NextResponse.redirect(
          new URL("/?payment=success", request.url)
        );
      }

      // Capture the PayPal order
      const paypalClient = getPayPalClient(settings);
      const captureRequest = new paypal.orders.OrdersCaptureRequest(token);
      captureRequest.requestBody({});

      const captureResponse = await paypalClient.execute(captureRequest);
      const captureResult = captureResponse.result;

      // Get capture details
      const capture =
        captureResult.purchase_units?.[0]?.payments?.captures?.[0];
      const captureId = capture?.id || null;
      const receiptUrl = capture?.links?.find(
        (l: { rel: string; href: string }) => l.rel === "receipt"
      )?.href;

      // Update payment record
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "completed",
          paidAt: new Date(),
          gatewayChargeId: captureId,
          gatewayPaymentId: token, // Update with the actual PayPal order ID
          receiptUrl: receiptUrl || null,
        },
      });

      // Update booking payment status
      const paymentType = payment.paymentType;
      await db.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: paymentType === "full" ? "paid" : "deposit_paid",
        },
      });

      return NextResponse.redirect(
        new URL("/?payment=success", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/?payment=failed", request.url)
    );
  } catch (error) {
    console.error("Error processing payment success:", error);
    return NextResponse.redirect(
      new URL("/?payment=failed", request.url)
    );
  }
}
