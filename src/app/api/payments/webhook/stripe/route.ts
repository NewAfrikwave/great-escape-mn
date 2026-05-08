import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentSettings, getStripeClient } from "@/lib/payments";

export async function POST(request: Request) {
  try {
    const settings = await getPaymentSettings();
    const stripe = getStripeClient(settings);

    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = settings.stripeTestMode
      ? settings.stripeTestWebhookSecret
      : settings.stripeWebhookSecret;

    if (!webhookSecret) {
      console.error("Stripe webhook secret not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: ReturnType<typeof stripe.webhooks.constructEvent> extends infer E
      ? E
      : never;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          id: string;
          payment_status: string;
          metadata?: { bookingId?: string; paymentId?: string; paymentType?: string };
        };

        if (session.payment_status === "paid") {
          // Find payment by session ID
          const payment = await db.payment.findFirst({
            where: { gatewayPaymentId: session.id },
          });

          if (payment && payment.status !== "completed") {
            await db.payment.update({
              where: { id: payment.id },
              data: {
                status: "completed",
                paidAt: new Date(),
              },
            });

            // Update booking payment status
            const paymentType = payment.paymentType;
            await db.booking.update({
              where: { id: payment.bookingId },
              data: {
                paymentStatus:
                  paymentType === "full" ? "paid" : "deposit_paid",
              },
            });
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as {
          id: string;
          amount_refunded: number;
          payment_intent: string;
        };

        // Find payment by charge ID
        const payment = await db.payment.findFirst({
          where: { gatewayChargeId: charge.id },
        });

        if (payment) {
          const refundAmountCents = charge.amount_refunded;
          const isFullRefund = refundAmountCents >= payment.amount;

          await db.payment.update({
            where: { id: payment.id },
            data: {
              status: isFullRefund ? "refunded" : "partially_refunded",
              refundAmount: refundAmountCents,
              refundedAt: new Date(),
            },
          });

          // Update booking payment status
          await db.booking.update({
            where: { id: payment.bookingId },
            data: {
              paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
