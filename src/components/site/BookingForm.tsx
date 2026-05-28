"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  CheckCircle2,
  Loader2,
  CreditCard,
  Shield,
  Info,
  CalendarDays,
} from "lucide-react";
import { usePackages, usePaymentSettings } from "@/hooks/use-site-data";
import { useLakes } from "@/hooks/use-site-data";

const occasions = [
  "Date Night",
  "Anniversary",
  "Birthday",
  "Bachelorette",
  "Family Outing",
  "Fishing Trip",
  "Friends Day",
  "Other",
];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplayDate(value: string) {
  const date = fromDateKey(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function BookingForm() {
  const searchParams = useSearchParams();
  const { packages, loading: packagesLoading } = usePackages();
  const { lakes, loading: lakesLoading } = useLakes();
  const { paymentSettings } = usePaymentSettings();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paying, setPaying] = useState<"stripe" | "paypal" | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    packageSlug: "",
    preferredLake: "",
    preferredDate: "",
    preferredTime: "",
    passengers: "",
    occasion: "",
    fishingGear: false,
    tubing: false,
    byob: false,
    decorations: false,
    needHelpPlanning: false,
    message: "",
    waiverAccepted: false,
    waiverSignature: "",
  });

  useEffect(() => {
    const pkg = searchParams.get("package");
    if (pkg) {
      setForm((prev) => ({ ...prev, packageSlug: pkg }));
    }
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setSubmitted(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/public/availability")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { unavailableDates?: string[] } | null) => {
        if (cancelled) return;
        setUnavailableDates(data?.unavailableDates || []);
      })
      .catch(() => {
        if (!cancelled) setUnavailableDates([]);
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = (name: string, checked: boolean) => {
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.waiverAccepted || !form.waiverSignature.trim()) {
      alert("Please accept and sign the damage responsibility waiver.");
      return;
    }
    if (!form.preferredDate) {
      alert("Please choose an available date from the calendar.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          passengers: form.passengers ? parseInt(form.passengers) : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookingId(data.bookingId || data.id || null);
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "That date is not available. Please choose another date.");
      }
    } catch {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (gateway: "stripe" | "paypal", paymentType: "deposit" | "full") => {
    if (!bookingId) return;
    setPaying(gateway);

    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, paymentType, gateway }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If payment fails (e.g., no quoted price), show a friendly message
        alert(data.error || "Payment is not available yet. We'll send you a payment link after confirming your booking.");
        setPaying(null);
        return;
      }

      if (gateway === "stripe" && data.sessionId) {
        // Redirect to Stripe Checkout
        const stripeUrl = new URL("/api/payments/stripe-redirect", window.location.origin);
        stripeUrl.searchParams.set("session_id", data.sessionId);
        window.location.href = stripeUrl.toString();
      } else if (gateway === "paypal" && data.approvalUrl) {
        // Redirect to PayPal
        window.location.href = data.approvalUrl;
      }
    } catch {
      alert("Something went wrong. Please try again later.");
    } finally {
      setPaying(null);
    }
  };

  const hasPaymentEnabled = paymentSettings?.stripeEnabled || paymentSettings?.paypalEnabled;
  const activePackages = packages.filter((pkg) => pkg.isActive);
  const activeLakes = lakes.filter((lake) => lake.isActive);
  const unavailableDateSet = new Set(unavailableDates);
  const selectedDate = form.preferredDate
    ? fromDateKey(form.preferredDate)
    : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (submitted) {
    return (
      <section id="booking" className="py-20 sm:py-28 bg-[#faf8f0]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center bg-white rounded-2xl shadow-lg p-10 sm:p-14"
          >
            <div className="bg-[#2d5a3d]/10 rounded-full p-4 w-fit mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-[#2d5a3d]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1a2744] mb-4">
              Thank You!
            </h3>
            <p className="text-[#2a3d64]/60 leading-relaxed mb-6">
              Your booking request has been received. A Great Escape will
              contact you shortly to confirm availability, final pricing, and
              details.
            </p>

            {hasPaymentEnabled && (
              <>
                <Separator className="my-6" />
                <div className="bg-[#1a2744]/5 rounded-xl p-6 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-5 w-5 text-[#1a2744]" />
                    <h4 className="font-semibold text-[#1a2744]">Payment Options</h4>
                  </div>
                  <p className="text-sm text-[#2a3d64]/70 mb-4">
                    Once we confirm your booking and set the final price, you&apos;ll receive a payment link via email. You can also try paying now if a price has been quoted.
                  </p>

                  <div className="space-y-3">
                    {paymentSettings?.stripeEnabled && (
                      <Button
                        onClick={() => handlePayment("stripe", paymentSettings.requireDeposit ? "deposit" : "full")}
                        disabled={paying !== null}
                        className="w-full bg-[#635BFF] hover:bg-[#5248e0] text-white gap-2"
                        size="lg"
                      >
                        {paying === "stripe" ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <CreditCard className="h-5 w-5" />
                        )}
                        Pay with Stripe
                        {paymentSettings.requireDeposit && paymentSettings.depositValue && (
                          <span className="text-xs opacity-80 ml-1">
                            ({paymentSettings.depositType === "percentage" ? `${paymentSettings.depositValue}% deposit` : `$${paymentSettings.depositValue} deposit`})
                          </span>
                        )}
                      </Button>
                    )}
                    {paymentSettings?.paypalEnabled && (
                      <Button
                        onClick={() => handlePayment("paypal", paymentSettings.requireDeposit ? "deposit" : "full")}
                        disabled={paying !== null}
                        className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white gap-2"
                        size="lg"
                      >
                        {paying === "paypal" ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <CreditCard className="h-5 w-5" />
                        )}
                        Pay with PayPal
                        {paymentSettings.requireDeposit && paymentSettings.depositValue && (
                          <span className="text-xs opacity-80 ml-1">
                            ({paymentSettings.depositType === "percentage" ? `${paymentSettings.depositValue}% deposit` : `$${paymentSettings.depositValue} deposit`})
                          </span>
                        )}
                      </Button>
                    )}
                  </div>

                  {paymentSettings?.allowFullPayment && paymentSettings.requireDeposit && (
                    <p className="text-xs text-[#2a3d64]/50 mt-3 text-center">
                      You can also pay in full after confirmation
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-4 text-xs text-[#2a3d64]/50">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment • Your data is encrypted and protected</span>
                  </div>
                </div>
              </>
            )}

            {!hasPaymentEnabled && (
              <p className="text-sm text-[#2a3d64]/50 mt-4">
                Payment options will be available after booking confirmation.
              </p>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-20 sm:py-28 bg-[#faf8f0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#c8993e]/10 border border-[#c8993e]/20 rounded-full px-4 py-1.5 text-[#c8993e] text-sm font-medium mb-4">
              Book Your Experience
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2744] mb-4">
              Request a Booking
            </h2>
            <p className="text-lg text-[#2a3d64]/60 max-w-2xl mx-auto">
              Fill out the form below and we&apos;ll get back to you to confirm
              availability and details.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#1a2744] text-white p-6 sm:p-8">
              <CardTitle className="text-xl sm:text-2xl font-bold">
                Booking Request Form
              </CardTitle>
              <CardDescription className="text-white/60">
                All fields help us prepare the best experience for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="border-[#1a2744]/10 focus:border-[#c8993e] focus:ring-[#c8993e]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="border-[#1a2744]/10 focus:border-[#c8993e] focus:ring-[#c8993e]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="(555) 123-4567"
                      className="border-[#1a2744]/10 focus:border-[#c8993e] focus:ring-[#c8993e]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengers">Number of Passengers</Label>
                    <Input
                      id="passengers"
                      name="passengers"
                      type="number"
                      min="1"
                      max="6"
                      value={form.passengers}
                      onChange={handleChange}
                      placeholder="Up to 6"
                      className="border-[#1a2744]/10 focus:border-[#c8993e] focus:ring-[#c8993e]/20"
                    />
                  </div>
                </div>

                {/* Package & Lake */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preferred Package *</Label>
                    <Select
                      value={form.packageSlug}
                      disabled={packagesLoading}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, packageSlug: value }))
                      }
                    >
                      <SelectTrigger className="w-full border-[#1a2744]/10 focus:border-[#c8993e] focus:ring-[#c8993e]/20">
                        <SelectValue
                          placeholder={
                            packagesLoading
                              ? "Loading experiences..."
                              : "Select an experience"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {activePackages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.slug}>
                            {pkg.title}
                          </SelectItem>
                        ))}
                        {activePackages.length === 0 && !packagesLoading && (
                          <SelectItem value="custom-experience">
                            Custom private cruise
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Lake</Label>
                    <Select
                      value={form.preferredLake}
                      disabled={lakesLoading}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          preferredLake: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full border-[#1a2744]/10 focus:border-[#c8993e] focus:ring-[#c8993e]/20">
                        <SelectValue
                          placeholder={
                            lakesLoading ? "Loading lakes..." : "Select a lake"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {activeLakes.map((lake) => (
                          <SelectItem key={lake.id} value={lake.name}>
                            {lake.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other / Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="flex items-center gap-2 text-base font-semibold text-[#1a2744]">
                        <CalendarDays className="h-4 w-4 text-[#c8993e]" />
                        Choose an Available Date *
                      </Label>
                      <p className="mt-1 text-sm text-[#2a3d64]/60">
                        Dates already booked are grayed out and cannot be selected.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#1a2744]/10 bg-white p-2 shadow-sm">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        disabled={(date) => {
                          const normalized = new Date(date);
                          normalized.setHours(0, 0, 0, 0);
                          return (
                            normalized < today ||
                            unavailableDateSet.has(toDateKey(normalized))
                          );
                        }}
                        onSelect={(date) => {
                          if (!date) return;
                          setForm((prev) => ({
                            ...prev,
                            preferredDate: toDateKey(date),
                          }));
                        }}
                        className="mx-auto w-full"
                        classNames={{
                          root: "w-full",
                          month: "w-full",
                          table: "w-full border-collapse",
                          day: "relative w-full h-full p-0 text-center aspect-square select-none",
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#2a3d64]/60">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-[#1a2744]" />
                        Selected
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full border border-[#1a2744]/20 bg-white" />
                        Available
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-gray-200" />
                        Booked / unavailable
                      </span>
                    </div>
                    {availabilityLoading && (
                      <p className="text-sm text-[#2a3d64]/50">
                        Loading latest availability...
                      </p>
                    )}
                    {form.preferredDate && (
                      <p className="rounded-xl bg-[#2d5a3d]/10 px-4 py-3 text-sm font-medium text-[#2d5a3d]">
                        Selected date: {formatDisplayDate(form.preferredDate)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="preferredTime">Preferred Time</Label>
                    <Input
                      id="preferredTime"
                      name="preferredTime"
                      type="time"
                      value={form.preferredTime}
                      onChange={handleChange}
                      className="border-[#1a2744]/10 focus:border-[#c8993e] focus:ring-[#c8993e]/20"
                    />
                    </div>
                    <div className="space-y-2">
                    <Label>Special Occasion?</Label>
                    <Select
                      value={form.occasion}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, occasion: value }))
                      }
                    >
                      <SelectTrigger className="w-full border-[#1a2744]/10 focus:border-[#c8993e] focus:ring-[#c8993e]/20">
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        {occasions.map((occ) => (
                          <SelectItem key={occ} value={occ}>
                            {occ}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                    <div className="rounded-xl border border-[#c8993e]/25 bg-[#c8993e]/5 p-4 text-sm text-[#2a3d64]/70">
                      Your date is a request until A Great Escape confirms the
                      booking. Confirmed and pending bookings are automatically
                      removed from availability.
                    </div>
                  </div>
                </div>

                {/* Add-ons */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-[#1a2744]">
                    Add-ons & Requests
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: "fishingGear",
                        label: "Fishing gear needed?",
                        name: "fishingGear",
                      },
                      {
                        id: "tubing",
                        label: "Tubing / pull-behind requested?",
                        name: "tubing",
                      },
                      {
                        id: "byob",
                        label: "BYOB / cooler planned?",
                        name: "byob",
                      },
                      {
                        id: "decorations",
                        label: "Decorations planned?",
                        name: "decorations",
                      },
                      {
                        id: "needHelpPlanning",
                        label: "Need help planning the experience?",
                        name: "needHelpPlanning",
                      },
                    ].map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={addon.id}
                          checked={form[addon.name as keyof typeof form] as boolean}
                          onCheckedChange={(checked) =>
                            handleCheckbox(addon.name, checked as boolean)
                          }
                          className="border-[#1a2744]/20 data-[state=checked]:bg-[#c8993e] data-[state=checked]:border-[#c8993e]"
                        />
                        <Label
                          htmlFor={addon.id}
                          className="text-sm font-normal text-[#2a3d64]/70 cursor-pointer"
                        >
                          {addon.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message / Special Notes</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any special requests, questions, or notes for your experience..."
                    className="border-[#1a2744]/10 focus:border-[#c8993e] focus:ring-[#c8993e]/20 resize-none"
                  />
                </div>

                {/* Waiver */}
                <div className="rounded-xl border border-[#c8993e]/25 bg-[#c8993e]/5 p-4 sm:p-5 space-y-4">
                  <div>
                    <Label className="text-base font-semibold text-[#1a2744]">
                      Damage Responsibility Waiver *
                    </Label>
                    <p className="mt-2 text-sm leading-relaxed text-[#2a3d64]/70">
                      I understand that I am responsible for any damage I or my
                      guests cause to the boat, equipment, or property during
                      the experience. I agree to follow captain instructions,
                      lake rules, and safety requirements.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="waiverAccepted"
                      checked={form.waiverAccepted}
                      onCheckedChange={(checked) =>
                        handleCheckbox("waiverAccepted", checked as boolean)
                      }
                      required
                      className="mt-1 border-[#1a2744]/20 data-[state=checked]:bg-[#c8993e] data-[state=checked]:border-[#c8993e]"
                    />
                    <Label
                      htmlFor="waiverAccepted"
                      className="text-sm font-normal text-[#2a3d64]/75 cursor-pointer"
                    >
                      I have read and agree to the damage responsibility waiver.
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waiverSignature">
                      Type your full name as your signature *
                    </Label>
                    <Input
                      id="waiverSignature"
                      name="waiverSignature"
                      value={form.waiverSignature}
                      onChange={handleChange}
                      required
                      placeholder="Full legal name"
                      className="border-[#1a2744]/10 focus:border-[#c8993e] focus:ring-[#c8993e]/20"
                    />
                  </div>
                </div>

                {/* Payment info note */}
                {hasPaymentEnabled && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#c8993e]/5 border border-[#c8993e]/20">
                    <Info className="h-5 w-5 text-[#c8993e] shrink-0 mt-0.5" />
                    <div className="text-sm text-[#2a3d64]/70">
                      <p className="font-medium text-[#1a2744] mb-1">Payment Information</p>
                      <p>
                        After submitting your booking request, we&apos;ll confirm availability and pricing.
                        {paymentSettings?.requireDeposit
                          ? ` A ${paymentSettings.depositType === "percentage" ? `${paymentSettings.depositValue}%` : `$${paymentSettings.depositValue}`} deposit is required to confirm your booking.`
                          : " Payment is required to confirm your booking."}
                        {" "}Secure payment via {paymentSettings?.stripeEnabled ? "Stripe" : ""}
                        {paymentSettings?.stripeEnabled && paymentSettings?.paypalEnabled ? " or " : ""}
                        {paymentSettings?.paypalEnabled ? "PayPal" : ""}.
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-[#c8993e] hover:bg-[#b8892e] text-white font-semibold text-lg py-6 shadow-xl shadow-[#c8993e]/20 transition-all hover:shadow-2xl gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Booking Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
