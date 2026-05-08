"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Loader2,
  Save,
  Globe,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface SeoSettingData {
  id: string;
  pageKey: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
}

interface SeoFormData {
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  keywords: string;
  canonicalUrl: string;
}

interface AnalyticsData {
  google_analytics_id: string;
  meta_pixel_id: string;
  google_search_console_verification: string;
}

const PAGE_LABELS: Record<string, string> = {
  homepage: "Homepage",
  experiences: "Experiences",
  booking: "Booking",
  gallery: "Gallery",
  about: "About",
  faq: "FAQ",
  contact: "Contact",
};

const DEFAULT_PAGE_KEYS = [
  "homepage",
  "experiences",
  "booking",
  "gallery",
  "about",
  "faq",
  "contact",
];

const emptySeoForm: SeoFormData = {
  seoTitle: "",
  seoDescription: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  keywords: "",
  canonicalUrl: "",
};

export default function SeoSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [seoData, setSeoData] = useState<Record<string, SeoSettingData>>({});
  const [forms, setForms] = useState<Record<string, SeoFormData>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    homepage: true,
  });
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    google_analytics_id: "",
    meta_pixel_id: "",
    google_search_console_verification: "",
  });
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [savingAnalytics, setSavingAnalytics] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [seoRes, settingsRes] = await Promise.all([
        fetch("/api/admin/seo"),
        fetch("/api/admin/settings"),
      ]);

      if (!seoRes.ok) throw new Error("Failed to fetch SEO settings");
      const seoList: SeoSettingData[] = await seoRes.json();

      const seoMap: Record<string, SeoSettingData> = {};
      const formMap: Record<string, SeoFormData> = {};

      for (const key of DEFAULT_PAGE_KEYS) {
        const existing = seoList.find((s) => s.pageKey === key);
        if (existing) {
          seoMap[key] = existing;
          formMap[key] = {
            seoTitle: existing.seoTitle || "",
            seoDescription: existing.seoDescription || "",
            ogTitle: existing.ogTitle || "",
            ogDescription: existing.ogDescription || "",
            ogImage: existing.ogImage || "",
            keywords: existing.keywords || "",
            canonicalUrl: existing.canonicalUrl || "",
          };
        } else {
          formMap[key] = { ...emptySeoForm };
        }
      }

      setSeoData(seoMap);
      setForms(formMap);

      // Load analytics from site settings
      if (settingsRes.ok) {
        const settings: Record<string, string | null> = await settingsRes.json();
        setAnalytics({
          google_analytics_id: settings.google_analytics_id || "",
          meta_pixel_id: settings.meta_pixel_id || "",
          google_search_console_verification:
            settings.google_search_console_verification || "",
        });
      }
    } catch {
      toast.error("Failed to load SEO settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateForm = (pageKey: string, field: keyof SeoFormData, value: string) => {
    setForms((prev) => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], [field]: value },
    }));
  };

  const toggleSection = (pageKey: string) => {
    setOpenSections((prev) => ({ ...prev, [pageKey]: !prev[pageKey] }));
  };

  const handleSavePage = async (pageKey: string) => {
    setSaving(pageKey);
    try {
      const form = forms[pageKey];

      const res = await fetch("/api/admin/seo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageKey,
          seoTitle: form.seoTitle || null,
          seoDescription: form.seoDescription || null,
          ogTitle: form.ogTitle || null,
          ogDescription: form.ogDescription || null,
          ogImage: form.ogImage || null,
          keywords: form.keywords || null,
          canonicalUrl: form.canonicalUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save SEO settings");
      }

      setSeoData((prev) => ({ ...prev, [pageKey]: data }));
      toast.success(`SEO settings for ${PAGE_LABELS[pageKey] || pageKey} saved`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save SEO settings");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAnalytics = async () => {
    setSavingAnalytics(true);
    try {
      const payload: Record<string, string> = {};
      if (analytics.google_analytics_id)
        payload.google_analytics_id = analytics.google_analytics_id;
      if (analytics.meta_pixel_id)
        payload.meta_pixel_id = analytics.meta_pixel_id;
      if (analytics.google_search_console_verification)
        payload.google_search_console_verification =
          analytics.google_search_console_verification;

      // Also send empty strings for clearing values
      if (!analytics.google_analytics_id)
        payload.google_analytics_id = "";
      if (!analytics.meta_pixel_id)
        payload.meta_pixel_id = "";
      if (!analytics.google_search_console_verification)
        payload.google_search_console_verification = "";

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save analytics settings");
      toast.success("Analytics settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save analytics settings");
    } finally {
      setSavingAnalytics(false);
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
      <div className="flex items-center gap-3">
        <Search className="h-6 w-6 text-[#1a2744]" />
        <h1 className="text-2xl font-bold text-[#1a2744]">SEO Settings</h1>
      </div>

      {/* Analytics Card */}
      <Card>
        <Collapsible open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#1a2744]">
                  <BarChart3 className="h-4 w-4" />
                  Analytics & Verification
                </span>
                {analyticsOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ga-id">Google Analytics ID</Label>
                  <Input
                    id="ga-id"
                    value={analytics.google_analytics_id}
                    onChange={(e) =>
                      setAnalytics((prev) => ({
                        ...prev,
                        google_analytics_id: e.target.value,
                      }))
                    }
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pixel-id">Meta Pixel ID</Label>
                  <Input
                    id="pixel-id"
                    value={analytics.meta_pixel_id}
                    onChange={(e) =>
                      setAnalytics((prev) => ({
                        ...prev,
                        meta_pixel_id: e.target.value,
                      }))
                    }
                    placeholder="1234567890"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="gsc-verification">
                    Google Search Console Verification
                  </Label>
                  <Input
                    id="gsc-verification"
                    value={analytics.google_search_console_verification}
                    onChange={(e) =>
                      setAnalytics((prev) => ({
                        ...prev,
                        google_search_console_verification: e.target.value,
                      }))
                    }
                    placeholder="Verification meta tag content"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveAnalytics}
                  disabled={savingAnalytics}
                  className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]"
                  size="sm"
                >
                  {savingAnalytics ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Analytics
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Per-Page SEO Cards */}
      {DEFAULT_PAGE_KEYS.map((pageKey) => {
        const form = forms[pageKey];
        const existing = seoData[pageKey];
        const isOpen = openSections[pageKey];

        return (
          <Card key={pageKey}>
            <Collapsible
              open={isOpen}
              onOpenChange={() => toggleSection(pageKey)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#1a2744]">
                      <Globe className="h-4 w-4" />
                      {PAGE_LABELS[pageKey] || pageKey}
                      {existing ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-[#2d5a3d]/10 text-[#2d5a3d] border-[#2d5a3d]/20"
                        >
                          Configured
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Not Set
                        </Badge>
                      )}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>SEO Title</Label>
                      <Input
                        value={form.seoTitle}
                        onChange={(e) =>
                          updateForm(pageKey, "seoTitle", e.target.value)
                        }
                        placeholder={`Title for ${PAGE_LABELS[pageKey]} page`}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>SEO Description</Label>
                      <Textarea
                        value={form.seoDescription}
                        onChange={(e) =>
                          updateForm(pageKey, "seoDescription", e.target.value)
                        }
                        placeholder={`Meta description for ${PAGE_LABELS[pageKey]} page`}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Title</Label>
                      <Input
                        value={form.ogTitle}
                        onChange={(e) =>
                          updateForm(pageKey, "ogTitle", e.target.value)
                        }
                        placeholder="Open Graph title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Description</Label>
                      <Input
                        value={form.ogDescription}
                        onChange={(e) =>
                          updateForm(pageKey, "ogDescription", e.target.value)
                        }
                        placeholder="Open Graph description"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>OG Image URL</Label>
                      <Input
                        value={form.ogImage}
                        onChange={(e) =>
                          updateForm(pageKey, "ogImage", e.target.value)
                        }
                        placeholder="https://example.com/og-image.jpg"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Keywords</Label>
                      <Textarea
                        value={form.keywords}
                        onChange={(e) =>
                          updateForm(pageKey, "keywords", e.target.value)
                        }
                        placeholder="Comma-separated keywords"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Canonical URL</Label>
                      <Input
                        value={form.canonicalUrl}
                        onChange={(e) =>
                          updateForm(pageKey, "canonicalUrl", e.target.value)
                        }
                        placeholder="https://greatescapemn.com/..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSavePage(pageKey)}
                      disabled={saving === pageKey}
                      className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]"
                      size="sm"
                    >
                      {saving === pageKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {existing ? "Update SEO" : "Save SEO"}
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
