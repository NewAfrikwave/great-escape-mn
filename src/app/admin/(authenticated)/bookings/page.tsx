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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CalendarCheck,
  Search,
  Check,
  X,
  Mail,
  Phone,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  Users,
  Package,
  MapPin,
  Clock,
  MessageSquare,
  StickyNote,
  Calendar,
  CreditCard,
  DollarSign,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { getBookingCalendarUrl } from "@/lib/calendar";

// ── Types ──────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  packageSlug: string | null;
  preferredLake: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  passengers: number | null;
  occasion: string | null;
  fishingGear: boolean;
  tubing: boolean;
  byob: boolean;
  decorations: boolean;
  needHelpPlanning: boolean;
  message: string | null;
  status: string;
  adminNotes: string | null;
  quotedPrice: number | null;
  paymentStatus: string;
  waiverAccepted: boolean;
  waiverSignature: string | null;
  waiverAcceptedAt: string | null;
  waiverTextVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

type StatusOption =
  | "all"
  | "new"
  | "contacted"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className:
      "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  },
  contacted: {
    label: "Contacted",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  },
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
  },
  confirmed: {
    label: "Confirmed",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  },
  completed: {
    label: "Completed",
    className:
      "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
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

// ── Addon Check ────────────────────────────────────────────────────────────

function AddonCheck({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
      ) : (
        <X className="h-4 w-4 text-gray-300 shrink-0" />
      )}
      <span className={enabled ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusOption>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Detail modal working state
  const [editStatus, setEditStatus] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Payment info state
  const [editQuotedPrice, setEditQuotedPrice] = useState<string>("");
  const [savingPrice, setSavingPrice] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data: Booking[] = await res.json();
      setBookings(data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Filter ─────────────────────────────────────────────────────────────

  const filtered = bookings.filter((b) => {
    // Status filter
    if (statusFilter !== "all" && b.status !== statusFilter) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.fullName.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Open detail ────────────────────────────────────────────────────────

  const openDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setEditNotes(booking.adminNotes ?? "");
    setEditQuotedPrice(booking.quotedPrice !== null ? (booking.quotedPrice / 100).toFixed(2) : "");
    setDetailOpen(true);
  };

  // ── Status update ──────────────────────────────────────────────────────

  const handleStatusUpdate = async () => {
    if (!selectedBooking || editStatus === selectedBooking.status) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus }),
      });
      if (!res.ok) throw new Error();
      const updated: Booking = await res.json();
      setSelectedBooking(updated);
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      toast.success(`Status updated to ${STATUS_CONFIG[editStatus]?.label ?? editStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  // ── Notes update ───────────────────────────────────────────────────────

  const handleNotesSave = async () => {
    if (!selectedBooking) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: editNotes }),
      });
      if (!res.ok) throw new Error();
      const updated: Booking = await res.json();
      setSelectedBooking(updated);
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      toast.success("Admin notes saved");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // ── Save quoted price ──────────────────────────────────────────────────

  const handleSavePrice = async () => {
    if (!selectedBooking) return;
    setSavingPrice(true);
    try {
      const priceInCents = editQuotedPrice.trim()
        ? Math.round(parseFloat(editQuotedPrice) * 100)
        : null;
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotedPrice: priceInCents }),
      });
      if (!res.ok) throw new Error();
      const updated: Booking = await res.json();
      setSelectedBooking(updated);
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      toast.success("Quoted price updated");
    } catch {
      toast.error("Failed to save quoted price");
    } finally {
      setSavingPrice(false);
    }
  };

  // ── Send payment link ──────────────────────────────────────────────────

  const handleSendPaymentLink = () => {
    toast.success("Payment link will be sent to customer email");
  };

  // ── Delete ─────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!selectedBooking) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setBookings((prev) => prev.filter((b) => b.id !== selectedBooking.id));
      setDetailOpen(false);
      setDeleteConfirmOpen(false);
      setSelectedBooking(null);
      toast.success("Booking deleted");
    } catch {
      toast.error("Failed to delete booking");
    } finally {
      setDeleting(false);
    }
  };

  // ── Status counts ──────────────────────────────────────────────────────

  const statusCounts = bookings.reduce<Record<string, number>>(
    (acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // ── Render ─────────────────────────────────────────────────────────────

  const selectedCalendarUrl = selectedBooking
    ? getBookingCalendarUrl(selectedBooking)
    : "";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarCheck className="h-6 w-6 text-[#1a2744]" />
          <h1 className="text-2xl font-bold text-[#1a2744]">
            Booking Requests
          </h1>
          <Badge className="bg-[#1a2744] text-white hover:bg-[#1a2744]">
            {bookings.length}
          </Badge>
        </div>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = statusCounts[key] ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() =>
                setStatusFilter(statusFilter === key ? "all" : (key as StatusOption))
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === key
                  ? config.className + " ring-2 ring-offset-1 ring-current/30"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {config.label}
              <span className="ml-0.5 bg-black/10 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters Row */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
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
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            {filtered.length} Booking{filtered.length !== 1 ? "s" : ""}
            {statusFilter !== "all" && (
              <Badge variant="outline" className="ml-1 text-xs">
                {STATUS_CONFIG[statusFilter]?.label ?? statusFilter}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
              <span className="ml-3 text-muted-foreground">
                Loading bookings...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarCheck className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No bookings found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Booking requests will appear here when customers submit them."}
              </p>
            </div>
          ) : (
            <>
            <div className="space-y-3 p-3 md:hidden">
              {filtered.map((booking) => (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => openDetail(booking)}
                  className="admin-mobile-card w-full text-left transition active:scale-[0.99]"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-[#1a2744]">
                        {booking.fullName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {booking.phone}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="admin-mobile-kv">
                      <p className="text-xs text-muted-foreground">Package</p>
                      <p className="truncate font-medium">
                        {slugToTitle(booking.packageSlug)}
                      </p>
                    </div>
                    <div className="admin-mobile-kv">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(booking.preferredDate)}</p>
                    </div>
                    <div className="admin-mobile-kv">
                      <p className="text-xs text-muted-foreground">Lake</p>
                      <p className="truncate font-medium">
                        {booking.preferredLake ?? "Not set"}
                      </p>
                    </div>
                    <div className="admin-mobile-kv">
                      <p className="text-xs text-muted-foreground">Guests</p>
                      <p className="font-medium">{booking.passengers ?? "Not set"}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#c8993e]">
                    Tap to view details, waiver, notes, and calendar
                  </p>
                </button>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Name
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Email
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Package
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Lake
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Date
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Passengers
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => (
                    <tr
                      key={booking.id}
                      onClick={() => openDetail(booking)}
                      className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {booking.fullName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap max-w-[200px] truncate">
                        {booking.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {slugToTitle(booking.packageSlug)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {booking.preferredLake ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(booking.preferredDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {booking.passengers ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(booking.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Detail Modal ──────────────────────────────────────────────── */}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <span>{selectedBooking.fullName}</span>
                  <StatusBadge status={selectedBooking.status} />
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {/* Customer Info */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">
                        <span className="font-medium">Name:</span>{" "}
                        {selectedBooking.fullName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${selectedBooking.email}`}
                        className="text-sm text-[#1a2744] underline underline-offset-2 hover:text-[#c8993e] transition-colors truncate"
                      >
                        {selectedBooking.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 sm:col-span-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`tel:${selectedBooking.phone}`}
                        className="text-sm text-[#1a2744] underline underline-offset-2 hover:text-[#c8993e] transition-colors"
                      >
                        {selectedBooking.phone}
                      </a>
                    </div>
                    {selectedCalendarUrl && (
                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#1a2744]/5 sm:col-span-2">
                        <div className="flex items-center gap-2 text-sm text-[#1a2744]">
                          <Calendar className="h-4 w-4 shrink-0" />
                          Add this booking to your calendar
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(selectedCalendarUrl, "_blank", "noopener,noreferrer")}
                        >
                          Add to Google Calendar
                        </Button>
                      </div>
                    )}
                  </div>
                </section>

                {/* Booking Details */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Booking Details
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Package</span>
                      </div>
                      <span className="text-sm font-medium">
                        {slugToTitle(selectedBooking.packageSlug)}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Lake</span>
                      </div>
                      <span className="text-sm font-medium">
                        {selectedBooking.preferredLake ?? "—"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Date</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatDate(selectedBooking.preferredDate)}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Time</span>
                      </div>
                      <span className="text-sm font-medium">
                        {selectedBooking.preferredTime ?? "—"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Passengers</span>
                      </div>
                      <span className="text-sm font-medium">
                        {selectedBooking.passengers ?? "—"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Occasion</span>
                      </div>
                      <span className="text-sm font-medium">
                        {selectedBooking.occasion ?? "—"}
                      </span>
                    </div>
                  </div>
                  {selectedCalendarUrl ? (
                    <div className="mt-3 rounded-xl border border-[#c8993e]/30 bg-[#c8993e]/10 p-3 sm:flex sm:items-center sm:justify-between sm:gap-3">
                      <div className="mb-3 flex items-start gap-2 text-sm text-[#1a2744] sm:mb-0">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#c8993e]" />
                        <div>
                          <p className="font-semibold">Calendar ready</p>
                          <p className="text-muted-foreground">
                            Add this booking to Google Calendar with the date,
                            time, lake, and customer details filled in.
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        className="w-full bg-[#1a2744] text-white hover:bg-[#2a3d64] sm:w-auto"
                        onClick={() =>
                          window.open(
                            selectedCalendarUrl,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Add to Google Calendar
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      Add a valid booking date to enable calendar sync.
                    </div>
                  )}
                </section>

                {/* Add-ons */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Add-ons
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <AddonCheck enabled={selectedBooking.fishingGear} label="Fishing Gear" />
                    <AddonCheck enabled={selectedBooking.tubing} label="Tubing" />
                    <AddonCheck enabled={selectedBooking.byob} label="BYOB" />
                    <AddonCheck enabled={selectedBooking.decorations} label="Decorations" />
                    <AddonCheck enabled={selectedBooking.needHelpPlanning} label="Help Planning" />
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Waiver
                  </h3>
                  <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-sm">
                    <AddonCheck
                      enabled={selectedBooking.waiverAccepted}
                      label="Damage responsibility waiver accepted"
                    />
                    <p>
                      <span className="font-medium">Signature:</span>{" "}
                      {selectedBooking.waiverSignature || "Not provided"}
                    </p>
                    <p className="text-muted-foreground">
                      Signed: {formatDateTime(selectedBooking.waiverAcceptedAt)}
                    </p>
                  </div>
                </section>

                {/* Payment Information */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    <CreditCard className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          Quoted Price ($)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={editQuotedPrice}
                            onChange={(e) => setEditQuotedPrice(e.target.value)}
                          />
                          <Button
                            onClick={handleSavePrice}
                            disabled={savingPrice}
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                          >
                            {savingPrice ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {selectedBooking.quotedPrice !== null
                            ? `Current: ${(selectedBooking.quotedPrice / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}`
                            : "No price set"}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Payment Status</Label>
                        <div>
                          <Badge
                            variant="outline"
                            className={
                              selectedBooking.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : selectedBooking.paymentStatus === "deposit_paid"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : selectedBooking.paymentStatus === "partially_refunded"
                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                : selectedBooking.paymentStatus === "refunded"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {selectedBooking.paymentStatus === "unpaid" && "Unpaid"}
                            {selectedBooking.paymentStatus === "deposit_paid" && "Deposit Paid"}
                            {selectedBooking.paymentStatus === "paid" && "Paid"}
                            {selectedBooking.paymentStatus === "partially_refunded" && "Partial Refund"}
                            {selectedBooking.paymentStatus === "refunded" && "Refunded"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {selectedBooking.quotedPrice !== null && selectedBooking.quotedPrice > 0 && (
                      <Button
                        onClick={handleSendPaymentLink}
                        size="sm"
                        variant="outline"
                        className="bg-[#1a2744] text-white hover:bg-[#2a3d64]"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Payment Link
                      </Button>
                    )}
                  </div>
                </section>

                {/* Customer Message */}
                {selectedBooking.message && (
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      <MessageSquare className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                      Customer Message
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedBooking.message}
                      </p>
                    </div>
                  </section>
                )}

                {/* Status Selector */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Update Status
                  </h3>
                  <div className="flex items-center gap-3">
                    <Select
                      value={editStatus}
                      onValueChange={setEditStatus}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleStatusUpdate}
                      disabled={
                        savingStatus || editStatus === selectedBooking.status
                      }
                      size="sm"
                      className="bg-[#1a2744] hover:bg-[#2a3d64]"
                    >
                      {savingStatus ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Update
                    </Button>
                  </div>
                </section>

                {/* Admin Notes */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    <StickyNote className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                    Admin Notes
                  </h3>
                  <div className="space-y-2">
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add internal notes about this booking..."
                      rows={3}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleNotesSave}
                      disabled={savingNotes}
                      size="sm"
                      variant="outline"
                    >
                      {savingNotes ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save Notes
                    </Button>
                  </div>
                </section>

                {/* Timestamps */}
                <section>
                  <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
                    <span>Created: {formatDateTime(selectedBooking.createdAt)}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>Updated: {formatDateTime(selectedBooking.updatedAt)}</span>
                  </div>
                </section>

                {/* Delete */}
                <section className="pt-2 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Booking
                  </Button>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────────────────────────── */}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Booking
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the booking for{" "}
            <span className="font-semibold text-foreground">
              {selectedBooking?.fullName}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
