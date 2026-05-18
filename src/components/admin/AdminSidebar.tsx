"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Anchor,
  LayoutDashboard,
  CalendarCheck,
  Package,
  FileText,
  Home,
  Image,
  MessageSquareQuote,
  HelpCircle,
  Phone,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  Menu,
  LogOut,
  ChevronLeft,
  CreditCard,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Users", href: "/admin/users", icon: ShieldCheck },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Payment Settings", href: "/admin/payment-settings", icon: CreditCard },
  { label: "Packages", href: "/admin/packages", icon: Package },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Homepage", href: "/admin/homepage", icon: Home },
  { label: "Gallery", href: "/admin/gallery", icon: Image },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { label: "Business Info", href: "/admin/business-info", icon: Phone },
  { label: "Lakes", href: "/admin/lakes", icon: MapPin },
  { label: "SEO", href: "/admin/seo", icon: Search },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const mobilePrimaryItems = [
  { label: "Home", href: "/admin", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Packages", href: "/admin/packages", icon: Package },
  { label: "Users", href: "/admin/users", icon: ShieldCheck },
];

function getCurrentTitle(pathname: string) {
  const item = navItems.find(
    (navItem) =>
      pathname === navItem.href ||
      (navItem.href !== "/admin" && pathname.startsWith(navItem.href))
  );
  return item?.label || "Admin";
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-4 border-b border-[#2a3d64]">
        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2">
          <Anchor className="h-7 w-7 text-[#c8993e]" />
          <div>
            <span className="text-lg font-bold text-white block leading-tight">A Great Escape</span>
            <span className="text-[10px] text-[#e8c878]">Admin Panel</span>
          </div>
        </Link>
      </div>

      <ScrollArea className="min-h-0 flex-1 py-3">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#c8993e] text-white shadow-lg shadow-[#c8993e]/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-[#2a3d64] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          View Public Site
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 px-3 text-white/60 hover:text-white hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const currentTitle = getCurrentTitle(pathname);

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#1a2744] border-r border-[#2a3d64] z-40">
        <SidebarContent />
      </aside>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1a2744] border-b border-[#2a3d64] h-16 flex items-center justify-between px-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 size-11">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[86vw] max-w-80 p-0 bg-[#1a2744] border-[#2a3d64]">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
          <Anchor className="h-5 w-5 text-[#c8993e] shrink-0" />
          <div className="min-w-0">
            <span className="block truncate text-sm font-bold leading-tight text-white">
              {currentTitle}
            </span>
            <span className="block truncate text-[10px] leading-tight text-[#e8c878]">
              A Great Escape
            </span>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="rounded-md px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
        >
          Site
        </Link>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#2a3d64] bg-[#1a2744] px-1 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1 shadow-[0_-10px_30px_rgba(0,0,0,0.18)]">
        <div className="grid grid-cols-5 gap-1">
          {mobilePrimaryItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#c8993e] text-white"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="mb-0.5 h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex min-h-14 flex-col items-center justify-center rounded-lg px-1 text-[11px] font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Menu className="mb-0.5 h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
