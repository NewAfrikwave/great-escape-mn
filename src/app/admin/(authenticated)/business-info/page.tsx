"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  FileText,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface BusinessInfoData {
  id: string;
  businessName: string;
  brandSubtitle: string;
  email: string;
  phone: string;
  alternatePhone: string | null;
  address: string | null;
  serviceAreaDescription: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  googleBusinessUrl: string | null;
  footerDescription: string | null;
  copyrightText: string | null;
}

interface FormData {
  businessName: string;
  brandSubtitle: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  serviceAreaDescription: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  googleBusinessUrl: string;
  footerDescription: string;
  copyrightText: string;
}

const emptyForm: FormData = {
  businessName: "",
  brandSubtitle: "",
  email: "",
  phone: "",
  alternatePhone: "",
  address: "",
  serviceAreaDescription: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  googleBusinessUrl: "",
  footerDescription: "",
  copyrightText: "",
};

export default function BusinessInfoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  const fetchBusinessInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/business-info");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: BusinessInfoData = await res.json();
      const formData: FormData = {
        businessName: data.businessName || "",
        brandSubtitle: data.brandSubtitle || "",
        email: data.email || "",
        phone: data.phone || "",
        alternatePhone: data.alternatePhone || "",
        address: data.address || "",
        serviceAreaDescription: data.serviceAreaDescription || "",
        facebookUrl: data.facebookUrl || "",
        instagramUrl: data.instagramUrl || "",
        tiktokUrl: data.tiktokUrl || "",
        youtubeUrl: data.youtubeUrl || "",
        googleBusinessUrl: data.googleBusinessUrl || "",
        footerDescription: data.footerDescription || "",
        copyrightText: data.copyrightText || "",
      };
      setForm(formData);
      setOriginalData(formData);
    } catch {
      toast.error("Failed to load business info");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinessInfo();
  }, [fetchBusinessInfo]);

  const hasChanges =
    originalData !== null &&
    Object.keys(form).some(
      (key) => form[key as keyof FormData] !== originalData[key as keyof FormData]
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        alternatePhone: form.alternatePhone || null,
        address: form.address || null,
        facebookUrl: form.facebookUrl || null,
        instagramUrl: form.instagramUrl || null,
        tiktokUrl: form.tiktokUrl || null,
        youtubeUrl: form.youtubeUrl || null,
        googleBusinessUrl: form.googleBusinessUrl || null,
        footerDescription: form.footerDescription || null,
        copyrightText: form.copyrightText || null,
      };

      const res = await fetch("/api/admin/business-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save business info");
      }

      const savedForm: FormData = {
        businessName: data.businessName || "",
        brandSubtitle: data.brandSubtitle || "",
        email: data.email || "",
        phone: data.phone || "",
        alternatePhone: data.alternatePhone || "",
        address: data.address || "",
        serviceAreaDescription: data.serviceAreaDescription || "",
        facebookUrl: data.facebookUrl || "",
        instagramUrl: data.instagramUrl || "",
        tiktokUrl: data.tiktokUrl || "",
        youtubeUrl: data.youtubeUrl || "",
        googleBusinessUrl: data.googleBusinessUrl || "",
        footerDescription: data.footerDescription || "",
        copyrightText: data.copyrightText || "",
      };
      setForm(savedForm);
      setOriginalData(savedForm);
      toast.success("Business info updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save business info");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Phone className="h-6 w-6 text-[#1a2744]" />
          <h1 className="text-2xl font-bold text-[#1a2744]">
            Contact &amp; Business Info
          </h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Business Details Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
            <Globe className="h-4 w-4" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={form.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                placeholder="A Great Escape"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandSubtitle">Brand Subtitle</Label>
              <Input
                id="brandSubtitle"
                value={form.brandSubtitle}
                onChange={(e) => updateField("brandSubtitle", e.target.value)}
                placeholder="Private Lake Cruises & Pontoon Experiences"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
            <Mail className="h-4 w-4" />
            Contact Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="greatescapemn@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="651-332-4859"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alternatePhone">Alternate Phone</Label>
              <Input
                id="alternatePhone"
                type="tel"
                value={form.alternatePhone}
                onChange={(e) => updateField("alternatePhone", e.target.value)}
                placeholder="Optional second phone number"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Full business address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Area Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
            <MapPin className="h-4 w-4" />
            Service Area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceAreaDescription">Service Area Description</Label>
            <Textarea
              id="serviceAreaDescription"
              value={form.serviceAreaDescription}
              onChange={(e) => updateField("serviceAreaDescription", e.target.value)}
              placeholder="Describe the areas you serve..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This description is displayed to customers to show where you operate.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
            <Share2 className="h-4 w-4" />
            Social Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                value={form.facebookUrl}
                onChange={(e) => updateField("facebookUrl", e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                value={form.instagramUrl}
                onChange={(e) => updateField("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktokUrl">TikTok URL</Label>
              <Input
                id="tiktokUrl"
                value={form.tiktokUrl}
                onChange={(e) => updateField("tiktokUrl", e.target.value)}
                placeholder="https://tiktok.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                value={form.youtubeUrl}
                onChange={(e) => updateField("youtubeUrl", e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="googleBusinessUrl">Google Business URL</Label>
              <Input
                id="googleBusinessUrl"
                value={form.googleBusinessUrl}
                onChange={(e) => updateField("googleBusinessUrl", e.target.value)}
                placeholder="https://business.google.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
            <FileText className="h-4 w-4" />
            Footer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footerDescription">Footer Description</Label>
            <Textarea
              id="footerDescription"
              value={form.footerDescription}
              onChange={(e) => updateField("footerDescription", e.target.value)}
              placeholder="A brief description shown in the website footer..."
              rows={3}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="copyrightText">Copyright Text</Label>
            <Input
              id="copyrightText"
              value={form.copyrightText}
              onChange={(e) => updateField("copyrightText", e.target.value)}
              placeholder="© 2024 A Great Escape. All rights reserved."
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
