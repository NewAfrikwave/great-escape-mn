"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Home,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface HomepageSectionData {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string | null;
  isEnabled: boolean;
  sortOrder: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<HomepageSectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sortOrders, setSortOrders] = useState<Record<string, number>>({});

  const fetchSections = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/homepage");
      if (!res.ok) throw new Error("Failed to fetch sections");
      const data: HomepageSectionData[] = await res.json();
      setSections(data);
      const orders: Record<string, number> = {};
      for (const s of data) {
        orders[s.sectionKey] = s.sortOrder;
      }
      setSortOrders(orders);
    } catch {
      toast.error("Failed to load homepage sections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleToggle = async (sectionKey: string, isEnabled: boolean) => {
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ sectionKey, isEnabled }]),
      });

      if (!res.ok) throw new Error("Failed to update section");

      setSections((prev) =>
        prev.map((s) =>
          s.sectionKey === sectionKey ? { ...s, isEnabled } : s
        )
      );
      toast.success(
        `"${sections.find((s) => s.sectionKey === sectionKey)?.title}" ${
          isEnabled ? "enabled" : "disabled"
        }`
      );
    } catch {
      toast.error("Failed to update section visibility");
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;

    // Update sort orders
    const updated = newSections.map((s, i) => ({
      ...s,
      sortOrder: i,
    }));
    setSections(updated);

    const newOrders: Record<string, number> = {};
    for (const s of updated) {
      newOrders[s.sectionKey] = s.sortOrder;
    }
    setSortOrders(newOrders);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;

    // Update sort orders
    const updated = newSections.map((s, i) => ({
      ...s,
      sortOrder: i,
    }));
    setSections(updated);

    const newOrders: Record<string, number> = {};
    for (const s of updated) {
      newOrders[s.sectionKey] = s.sortOrder;
    }
    setSortOrders(newOrders);
  };

  const handleSortOrderChange = (sectionKey: string, value: string) => {
    const num = parseInt(value) || 0;
    setSortOrders((prev) => ({ ...prev, [sectionKey]: num }));
    setSections((prev) =>
      prev.map((s) =>
        s.sectionKey === sectionKey ? { ...s, sortOrder: num } : s
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = sections.map((s) => ({
        sectionKey: s.sectionKey,
        sortOrder: sortOrders[s.sectionKey] ?? s.sortOrder,
      }));

      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save homepage sections");
      }

      // Re-fetch to get proper ordering
      await fetchSections();
      toast.success("Homepage section order saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save homepage sections"
      );
    } finally {
      setSaving(false);
    }
  };

  const hasOrderChanges = sections.some(
    (s) => sortOrders[s.sectionKey] !== undefined && sortOrders[s.sectionKey] !== s.sortOrder
  );

  // Check if local sort differs from initial
  const localOrderDiffers = (() => {
    for (let i = 0; i < sections.length; i++) {
      if (sortOrders[sections[i].sectionKey] !== i) return true;
    }
    return false;
  })();

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
          <Home className="h-6 w-6 text-[#1a2744]" />
          <h1 className="text-2xl font-bold text-[#1a2744]">
            Homepage Builder
          </h1>
          <Badge className="bg-[#1a2744] text-white hover:bg-[#1a2744]">
            {sections.length} sections
          </Badge>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Order"}
        </Button>
      </div>

      {/* Instructions */}
      <Card className="border-[#c8993e]/30 bg-[#c8993e]/5">
        <CardContent className="p-4">
          <p className="text-sm text-[#1a2744]">
            <strong>How to use:</strong> Toggle sections on/off to control what appears on the homepage. 
            Use the arrow buttons or edit the sort order numbers to rearrange sections. 
            Click <strong>Save Order</strong> when you&apos;re done.
          </p>
        </CardContent>
      </Card>

      {/* Empty State */}
      {sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Home className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              No homepage sections
            </h3>
            <p className="text-muted-foreground text-sm">
              Homepage sections will appear here when they are created.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <Card
              key={section.id}
              className={`transition-all ${
                !section.isEnabled ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Drag Handle / Reorder */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                      <span className="sr-only">Move up</span>
                    </Button>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sections.length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                      <span className="sr-only">Move down</span>
                    </Button>
                  </div>

                  {/* Section Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm truncate">
                        {section.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono shrink-0"
                      >
                        {section.sectionKey}
                      </Badge>
                      {section.isEnabled ? (
                        <Badge className="text-[10px] bg-[#2d5a3d]/10 text-[#2d5a3d] border-[#2d5a3d]/20 shrink-0">
                          <Eye className="h-3 w-3 mr-0.5" />
                          Visible
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-muted-foreground shrink-0"
                        >
                          <EyeOff className="h-3 w-3 mr-0.5" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    {section.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {section.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Sort Order Input */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Label
                      htmlFor={`sort-${section.sectionKey}`}
                      className="text-xs text-muted-foreground whitespace-nowrap"
                    >
                      Order
                    </Label>
                    <Input
                      id={`sort-${section.sectionKey}`}
                      type="number"
                      value={sortOrders[section.sectionKey] ?? section.sortOrder}
                      onChange={(e) =>
                        handleSortOrderChange(section.sectionKey, e.target.value)
                      }
                      className="w-16 h-8 text-center text-sm"
                    />
                  </div>

                  {/* Toggle */}
                  <div className="shrink-0 flex items-center gap-2">
                    <Switch
                      checked={section.isEnabled}
                      onCheckedChange={(checked) =>
                        handleToggle(section.sectionKey, checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom Save */}
      {sections.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Order"}
          </Button>
        </div>
      )}
    </div>
  );
}
