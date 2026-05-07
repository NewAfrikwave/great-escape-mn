"use client";

import Link from "next/link";
import { Anchor } from "lucide-react";
import { lakes } from "@/data/lakes";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Experiences", href: "#experiences" },
  { label: "Gallery", href: "#gallery" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
  { label: "Book Now", href: "#booking" },
];

export function Footer() {
  return (
    <footer className="bg-[#0f1a2e] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="#home"
              className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity mb-4"
            >
              <Anchor className="h-6 w-6 text-[#c8993e]" />
              <div>
                <span className="text-lg font-bold">Great Escape MN</span>
              </div>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-2">
              Three Rivers Taxi District Minnesota
            </p>
            <p className="text-sm text-white/50 leading-relaxed">
              Private captain-led pontoon experiences on Minnesota&apos;s most
              beautiful lakes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-[#e8c878] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Lakes */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Service Lakes
            </h3>
            <ul className="space-y-2.5">
              {lakes.map((lake) => (
                <li key={lake.id}>
                  <span className="text-sm text-white/50">{lake.name}</span>
                </li>
              ))}
              <li>
                <span className="text-sm text-white/40 italic">
                  & other lakes by request
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:greatescapemn@gmail.com"
                  className="text-sm text-white/50 hover:text-[#e8c878] transition-colors"
                >
                  greatescapemn@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:6513324859"
                  className="text-sm text-white/50 hover:text-[#e8c878] transition-colors"
                >
                  651-332-4859
                </a>
              </li>
              <li>
                <span className="text-sm text-white/40">
                  Minnesota, USA
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Great Escape MN. All rights
            reserved.
          </p>
          <p className="text-xs text-white/30 text-center sm:text-right max-w-lg">
            All bookings are subject to weather, lake rules, availability, and
            safety requirements.
          </p>
        </div>
      </div>
    </footer>
  );
}
