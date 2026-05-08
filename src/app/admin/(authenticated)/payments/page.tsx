"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Search,
  Loader2,
  DollarSign,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowUpRight,
  Mail,
  Package,
  MapPin,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

interface BookingInfo {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  packageSlug: string | null;
  preferredLake: string | null;
  preferredDate: string | null;
}

interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  gatewayPaymentId: string | null;
  gatewayChargeId: string | null;
  gatewayRefundId: string | null;
  paymentType: string;
  refundAmount: number;
  refundReason: string | null;
  metadata: string;
  customerEmail: string | null;
  customerName: string | null;
  description: string | null;
  receiptUrl: string | null;
  failureReason: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking: BookingInfo;
}

type StatusOption = "all" | "pending" | "processing" | "completed" | "failed" | "refunded" | "partially_refunded" | "cancelled";
type GatewayOption = "all" | "stripe" | "paypal";

// ── Helpers ────────────────────────────────────────────────────────────────

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
  refunded: {
    label: "Refunded",
    className: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100",
  },
  partially_refunded: {
    label: "Partial Refund",
    className: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
  },
};

function PaymentStatusBadge({ status }: { status: string }) {
  const config = PAYMENT_STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function GatewayBadge({ gateway }: { gateway: string }) {
  if (gateway === "stripe") {
    return (
      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50">
        Stripe
      </Badge>
    );
  }
  if (gateway === "paypal") {
    return (
      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50">
        PayPal
      </Badge>
    );
  }
  return <Badge variant="outline">{gateway}</Badge>;
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function slugToTitle(slug: string | null): string {
  if (!slug) return "—";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Page Component ─────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusOption>("all");
  const [gatewayFilter, setGatewayFilter] = useState<GatewayOption>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Refund state
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [refundAmountDollars, setRefundAmountDollars] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);
  const [refunding, setRefunding] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (gatewayFilter !== "all") params.set("gateway", gatewayFilter);

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data: Payment[] = await res.json();
      setPayments(data);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, gatewayFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ── Filter ─────────────────────────────────────────────────────────────

  const filtered = payments.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = (p.customerName ?? p.booking?.fullName ?? "").toLowerCase().includes(q);
      const emailMatch = (p.customerEmail ?? p.booking?.email ?? "").toLowerCase().includes(q);
      return nameMatch || emailMatch;
    }
    return true;
  });

  // ── Summary Stats ──────────────────────────────────────────────────────

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const completedCount = payments.filter((p) => p.status === "completed").length;
  const pendingCount = payments.filter((p) => p.status === "pending" || p.status === "processing").length;
  const refundedAmount = payments
    .filter((p) => p.status === "refunded" || p.status === "partially_refunded")
    .reduce((sum, p) => sum + p.refundAmount, 0);

  // ── Open detail ────────────────────────────────────────────────────────

  const openDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundType("full");
    setRefundAmountDollars("");
    setRefundReason("");
    setDetailOpen(true);
  };

  // ── Handle refund ──────────────────────────────────────────────────────

  const handleRefund = async () => {
    if (!selectedPayment) return;
    setRefunding(true);
    try {
      const body: { action: string; amount?: number; reason?: string } = {
        action: "refund",
      };

      if (refundType === "partial") {
        const amount = parseFloat(refundAmountDollars);
        if (!amount || amount <= 0) {
          toast.error("Please enter a valid refund amount");
          setRefunding(false);
          return;
        }
        const maxRefund = (selectedPayment.amount - selectedPayment.refundAmount) / 100;
        if (amount > maxRefund) {
          toast.error(`Maximum refund amount is ${formatCurrency(selectedPayment.amount - selectedPayment.refundAmount)}`);
          setRefunding(false);
          return;
        }
        body.amount = amount;
      }

      if (refundReason.trim()) {
        body.reason = refundReason.trim();
      }

      const res = await fetch(`/api/admin/payments/${selectedPayment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Refund failed");
      }

      const updated: Payment = await res.json();
      setSelectedPayment(updated);
      setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setRefundConfirmOpen(false);
      toast.success(
        refundType === "full"
          ? "Full refund processed successfully"
          : `Partial refund of ${formatCurrency((body.amount ?? 0) * 100)} processed`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process refund");
    } finally {
      setRefunding(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-[#1a2744]" />
          <h1 className="text-2xl font-bold text-[#1a2744]">Payments</h1>
          <Badge className="bg-[#1a2744] text-white hover:bg-[#1a2744]">
            {payments.length}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
                <p className="text-lg font-bold text-[#1a2744]">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Completed</p>
                <p className="text-lg font-bold text-[#1a2744]">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending</p>
                <p className="text-lg font-bold text-[#1a2744]">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <RotateCcw className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Refunded</p>
                <p className="text-lg font-bold text-[#1a2744]">{formatCurrency(refundedAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Row */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as StatusOption)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={gatewayFilter}
              onValueChange={(val) => setGatewayFilter(val as GatewayOption)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gateways</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {filtered.length} Payment{filtered.length !== 1 ? "s" : ""}
            {statusFilter !== "all" && (
              <Badge variant="outline" className="ml-1 text-xs">
                {PAYMENT_STATUS_CONFIG[statusFilter]?.label ?? statusFilter}
              </Badge>
            )}
            {gatewayFilter !== "all" && (
              <Badge variant="outline" className="ml-1 text-xs">
                {gatewayFilter === "stripe" ? "Stripe" : "PayPal"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
              <span className="ml-3 text-muted-foreground">Loading payments...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CreditCard className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No payments found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {search || statusFilter !== "all" || gatewayFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Payments will appear here when customers make payments."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Customer</th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Amount</th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Type</th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Gateway</th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Booking</th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((payment) => (
                    <tr
                      key={payment.id}
                      onClick={() => openDetail(payment)}
                      className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium">{payment.customerName ?? payment.booking?.fullName ?? "—"}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {payment.customerEmail ?? payment.booking?.email ?? ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={
                            payment.paymentType === "deposit"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {payment.paymentType === "deposit" ? "Deposit" : "Full"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <GatewayBadge gateway={payment.gateway} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {slugToTitle(payment.booking?.packageSlug)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Detail Modal ──────────────────────────────────────────────── */}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <CreditCard className="h-5 w-5 text-[#1a2744]" />
                  Payment Details
                  <PaymentStatusBadge status={selectedPayment.status} />
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {/* Payment Info */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Amount</span>
                      </div>
                      <span className="text-sm font-bold">{formatCurrency(selectedPayment.amount)}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Gateway</span>
                      </div>
                      <GatewayBadge gateway={selectedPayment.gateway} />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Type</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          selectedPayment.paymentType === "deposit"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                      >
                        {selectedPayment.paymentType === "deposit" ? "Deposit" : "Full Payment"}
                      </Badge>
                    </div>
                    {selectedPayment.gatewayPaymentId && (
                      <div className="p-3 rounded-lg bg-muted/50 col-span-2 sm:col-span-3">
                        <span className="text-xs text-muted-foreground">Payment ID</span>
                        <p className="text-xs font-mono mt-0.5 break-all">{selectedPayment.gatewayPaymentId}</p>
                      </div>
                    )}
                    {selectedPayment.gatewayChargeId && (
                      <div className="p-3 rounded-lg bg-muted/50 col-span-2 sm:col-span-3">
                        <span className="text-xs text-muted-foreground">Charge ID</span>
                        <p className="text-xs font-mono mt-0.5 break-all">{selectedPayment.gatewayChargeId}</p>
                      </div>
                    )}
                    {selectedPayment.failureReason && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 col-span-2 sm:col-span-3">
                        <span className="text-xs text-red-600 font-medium">Failure Reason</span>
                        <p className="text-sm text-red-700 mt-0.5">{selectedPayment.failureReason}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Customer Info */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground">Name</span>
                      <p className="text-sm font-medium">
                        {selectedPayment.customerName ?? selectedPayment.booking?.fullName ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${selectedPayment.customerEmail ?? selectedPayment.booking?.email ?? ""}`}
                        className="text-sm text-[#1a2744] underline underline-offset-2 hover:text-[#c8993e] transition-colors truncate"
                      >
                        {selectedPayment.customerEmail ?? selectedPayment.booking?.email ?? "—"}
                      </a>
                    </div>
                  </div>
                </section>

                {/* Booking Info */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Booking Information
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Package</span>
                      </div>
                      <span className="text-sm font-medium">
                        {slugToTitle(selectedPayment.booking?.packageSlug)}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Lake</span>
                      </div>
                      <span className="text-sm font-medium">
                        {selectedPayment.booking?.preferredLake ?? "—"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Date</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatDate(selectedPayment.booking?.preferredDate)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Refund Section */}
                {(selectedPayment.status === "completed" || selectedPayment.status === "partially_refunded") && (
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      <RotateCcw className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                      Issue Refund
                    </h3>
                    {selectedPayment.refundAmount > 0 && (
                      <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 mb-3">
                        <span className="text-xs text-purple-600 font-medium">Already Refunded</span>
                        <p className="text-sm font-bold text-purple-700 mt-0.5">
                          {formatCurrency(selectedPayment.refundAmount)}
                        </p>
                        {selectedPayment.refundReason && (
                          <p className="text-xs text-purple-600 mt-1">Reason: {selectedPayment.refundReason}</p>
                        )}
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Refund Type:</Label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="refundType"
                              checked={refundType === "full"}
                              onChange={() => setRefundType("full")}
                              className="accent-[#1a2744]"
                            />
                            <span className="text-sm">Full Amount</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="refundType"
                              checked={refundType === "partial"}
                              onChange={() => setRefundType("partial")}
                              className="accent-[#1a2744]"
                            />
                            <span className="text-sm">Partial</span>
                          </label>
                        </div>
                      </div>
                      {refundType === "partial" && (
                        <div>
                          <Label className="text-sm">Refund Amount ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={(selectedPayment.amount - selectedPayment.refundAmount) / 100}
                            placeholder="0.00"
                            value={refundAmountDollars}
                            onChange={(e) => setRefundAmountDollars(e.target.value)}
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Maximum: {formatCurrency(selectedPayment.amount - selectedPayment.refundAmount)}
                          </p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm">Reason (optional)</Label>
                        <Input
                          placeholder="Reason for refund..."
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRefundConfirmOpen(true)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {refundType === "full" ? "Refund Full Amount" : "Refund Partial Amount"}
                      </Button>
                    </div>
                  </section>
                )}

                {/* Timeline */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Payment Created</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(selectedPayment.createdAt)}</p>
                      </div>
                    </div>
                    {selectedPayment.paidAt && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Payment Completed</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(selectedPayment.paidAt)}</p>
                        </div>
                      </div>
                    )}
                    {selectedPayment.refundedAt && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Refund Issued</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(selectedPayment.refundedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Receipt URL */}
                {selectedPayment.receiptUrl && (
                  <section>
                    <a
                      href={selectedPayment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1a2744] underline underline-offset-2 hover:text-[#c8993e] transition-colors"
                    >
                      View Receipt →
                    </a>
                  </section>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Refund Confirmation Dialog ────────────────────────────────── */}

      <Dialog open={refundConfirmOpen} onOpenChange={setRefundConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Refund
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to refund{" "}
            <span className="font-semibold text-foreground">
              {refundType === "full"
                ? formatCurrency(selectedPayment ? selectedPayment.amount - selectedPayment.refundAmount : 0)
                : formatCurrency((parseFloat(refundAmountDollars) || 0) * 100)}
            </span>
            {" "}from this {selectedPayment?.gateway === "stripe" ? "Stripe" : "PayPal"} payment?
            This action cannot be undone.
          </p>
          {refundReason.trim() && (
            <p className="text-sm text-muted-foreground">
              Reason: <span className="italic">{refundReason}</span>
            </p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefundConfirmOpen(false)}
              disabled={refunding}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRefund}
              disabled={refunding}
            >
              {refunding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-1" />
              )}
              Confirm Refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
