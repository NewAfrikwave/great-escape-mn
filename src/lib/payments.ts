import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";
import { db } from "./db";

export async function getPaymentSettings() {
  let settings = await db.paymentSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await db.paymentSettings.create({
      data: { id: "default" },
    });
  }

  return settings;
}

export function getStripeClient(settings: Awaited<ReturnType<typeof getPaymentSettings>>): Stripe {
  const secretKey = settings.stripeTestMode
    ? settings.stripeTestSecretKey || ""
    : settings.stripeSecretKey || "";

  return new Stripe(secretKey);
}

export function getPayPalClient(settings: Awaited<ReturnType<typeof getPaymentSettings>>): paypal.core.PayPalHttpClient {
  const clientId = settings.paypalTestMode
    ? settings.paypalTestClientId || ""
    : settings.paypalClientId || "";

  const clientSecret = settings.paypalTestMode
    ? settings.paypalTestClientSecret || ""
    : settings.paypalClientSecret || "";

  const environment = settings.paypalTestMode
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
}

export function calculateDepositAmount(
  totalCents: number,
  settings: Awaited<ReturnType<typeof getPaymentSettings>>
): number {
  if (settings.depositType === "percentage") {
    const percentage = parseFloat(settings.depositValue) || 0;
    return Math.round((totalCents * percentage) / 100);
  } else {
    // Fixed amount - depositValue is in dollars
    const fixedCents = Math.round((parseFloat(settings.depositValue) || 0) * 100);
    return Math.min(fixedCents, totalCents);
  }
}

export function formatAmount(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

export function maskSecret(key: string | null | undefined): string {
  if (!key) return "";
  if (key.length <= 4) return "****";
  return "****" + key.slice(-4);
}
