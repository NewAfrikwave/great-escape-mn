import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPaymentSettings, getStripeClient, getPayPalClient } from "@/lib/payments";
import paypal from "@paypal/checkout-server-sdk";

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

    const payment = await db.payment.findUnique({ where: { id } });
    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Handle refund action
    if (body.action === "refund") {
      if (payment.status !== "completed" && payment.status !== "partially_refunded") {
        return NextResponse.json(
          { error: "Payment cannot be refunded in its current status" },
          { status: 400 }
        );
      }

      const refundAmountCents = body.amount
        ? Math.round(body.amount * 100)
        : payment.amount - payment.refundAmount;

      if (refundAmountCents <= 0) {
        return NextResponse.json(
          { error: "Refund amount must be greater than zero" },
          { status: 400 }
        );
      }

      if (refundAmountCents > payment.amount - payment.refundAmount) {
        return NextResponse.json(
          { error: "Refund amount exceeds remaining refundable amount" },
          { status: 400 }
        );
      }

      const settings = await getPaymentSettings();

      let gatewayRefundId: string | null = null;

      if (payment.gateway === "stripe") {
        const stripe = getStripeClient(settings);

        if (!payment.gatewayChargeId) {
          return NextResponse.json(
            { error: "No charge ID found for Stripe refund" },
            { status: 400 }
          );
        }

        const refund = await stripe.refunds.create({
          charge: payment.gatewayChargeId,
          amount: refundAmountCents,
          reason: body.reason === "duplicate" || body.reason === "fraudulent" || body.reason === "requested_by_customer"
            ? body.reason
            : "requested_by_customer",
        });

        gatewayRefundId = refund.id;
      }

      if (payment.gateway === "paypal") {
        if (!payment.gatewayChargeId) {
          return NextResponse.json(
            { error: "No capture ID found for PayPal refund" },
            { status: 400 }
          );
        }

        const paypalClient = getPayPalClient(settings);
        const refundAmountDollars = (refundAmountCents / 100).toFixed(2);

        const refundRequest = new paypal.payments.CapturesRefundRequest(
          payment.gatewayChargeId
        );
        refundRequest.requestBody({
          amount: {
            value: refundAmountDollars,
            currency_code: payment.currency,
          },
        });

        const refundResponse = await paypalClient.execute(refundRequest);
        gatewayRefundId = refundResponse.result.id || null;
      }

      const newRefundAmount = payment.refundAmount + refundAmountCents;
      const isFullRefund = newRefundAmount >= payment.amount;
      const newStatus = isFullRefund ? "refunded" : "partially_refunded";

      const updatedPayment = await db.payment.update({
        where: { id },
        data: {
          status: newStatus,
          refundAmount: newRefundAmount,
          refundReason: body.reason || null,
          gatewayRefundId,
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

      return NextResponse.json(updatedPayment);
    }

    // Handle status update
    if (body.status !== undefined) {
      const allowedStatuses = [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "partially_refunded",
        "cancelled",
      ];

      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }

      const updatedPayment = await db.payment.update({
        where: { id },
        data: {
          status: body.status,
          ...(body.status === "completed" && !payment.paidAt
            ? { paidAt: new Date() }
            : {}),
        },
      });

      return NextResponse.json(updatedPayment);
    }

    return NextResponse.json(
      { error: "No valid action or status provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
