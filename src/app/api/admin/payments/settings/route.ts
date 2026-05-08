import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { maskSecret } from "@/lib/payments";

export async function GET(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await db.paymentSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      return NextResponse.json({
        id: "default",
        stripeEnabled: false,
        stripeTestMode: true,
        stripePublishableKey: null,
        stripeSecretKey: null,
        stripeTestPublishableKey: null,
        stripeTestSecretKey: null,
        stripeWebhookSecret: null,
        stripeTestWebhookSecret: null,
        paypalEnabled: false,
        paypalTestMode: true,
        paypalClientId: null,
        paypalClientSecret: null,
        paypalTestClientId: null,
        paypalTestClientSecret: null,
        paypalWebhookId: null,
        paypalTestWebhookId: null,
        currency: "USD",
        depositType: "percentage",
        depositValue: "50",
        requireDeposit: true,
        allowFullPayment: true,
        paymentDescription: "Great Escape MN - Lake Experience",
        receiptNote: null,
      });
    }

    // Mask sensitive keys
    const maskedSettings = {
      ...settings,
      stripeSecretKey: maskSecret(settings.stripeSecretKey),
      stripeTestSecretKey: maskSecret(settings.stripeTestSecretKey),
      stripeWebhookSecret: maskSecret(settings.stripeWebhookSecret),
      stripeTestWebhookSecret: maskSecret(settings.stripeTestWebhookSecret),
      paypalClientSecret: maskSecret(settings.paypalClientSecret),
      paypalTestClientSecret: maskSecret(settings.paypalTestClientSecret),
    };

    return NextResponse.json(maskedSettings);
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await verifyAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Fields that can be updated
    const allowedFields = [
      "stripeEnabled",
      "stripeTestMode",
      "stripePublishableKey",
      "stripeSecretKey",
      "stripeTestPublishableKey",
      "stripeTestSecretKey",
      "stripeWebhookSecret",
      "stripeTestWebhookSecret",
      "paypalEnabled",
      "paypalTestMode",
      "paypalClientId",
      "paypalClientSecret",
      "paypalTestClientId",
      "paypalTestClientSecret",
      "paypalWebhookId",
      "paypalTestWebhookId",
      "currency",
      "depositType",
      "depositValue",
      "requireDeposit",
      "allowFullPayment",
      "paymentDescription",
      "receiptNote",
    ];

    const data: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    // Don't overwrite secret keys with masked values
    // If the value starts with "****", it's masked and should not be saved
    const secretFields = [
      "stripeSecretKey",
      "stripeTestSecretKey",
      "stripeWebhookSecret",
      "stripeTestWebhookSecret",
      "paypalClientSecret",
      "paypalTestClientSecret",
    ];

    for (const field of secretFields) {
      if (data[field] && typeof data[field] === "string" && data[field].startsWith("****")) {
        delete data[field];
      }
    }

    const settings = await db.paymentSettings.upsert({
      where: { id: "default" },
      update: data,
      create: {
        id: "default",
        ...data,
      },
    });

    // Return with masked secrets
    const maskedSettings = {
      ...settings,
      stripeSecretKey: maskSecret(settings.stripeSecretKey),
      stripeTestSecretKey: maskSecret(settings.stripeTestSecretKey),
      stripeWebhookSecret: maskSecret(settings.stripeWebhookSecret),
      stripeTestWebhookSecret: maskSecret(settings.stripeTestWebhookSecret),
      paypalClientSecret: maskSecret(settings.paypalClientSecret),
      paypalTestClientSecret: maskSecret(settings.paypalTestClientSecret),
    };

    return NextResponse.json(maskedSettings);
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return NextResponse.json(
      { error: "Failed to update payment settings" },
      { status: 500 }
    );
  }
}
