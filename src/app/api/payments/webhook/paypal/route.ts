import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const eventType = body.event_type;

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const resource = body.resource as {
          id: string;
          amount: { value: string; currency_code: string };
          links?: { rel: string; href: string }[];
        };

        // Find payment by capture ID
        const payment = await db.payment.findFirst({
          where: { gatewayChargeId: resource.id },
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
        break;
      }

      case "PAYMENT.CAPTURE.REFUNDED": {
        const resource = body.resource as {
          id: string;
          amount: { value: string; currency_code: string };
        };

        // Find payment by capture ID
        const payment = await db.payment.findFirst({
          where: { gatewayChargeId: resource.id },
        });

        if (payment) {
          const refundAmountCents = Math.round(
            parseFloat(resource.amount.value) * 100
          );
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
        console.log(`Unhandled PayPal webhook event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
