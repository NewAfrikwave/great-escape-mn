"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Anchor, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Experiences", href: "#experiences" },
  { label: "Gallery", href: "#gallery" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#1a2744]/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="#home"
            className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity"
          >
            <Anchor className="h-7 w-7 text-[#c8993e]" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight leading-tight">
                Great Escape MN
              </span>
              <span className="text-[10px] sm:text-xs text-[#e8c878] leading-tight hidden sm:block">
                Private Lake Cruises in Minnesota
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            <Link href="#booking" className="ml-3">
              <Button className="bg-[#c8993e] hover:bg-[#b8892e] text-white font-semibold px-5 shadow-lg shadow-[#c8993e]/25">
                Book Now
              </Button>
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center gap-2">
            <Link href="#booking">
              <Button
                size="sm"
                className="bg-[#c8993e] hover:bg-[#b8892e] text-white font-semibold shadow-lg"
              >
                Book
              </Button>
            </Link>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72 bg-[#1a2744] border-[#2a3d64] text-white p-0"
              >
                <div className="flex items-center justify-between p-4 border-b border-[#2a3d64]">
                  <div className="flex items-center gap-2">
                    <Anchor className="h-5 w-5 text-[#c8993e]" />
                    <span className="font-bold">Great Escape MN</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(false)}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col p-4 gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleNavClick}
                      className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-md text-base font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-4 pt-4 border-t border-[#2a3d64]">
                    <Link href="#booking" onClick={handleNavClick}>
                      <Button className="w-full bg-[#c8993e] hover:bg-[#b8892e] text-white font-semibold">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
