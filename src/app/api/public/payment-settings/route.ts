import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.paymentSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      return NextResponse.json({
        stripeEnabled: false,
        paypalEnabled: false,
        stripePublishableKey: null,
        paypalClientId: null,
        currency: "USD",
        depositType: "percentage",
        depositValue: "50",
        requireDeposit: true,
        allowFullPayment: true,
        paymentDescription: "Great Escape MN - Lake Experience",
      });
    }

    // Return only the fields needed by the public booking form
    return NextResponse.json({
      stripeEnabled: settings.stripeEnabled,
      paypalEnabled: settings.paypalEnabled,
      stripePublishableKey: settings.stripeTestMode
        ? settings.stripeTestPublishableKey
        : settings.stripePublishableKey,
      paypalClientId: settings.paypalTestMode
        ? settings.paypalTestClientId
        : settings.paypalClientId,
      currency: settings.currency,
      depositType: settings.depositType,
      depositValue: settings.depositValue,
      requireDeposit: settings.requireDeposit,
      allowFullPayment: settings.allowFullPayment,
      paymentDescription: settings.paymentDescription,
    });
  } catch (error) {
    console.error("Error fetching public payment settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment settings" },
      { status: 500 }
    );
  }
}
