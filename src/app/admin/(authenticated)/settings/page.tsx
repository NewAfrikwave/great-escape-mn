"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Shield,
  CalendarCheck,
  Eye,
  AlertTriangle,
  BarChart3,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsState {
  site_status: string;
  maintenance_message: string;
  booking_form_enabled: string;
  booking_disabled_message: string;
  default_passenger_limit: string;
  default_booking_notice: string;
  show_pricing: string;
  show_testimonials: string;
  show_gallery: string;
  show_faqs: string;
  weather_cancellation_disclaimer: string;
  safety_disclaimer: string;
  footer_disclaimer: string;
  google_analytics_id: string;
  meta_pixel_id: string;
  google_search_console_verification: string;
}

const defaultSettings: SettingsState = {
  site_status: "live",
  maintenance_message: "",
  booking_form_enabled: "true",
  booking_disabled_message: "",
  default_passenger_limit: "",
  default_booking_notice: "",
  show_pricing: "true",
  show_testimonials: "true",
  show_gallery: "true",
  show_faqs: "true",
  weather_cancellation_disclaimer: "",
  safety_disclaimer: "",
  footer_disclaimer: "",
  google_analytics_id: "",
  meta_pixel_id: "",
  google_search_console_verification: "",
};

function toBool(val: string): boolean {
  return val === "true" || val === "1";
}

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<SettingsState>(defaultSettings);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data: Record<string, string | null> = await res.json();

      const mapped: SettingsState = { ...defaultSettings };
      for (const [key, value] of Object.entries(data)) {
        if (key in mapped) {
          (mapped as Record<string, string>)[key] = value ?? "";
        }
      }
      setSettings(mapped);
      setOriginalSettings(mapped);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const updateField = (field: keyof SettingsState, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const updateBoolField = (field: keyof SettingsState, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [field]: checked ? "true" : "false" }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      for (const [key, value] of Object.entries(settings)) {
        if (value !== originalSettings[key as keyof SettingsState]) {
          payload[key] = value;
        }
      }

      // If nothing changed, just send all
      if (Object.keys(payload).length === 0) {
        for (const [key, value] of Object.entries(settings)) {
          payload[key] = value;
        }
      }

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      const data: Record<string, string | null> = await res.json();
      const mapped: SettingsState = { ...defaultSettings };
      for (const [key, value] of Object.entries(data)) {
        if (key in mapped) {
          (mapped as Record<string, string>)[key] = value ?? "";
        }
      }
      setSettings(mapped);
      setOriginalSettings(mapped);
      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
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
          <Settings className="h-6 w-6 text-[#1a2744]" />
          <h1 className="text-2xl font-bold text-[#1a2744]">Site Settings</h1>
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
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      {/* Site Status */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
            <Shield className="h-4 w-4" />
            Site Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_status">Site Status</Label>
              <Select
                value={settings.site_status}
                onValueChange={(val) => updateField("site_status", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="maintenance">Maintenance Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {settings.site_status === "maintenance" && (
            <div className="space-y-2">
              <Label htmlFor="maintenance_message">Maintenance Message</Label>
              <Textarea
                id="maintenance_message"
                value={settings.maintenance_message}
                onChange={(e) => updateField("maintenance_message", e.target.value)}
                placeholder="We'll be back soon! We're currently performing scheduled maintenance."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This message will be displayed to visitors while the site is in maintenance mode.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
            <CalendarCheck className="h-4 w-4" />
            Booking Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="booking_form_enabled" className="cursor-pointer">
                Booking Form Enabled
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow customers to submit booking requests
              </p>
            </div>
            <Switch
              id="booking_form_enabled"
              checked={toBool(settings.booking_form_enabled)}
              onCheckedChange={(checked) =>
                updateBoolField("booking_form_enabled", checked)
              }
            />
          </div>
          {!toBool(settings.booking_form_enabled) && (
            <div className="space-y-2">
              <Label htmlFor="booking_disabled_message">
                Booking Disabled Message
              </Label>
              <Textarea
                id="booking_disabled_message"
                value={settings.booking_disabled_message}
                onChange={(e) =>
                  updateField("booking_disabled_message", e.target.value)
                }
                placeholder="Bookings are temporarily unavailable. Please check back soon!"
                rows={2}
              />
            </div>
          )}
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_passenger_limit">Default Passenger Limit</Label>
              <Input
                id="default_passenger_limit"
                type="number"
                value={settings.default_passenger_limit}
                onChange={(e) =>
                  updateField("default_passenger_limit", e.target.value)
                }
                placeholder="e.g. 12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_booking_notice">Default Booking Notice</Label>
              <Input
                id="default_booking_notice"
                value={settings.default_booking_notice}
                onChange={(e) =>
                  updateField("default_booking_notice", e.target.value)
                }
                placeholder="e.g. 48 hours advance notice required"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
            <Eye className="h-4 w-4" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="show_pricing" className="cursor-pointer">
                  Show Pricing
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display prices on the website
                </p>
              </div>
              <Switch
                id="show_pricing"
                checked={toBool(settings.show_pricing)}
                onCheckedChange={(checked) =>
                  updateBoolField("show_pricing", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="show_testimonials" className="cursor-pointer">
                  Show Testimonials
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display customer testimonials
                </p>
              </div>
              <Switch
                id="show_testimonials"
                checked={toBool(settings.show_testimonials)}
                onCheckedChange={(checked) =>
                  updateBoolField("show_testimonials", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="show_gallery" className="cursor-pointer">
                  Show Gallery
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display photo gallery section
                </p>
              </div>
              <Switch
                id="show_gallery"
                checked={toBool(settings.show_gallery)}
                onCheckedChange={(checked) =>
                  updateBoolField("show_gallery", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="show_faqs" className="cursor-pointer">
                  Show FAQs
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display FAQ section
                </p>
              </div>
              <Switch
                id="show_faqs"
                checked={toBool(settings.show_faqs)}
                onCheckedChange={(checked) =>
                  updateBoolField("show_faqs", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimers */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
            <AlertTriangle className="h-4 w-4" />
            Disclaimers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weather_cancellation_disclaimer">
              Weather Cancellation Disclaimer
            </Label>
            <Textarea
              id="weather_cancellation_disclaimer"
              value={settings.weather_cancellation_disclaimer}
              onChange={(e) =>
                updateField("weather_cancellation_disclaimer", e.target.value)
              }
              placeholder="Weather-related cancellation policy..."
              rows={3}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="safety_disclaimer">Safety Disclaimer</Label>
            <Textarea
              id="safety_disclaimer"
              value={settings.safety_disclaimer}
              onChange={(e) => updateField("safety_disclaimer", e.target.value)}
              placeholder="Safety information and disclaimers..."
              rows={3}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="footer_disclaimer">Footer Disclaimer</Label>
            <Textarea
              id="footer_disclaimer"
              value={settings.footer_disclaimer}
              onChange={(e) => updateField("footer_disclaimer", e.target.value)}
              placeholder="General disclaimer shown in the footer..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
              <Input
                id="google_analytics_id"
                value={settings.google_analytics_id}
                onChange={(e) => updateField("google_analytics_id", e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_pixel_id">Meta Pixel ID</Label>
              <Input
                id="meta_pixel_id"
                value={settings.meta_pixel_id}
                onChange={(e) => updateField("meta_pixel_id", e.target.value)}
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="google_search_console_verification">
                Google Search Console Verification
              </Label>
              <Input
                id="google_search_console_verification"
                value={settings.google_search_console_verification}
                onChange={(e) =>
                  updateField("google_search_console_verification", e.target.value)
                }
                placeholder="Verification meta tag content"
              />
            </div>
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
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
