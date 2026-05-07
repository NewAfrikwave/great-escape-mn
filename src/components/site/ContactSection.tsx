"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { serviceAreaSummary } from "@/data/lakes";
import { useBusinessInfo } from "@/hooks/use-site-data";

export function ContactSection() {
  const { info } = useBusinessInfo();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#1a2744] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#c8993e]/20 border border-[#c8993e]/30 rounded-full px-4 py-1.5 text-[#e8c878] text-sm font-medium mb-4">
              Get in Touch
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Contact Us
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Have questions or ready to plan your experience? Reach out anytime.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#c8993e]/20 rounded-xl p-3 shrink-0">
                  <Mail className="h-6 w-6 text-[#e8c878]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Email</h3>
                  <a
                    href={`mailto:${info?.email || "greatescapemn@gmail.com"}`}
                    className="text-white/60 hover:text-[#e8c878] transition-colors"
                  >
                    {info?.email || "greatescapemn@gmail.com"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#c8993e]/20 rounded-xl p-3 shrink-0">
                  <Phone className="h-6 w-6 text-[#e8c878]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Phone</h3>
                  <a
                    href={`tel:${(info?.phone || "651-332-4859").replace(/[^0-9]/g, "")}`}
                    className="text-white/60 hover:text-[#e8c878] transition-colors"
                  >
                    {info?.phone || "651-332-4859"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#c8993e]/20 rounded-xl p-3 shrink-0">
                  <MapPin className="h-6 w-6 text-[#e8c878]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Service Area</h3>
                  <p className="text-white/60">{info?.serviceAreaDescription || serviceAreaSummary}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-3">
                Quick Response Promise
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                We typically respond to all inquiries within 24 hours. For
                same-day booking requests, please call us directly.
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            {submitted ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-10 text-center">
                <div className="bg-[#2d5a3d]/20 rounded-full p-4 w-fit mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-[#3d7a53]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Message Sent!
                </h3>
                <p className="text-white/60">
                  Thanks for reaching out. We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-white/80">
                        Name *
                      </Label>
                      <Input
                        id="contact-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#c8993e] focus:ring-[#c8993e]/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="contact-email"
                          className="text-white/80"
                        >
                          Email *
                        </Label>
                        <Input
                          id="contact-email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="your@email.com"
                          className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#c8993e] focus:ring-[#c8993e]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="contact-phone"
                          className="text-white/80"
                        >
                          Phone
                        </Label>
                        <Input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="(555) 123-4567"
                          className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#c8993e] focus:ring-[#c8993e]/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="contact-message"
                        className="text-white/80"
                      >
                        Message *
                      </Label>
                      <Textarea
                        id="contact-message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="How can we help you?"
                        className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#c8993e] focus:ring-[#c8993e]/20 resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="w-full bg-[#c8993e] hover:bg-[#b8892e] text-white font-semibold py-5 shadow-xl shadow-[#c8993e]/20 gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
