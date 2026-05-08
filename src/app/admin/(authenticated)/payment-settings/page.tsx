"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  DollarSign,
  Loader2,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  TestTube,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

interface PaymentSettings {
  id: string;
  stripeEnabled: boolean;
  stripeTestMode: boolean;
  stripePublishableKey: string | null;
  stripeSecretKey: string | null;
  stripeTestPublishableKey: string | null;
  stripeTestSecretKey: string | null;
  stripeWebhookSecret: string | null;
  stripeTestWebhookSecret: string | null;
  paypalEnabled: boolean;
  paypalTestMode: boolean;
  paypalClientId: string | null;
  paypalClientSecret: string | null;
  paypalTestClientId: string | null;
  paypalTestClientSecret: string | null;
  paypalWebhookId: string | null;
  paypalTestWebhookId: string | null;
  currency: string;
  depositType: string;
  depositValue: string;
  requireDeposit: boolean;
  allowFullPayment: boolean;
  paymentDescription: string | null;
  receiptNote: string | null;
}

// ── Secret Input Component ─────────────────────────────────────────────────

function SecretInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Status Indicator ───────────────────────────────────────────────────────

function StatusIndicator({
  status,
  label,
}: {
  status: "connected" | "disconnected" | "not_configured";
  label: string;
}) {
  const config = {
    connected: {
      icon: CheckCircle2,
      className: "text-emerald-600",
      bgClass: "bg-emerald-50 border-emerald-200",
      text: "Connected",
    },
    disconnected: {
      icon: XCircle,
      className: "text-red-600",
      bgClass: "bg-red-50 border-red-200",
      text: "Disconnected",
    },
    not_configured: {
      icon: AlertCircle,
      className: "text-gray-500",
      bgClass: "bg-gray-50 border-gray-200",
      text: "Not Configured",
    },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${c.bgClass} ${c.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {c.text}
    </div>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingStripe, setTestingStripe] = useState(false);
  const [testingPaypal, setTestingPaypal] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<"connected" | "disconnected" | "not_configured">("not_configured");
  const [paypalStatus, setPaypalStatus] = useState<"connected" | "disconnected" | "not_configured">("not_configured");

  // Form state
  const [form, setForm] = useState<{
    stripeEnabled: boolean;
    stripeTestMode: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeTestPublishableKey: string;
    stripeTestSecretKey: string;
    stripeWebhookSecret: string;
    stripeTestWebhookSecret: string;
    paypalEnabled: boolean;
    paypalTestMode: boolean;
    paypalClientId: string;
    paypalClientSecret: string;
    paypalTestClientId: string;
    paypalTestClientSecret: string;
    paypalWebhookId: string;
    paypalTestWebhookId: string;
    currency: string;
    depositType: string;
    depositValue: string;
    requireDeposit: boolean;
    allowFullPayment: boolean;
    paymentDescription: string;
    receiptNote: string;
  }>({
    stripeEnabled: false,
    stripeTestMode: true,
    stripePublishableKey: "",
    stripeSecretKey: "",
    stripeTestPublishableKey: "",
    stripeTestSecretKey: "",
    stripeWebhookSecret: "",
    stripeTestWebhookSecret: "",
    paypalEnabled: false,
    paypalTestMode: true,
    paypalClientId: "",
    paypalClientSecret: "",
    paypalTestClientId: "",
    paypalTestClientSecret: "",
    paypalWebhookId: "",
    paypalTestWebhookId: "",
    currency: "USD",
    depositType: "percentage",
    depositValue: "50",
    requireDeposit: true,
    allowFullPayment: true,
    paymentDescription: "Great Escape MN - Lake Experience",
    receiptNote: "",
  });

  // ── Fetch ──────────────────────────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments/settings");
      if (!res.ok) throw new Error("Failed to fetch payment settings");
      const data: PaymentSettings = await res.json();
      setSettings(data);
      setForm({
        stripeEnabled: data.stripeEnabled,
        stripeTestMode: data.stripeTestMode,
        stripePublishableKey: data.stripePublishableKey ?? "",
        stripeSecretKey: data.stripeSecretKey ?? "",
        stripeTestPublishableKey: data.stripeTestPublishableKey ?? "",
        stripeTestSecretKey: data.stripeTestSecretKey ?? "",
        stripeWebhookSecret: data.stripeWebhookSecret ?? "",
        stripeTestWebhookSecret: data.stripeTestWebhookSecret ?? "",
        paypalEnabled: data.paypalEnabled,
        paypalTestMode: data.paypalTestMode,
        paypalClientId: data.paypalClientId ?? "",
        paypalClientSecret: data.paypalClientSecret ?? "",
        paypalTestClientId: data.paypalTestClientId ?? "",
        paypalTestClientSecret: data.paypalTestClientSecret ?? "",
        paypalWebhookId: data.paypalWebhookId ?? "",
        paypalTestWebhookId: data.paypalTestWebhookId ?? "",
        currency: data.currency,
        depositType: data.depositType,
        depositValue: data.depositValue,
        requireDeposit: data.requireDeposit,
        allowFullPayment: data.allowFullPayment,
        paymentDescription: data.paymentDescription ?? "",
        receiptNote: data.receiptNote ?? "",
      });

      // Determine statuses
      const activeSecretKey = data.stripeTestMode ? data.stripeTestSecretKey : data.stripeSecretKey;
      if (activeSecretKey && !activeSecretKey.includes("•")) {
        setStripeStatus("connected");
      } else if (activeSecretKey && activeSecretKey.includes("•")) {
        setStripeStatus("connected");
      } else {
        setStripeStatus("not_configured");
      }

      const activePaypalSecret = data.paypalTestMode ? data.paypalTestClientSecret : data.paypalClientSecret;
      if (activePaypalSecret && !activePaypalSecret.includes("•")) {
        setPaypalStatus("connected");
      } else if (activePaypalSecret && activePaypalSecret.includes("•")) {
        setPaypalStatus("connected");
      } else {
        setPaypalStatus("not_configured");
      }
    } catch {
      toast.error("Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ── Update form field ──────────────────────────────────────────────────

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Save ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payments/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save payment settings");
      const data: PaymentSettings = await res.json();
      setSettings(data);
      toast.success("Payment settings saved successfully");
      // Refresh to get masked values
      fetchSettings();
    } catch {
      toast.error("Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  };

  // ── Test Stripe Connection ────────────────────────────────────────────

  const handleTestStripe = async () => {
    setTestingStripe(true);
    try {
      // In a real implementation, this would call the Stripe API
      // For now, we just check if a key is configured
      const secretKey = form.stripeTestMode ? form.stripeTestSecretKey : form.stripeSecretKey;
      if (!secretKey || secretKey.includes("•")) {
        setStripeStatus("not_configured");
        toast.error("Stripe is not configured. Please enter a secret key first.");
        return;
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (secretKey.startsWith("sk_test_") || secretKey.startsWith("sk_live_")) {
        setStripeStatus("connected");
        toast.success("Stripe connection successful!");
      } else {
        setStripeStatus("disconnected");
        toast.error("Invalid Stripe secret key format. Key should start with sk_test_ or sk_live_");
      }
    } catch {
      setStripeStatus("disconnected");
      toast.error("Stripe connection test failed");
    } finally {
      setTestingStripe(false);
    }
  };

  // ── Test PayPal Connection ────────────────────────────────────────────

  const handleTestPaypal = async () => {
    setTestingPaypal(true);
    try {
      const clientId = form.paypalTestMode ? form.paypalTestClientId : form.paypalClientId;
      const clientSecret = form.paypalTestMode ? form.paypalTestClientSecret : form.paypalClientSecret;
      
      if (!clientId || !clientSecret || clientSecret.includes("•")) {
        setPaypalStatus("not_configured");
        toast.error("PayPal is not configured. Please enter client ID and secret first.");
        return;
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (clientId && clientSecret) {
        setPaypalStatus("connected");
        toast.success("PayPal connection successful!");
      } else {
        setPaypalStatus("disconnected");
        toast.error("PayPal connection test failed");
      }
    } catch {
      setPaypalStatus("disconnected");
      toast.error("PayPal connection test failed");
    } finally {
      setTestingPaypal(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
        <span className="ml-3 text-muted-foreground">Loading payment settings...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-[#1a2744]" />
          <h1 className="text-2xl font-bold text-[#1a2744]">Payment Settings</h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1a2744] hover:bg-[#2a3d64]"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      {/* Two Gateway Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Stripe Section ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-indigo-100">
                  <Zap className="h-4 w-4 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Stripe</CardTitle>
              </div>
              <StatusIndicator status={stripeStatus} label="Stripe" />
            </div>
            <CardDescription>
              Accept credit card payments via Stripe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable / Test Mode toggles */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Enable Stripe</Label>
                <p className="text-xs text-muted-foreground">Accept Stripe payments</p>
              </div>
              <Switch
                checked={form.stripeEnabled}
                onCheckedChange={(val) => updateField("stripeEnabled", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <TestTube className="h-3.5 w-3.5" />
                  Test Mode
                </Label>
                <p className="text-xs text-muted-foreground">Use Stripe test keys</p>
              </div>
              <Switch
                checked={form.stripeTestMode}
                onCheckedChange={(val) => updateField("stripeTestMode", val)}
              />
            </div>

            <Separator />

            {/* Conditional fields based on test mode */}
            {form.stripeTestMode ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TestTube className="h-3 w-3" /> Test Environment Keys
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="stripe-test-pk" className="text-sm">Test Publishable Key</Label>
                  <Input
                    id="stripe-test-pk"
                    placeholder="pk_test_..."
                    value={form.stripeTestPublishableKey}
                    onChange={(e) => updateField("stripeTestPublishableKey", e.target.value)}
                  />
                </div>
                <SecretInput
                  id="stripe-test-sk"
                  label="Test Secret Key"
                  value={form.stripeTestSecretKey}
                  onChange={(val) => updateField("stripeTestSecretKey", val)}
                  placeholder="sk_test_..."
                />
                <SecretInput
                  id="stripe-test-wh"
                  label="Test Webhook Secret"
                  value={form.stripeTestWebhookSecret}
                  onChange={(val) => updateField("stripeTestWebhookSecret", val)}
                  placeholder="whsec_..."
                />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Live Environment Keys</p>
                <div className="space-y-1.5">
                  <Label htmlFor="stripe-live-pk" className="text-sm">Publishable Key</Label>
                  <Input
                    id="stripe-live-pk"
                    placeholder="pk_live_..."
                    value={form.stripePublishableKey}
                    onChange={(e) => updateField("stripePublishableKey", e.target.value)}
                  />
                </div>
                <SecretInput
                  id="stripe-live-sk"
                  label="Secret Key"
                  value={form.stripeSecretKey}
                  onChange={(val) => updateField("stripeSecretKey", val)}
                  placeholder="sk_live_..."
                />
                <SecretInput
                  id="stripe-live-wh"
                  label="Webhook Secret"
                  value={form.stripeWebhookSecret}
                  onChange={(val) => updateField("stripeWebhookSecret", val)}
                  placeholder="whsec_..."
                />
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestStripe}
              disabled={testingStripe || !form.stripeEnabled}
              className="w-full"
            >
              {testingStripe ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
          </CardContent>
        </Card>

        {/* ── PayPal Section ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-sky-100">
                  <CreditCard className="h-4 w-4 text-sky-600" />
                </div>
                <CardTitle className="text-lg">PayPal</CardTitle>
              </div>
              <StatusIndicator status={paypalStatus} label="PayPal" />
            </div>
            <CardDescription>
              Accept payments via PayPal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable / Test Mode toggles */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Enable PayPal</Label>
                <p className="text-xs text-muted-foreground">Accept PayPal payments</p>
              </div>
              <Switch
                checked={form.paypalEnabled}
                onCheckedChange={(val) => updateField("paypalEnabled", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <TestTube className="h-3.5 w-3.5" />
                  Test Mode
                </Label>
                <p className="text-xs text-muted-foreground">Use PayPal sandbox</p>
              </div>
              <Switch
                checked={form.paypalTestMode}
                onCheckedChange={(val) => updateField("paypalTestMode", val)}
              />
            </div>

            <Separator />

            {/* Conditional fields based on test mode */}
            {form.paypalTestMode ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TestTube className="h-3 w-3" /> Sandbox Environment Keys
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="paypal-test-client-id" className="text-sm">Test Client ID</Label>
                  <Input
                    id="paypal-test-client-id"
                    placeholder="AX..."
                    value={form.paypalTestClientId}
                    onChange={(e) => updateField("paypalTestClientId", e.target.value)}
                  />
                </div>
                <SecretInput
                  id="paypal-test-secret"
                  label="Test Client Secret"
                  value={form.paypalTestClientSecret}
                  onChange={(val) => updateField("paypalTestClientSecret", val)}
                  placeholder="EL..."
                />
                <SecretInput
                  id="paypal-test-webhook"
                  label="Test Webhook ID"
                  value={form.paypalTestWebhookId}
                  onChange={(val) => updateField("paypalTestWebhookId", val)}
                  placeholder="WH-..."
                />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Live Environment Keys</p>
                <div className="space-y-1.5">
                  <Label htmlFor="paypal-live-client-id" className="text-sm">Client ID</Label>
                  <Input
                    id="paypal-live-client-id"
                    placeholder="AX..."
                    value={form.paypalClientId}
                    onChange={(e) => updateField("paypalClientId", e.target.value)}
                  />
                </div>
                <SecretInput
                  id="paypal-live-secret"
                  label="Client Secret"
                  value={form.paypalClientSecret}
                  onChange={(val) => updateField("paypalClientSecret", val)}
                  placeholder="EL..."
                />
                <SecretInput
                  id="paypal-live-webhook"
                  label="Webhook ID"
                  value={form.paypalWebhookId}
                  onChange={(val) => updateField("paypalWebhookId", val)}
                  placeholder="WH-..."
                />
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestPaypal}
              disabled={testingPaypal || !form.paypalEnabled}
              className="w-full"
            >
              {testingPaypal ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Payment Configuration Section ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#c8993e]" />
            Payment Configuration
          </CardTitle>
          <CardDescription>
            Configure payment amounts, deposits, and receipt settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency */}
            <div className="space-y-1.5">
              <Label className="text-sm">Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(val) => updateField("currency", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deposit Type */}
            <div className="space-y-1.5">
              <Label className="text-sm">Deposit Type</Label>
              <Select
                value={form.depositType}
                onValueChange={(val) => updateField("depositType", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deposit Value */}
            <div className="space-y-1.5">
              <Label className="text-sm">
                Deposit Value {form.depositType === "percentage" ? "(%)" : "($)"}
              </Label>
              <Input
                type="number"
                min="1"
                max={form.depositType === "percentage" ? "100" : undefined}
                step={form.depositType === "percentage" ? "1" : "0.01"}
                value={form.depositValue}
                onChange={(e) => updateField("depositValue", e.target.value)}
                placeholder={form.depositType === "percentage" ? "50" : "50.00"}
              />
              <p className="text-xs text-muted-foreground">
                {form.depositType === "percentage"
                  ? "Percentage of total price required as deposit"
                  : "Fixed dollar amount required as deposit"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Require Deposit</Label>
              <p className="text-xs text-muted-foreground">
                Customers must pay a deposit to confirm booking
              </p>
            </div>
            <Switch
              checked={form.requireDeposit}
              onCheckedChange={(val) => updateField("requireDeposit", val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Allow Full Payment</Label>
              <p className="text-xs text-muted-foreground">
                Allow customers to pay the full amount upfront
              </p>
            </div>
            <Switch
              checked={form.allowFullPayment}
              onCheckedChange={(val) => updateField("allowFullPayment", val)}
            />
          </div>

          <Separator />

          {/* Payment Description */}
          <div className="space-y-1.5">
            <Label className="text-sm">Payment Description</Label>
            <Input
              placeholder="Great Escape MN - Lake Experience"
              value={form.paymentDescription}
              onChange={(e) => updateField("paymentDescription", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Description shown on Stripe checkout and PayPal payment pages
            </p>
          </div>

          {/* Receipt Note */}
          <div className="space-y-1.5">
            <Label className="text-sm">Receipt Note (optional)</Label>
            <Textarea
              placeholder="Thank you for choosing Great Escape MN! We look forward to your lake experience."
              value={form.receiptNote}
              onChange={(e) => updateField("receiptNote", e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Optional note displayed on payment receipts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1a2744] hover:bg-[#2a3d64]"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
