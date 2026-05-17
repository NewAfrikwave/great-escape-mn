"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarCheck,
  Bell,
  CheckCircle2,
  CheckCheck,
  Package,
  Image,
  Plus,
  Eye,
  Pencil,
  Upload,
  Phone,
  ArrowRight,
  Calendar,
  Anchor,
  MapPin,
} from "lucide-react";

// Colors
const NAVY = "#1a2744";
const GOLD = "#c8993e";
const FOREST = "#2d5a3d";
const CREAM = "#faf8f0";

// Types
interface DashboardStats {
  totalBookings: number;
  newBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalPackages: number;
  activePackages: number;
  totalGalleryImages: number;
  totalTestimonials: number;
  unreadContactMessages: number;
}

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
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentBookings: Booking[];
  upcomingBookings: Booking[];
}

// Status badge config
const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  new: { label: "New", bg: "bg-blue-100", text: "text-blue-700" },
  contacted: {
    label: "Contacted",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  pending: { label: "Pending", bg: "bg-orange-100", text: "text-orange-700" },
  confirmed: {
    label: "Confirmed",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700" },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

// Stats card definition
const statsCards = [
  {
    key: "totalBookings" as const,
    label: "Total Bookings",
    icon: CalendarCheck,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    key: "newBookings" as const,
    label: "New Bookings",
    icon: Bell,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    highlight: true,
  },
  {
    key: "confirmedBookings" as const,
    label: "Confirmed",
    icon: CheckCircle2,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    key: "completedBookings" as const,
    label: "Completed",
    icon: CheckCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    key: "activePackages" as const,
    label: "Active Packages",
    icon: Package,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    key: "totalGalleryImages" as const,
    label: "Gallery Images",
    icon: Image,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

// Quick actions
const quickActions = [
  {
    label: "Add New Package",
    href: "/admin/packages",
    icon: Plus,
    color: "bg-[#1a2744] hover:bg-[#2a3d64] text-white",
  },
  {
    label: "View New Bookings",
    href: "/admin/bookings",
    icon: Eye,
    color: "bg-[#c8993e] hover:bg-[#b5872e] text-white",
  },
  {
    label: "Edit Homepage",
    href: "/admin/homepage",
    icon: Pencil,
    color: "bg-[#2d5a3d] hover:bg-[#3d6a4d] text-white",
  },
  {
    label: "Upload Gallery Image",
    href: "/admin/gallery",
    icon: Upload,
    color: "bg-[#1a2744] hover:bg-[#2a3d64] text-white",
  },
  {
    label: "Update Contact Info",
    href: "/admin/business-info",
    icon: Phone,
    color: "bg-[#c8993e] hover:bg-[#b5872e] text-white",
  },
];

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-36 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) {
          if (res.status === 401) {
            setError("Not authenticated. Please log in.");
            return;
          }
          throw new Error("Failed to load dashboard data");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 font-medium mb-2">
              Error Loading Dashboard
            </p>
            <p className="text-red-500 text-sm">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentBookings, upcomingBookings } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ color: NAVY }}
        >
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Welcome back to A Great Escape admin panel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statsCards.map((card) => {
          const count = stats[card.key];
          const isHighlight = card.highlight && count > 0;
          return (
            <Card
              key={card.key}
              className={`transition-shadow hover:shadow-md ${
                isHighlight ? "ring-2 ring-amber-400 ring-offset-1" : ""
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-lg ${card.iconBg}`}
                  >
                    <card.icon
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${card.iconColor}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                      {card.label}
                    </p>
                    <p
                      className="text-xl sm:text-2xl font-bold"
                      style={{ color: NAVY }}
                    >
                      {count}
                      {isHighlight && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-white animate-pulse">
                          {count} new
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold" style={{ color: NAVY }}>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button
                  className={`${action.color} w-full gap-2 text-sm font-medium shadow-sm transition-all hover:shadow-md lg:w-auto`}
                  size="sm"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Grid: Recent Bookings + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Booking Requests */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="text-base font-semibold"
                style={{ color: NAVY }}
              >
                Recent Booking Requests
              </CardTitle>
              <Link href="/admin/bookings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm gap-1 hover:gap-2 transition-all"
                  style={{ color: GOLD }}
                >
                  View All Bookings
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CalendarCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No booking requests yet</p>
              </div>
            ) : (
              <>
              <div className="space-y-3 md:hidden">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href="/admin/bookings"
                    className="admin-mobile-card block active:scale-[0.99]"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold" style={{ color: NAVY }}>
                          {booking.fullName}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {booking.packageSlug ? booking.packageSlug.replace(/-/g, " ") : "No package"}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="admin-mobile-kv">
                        <p className="text-xs text-gray-500">Lake</p>
                        <p className="truncate font-medium">
                          {booking.preferredLake || "Not set"}
                        </p>
                      </div>
                      <div className="admin-mobile-kv">
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(booking.preferredDate)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Lake
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Date
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Created
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium text-sm">
                          {booking.fullName}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {booking.packageSlug ? (
                            <span className="flex items-center gap-1">
                              <Anchor className="h-3 w-3 text-gray-400" />
                              {booking.packageSlug.replace(/-/g, " ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-gray-600">
                          {booking.preferredLake ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              {booking.preferredLake}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-600">
                          {formatDate(booking.preferredDate)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                          {formatDateTime(booking.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="text-base font-semibold"
                style={{ color: NAVY }}
              >
                Upcoming Bookings
              </CardTitle>
              <Link href="/admin/bookings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm gap-1 hover:gap-2 transition-all"
                  style={{ color: GOLD }}
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming bookings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-sm transition-shadow"
                  >
                    <div
                      className="flex-shrink-0 flex flex-col items-center justify-center h-12 w-12 rounded-lg text-white"
                      style={{ backgroundColor: FOREST }}
                    >
                      <Calendar className="h-4 w-4 mb-0.5" />
                      <span className="text-[10px] font-bold leading-none">
                        {booking.preferredDate
                          ? new Date(booking.preferredDate).toLocaleDateString(
                              "en-US",
                              { month: "short" }
                            )
                          : "—"}
                      </span>
                      <span className="text-sm font-bold leading-none">
                        {booking.preferredDate
                          ? new Date(booking.preferredDate).getDate()
                          : "—"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: NAVY }}
                      >
                        {booking.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {booking.packageSlug
                          ? booking.packageSlug.replace(/-/g, " ")
                          : "No package"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {booking.preferredLake && (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {booking.preferredLake}
                          </span>
                        )}
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
