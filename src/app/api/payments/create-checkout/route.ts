import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getPaymentSettings,
  getStripeClient,
  getPayPalClient,
  calculateDepositAmount,
} from "@/lib/payments";
import paypal from "@paypal/checkout-server-sdk";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, paymentType, gateway } = body as {
      bookingId: string;
      paymentType: "deposit" | "full";
      gateway: "stripe" | "paypal";
    };

    if (!bookingId || !paymentType || !gateway) {
      return NextResponse.json(
        { error: "bookingId, paymentType, and gateway are required" },
        { status: 400 }
      );
    }

    if (!["deposit", "full"].includes(paymentType)) {
      return NextResponse.json(
        { error: "paymentType must be 'deposit' or 'full'" },
        { status: 400 }
      );
    }

    if (!["stripe", "paypal"].includes(gateway)) {
      return NextResponse.json(
        { error: "gateway must be 'stripe' or 'paypal'" },
        { status: 400 }
      );
    }

    // Fetch booking
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (!booking.quotedPrice || booking.quotedPrice <= 0) {
      return NextResponse.json(
        { error: "Booking does not have a quoted price set" },
        { status: 400 }
      );
    }

    // Get payment settings
    const settings = await getPaymentSettings();

    // Check if gateway is enabled
    if (gateway === "stripe" && !settings.stripeEnabled) {
      return NextResponse.json(
        { error: "Stripe payments are not enabled" },
        { status: 400 }
      );
    }

    if (gateway === "paypal" && !settings.paypalEnabled) {
      return NextResponse.json(
        { error: "PayPal payments are not enabled" },
        { status: 400 }
      );
    }

    // Calculate amount
    const totalCents = booking.quotedPrice;
    const amountCents =
      paymentType === "deposit"
        ? calculateDepositAmount(totalCents, settings)
        : totalCents;

    if (amountCents <= 0) {
      return NextResponse.json(
        { error: "Calculated payment amount is zero" },
        { status: 400 }
      );
    }

    const description =
      paymentType === "deposit"
        ? `${settings.paymentDescription} - Deposit`
        : `${settings.paymentDescription} - Full Payment`;

    const origin = new URL(request.url).origin;

    // Create payment record
    const payment = await db.payment.create({
      data: {
        bookingId: booking.id,
        amount: amountCents,
        currency: settings.currency,
        status: "pending",
        gateway,
        paymentType,
        customerEmail: booking.email,
        customerName: booking.fullName,
        description,
        metadata: JSON.stringify({ bookingId: booking.id, paymentType }),
      },
    });

    if (gateway === "stripe") {
      const stripe = getStripeClient(settings);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${origin}/api/payments/success?gateway=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/api/payments/cancel?gateway=stripe&paymentId=${payment.id}`,
        metadata: {
          bookingId: booking.id,
          paymentId: payment.id,
          paymentType,
        },
        line_items: [
          {
            price_data: {
              currency: settings.currency.toLowerCase(),
              product_data: {
                name: description,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        customer_email: booking.email,
      });

      // Update payment with gateway payment ID
      await db.payment.update({
        where: { id: payment.id },
        data: { gatewayPaymentId: session.id },
      });

      return NextResponse.json({
        sessionId: session.id,
        paymentId: payment.id,
      });
    }

    if (gateway === "paypal") {
      const paypalClient = getPayPalClient(settings);
      const amountDollars = (amountCents / 100).toFixed(2);

      const orderRequest = new paypal.orders.OrdersCreateRequest();
      orderRequest.prefer("return=representation");
      orderRequest.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: settings.currency,
              value: amountDollars,
            },
            description,
          },
        ],
        application_context: {
          return_url: `${origin}/api/payments/success?gateway=paypal&paymentId=${payment.id}`,
          cancel_url: `${origin}/api/payments/cancel?gateway=paypal&paymentId=${payment.id}`,
          brand_name: "A Great Escape",
        },
      });

      const orderResponse = await paypalClient.execute(orderRequest);
      const orderId = orderResponse.result.id;

      // Find the approval URL from the links
      const approvalLink = orderResponse.result.links?.find(
        (link: { rel: string; href: string }) => link.rel === "approve"
      );
      const approvalUrl = approvalLink?.href;

      // Update payment with gateway payment ID
      await db.payment.update({
        where: { id: payment.id },
        data: { gatewayPaymentId: orderId },
      });

      return NextResponse.json({
        orderId,
        approvalUrl,
        paymentId: payment.id,
      });
    }

    return NextResponse.json({ error: "Invalid gateway" }, { status: 400 });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
