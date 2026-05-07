"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Trash2,
  Quote,
  Loader2,
  AlertTriangle,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface TestimonialData {
  id: string;
  customerName: string;
  customerTitleOrLocation: string | null;
  rating: number;
  quote: string;
  experienceType: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  customerName: string;
  customerTitleOrLocation: string;
  rating: number;
  quote: string;
  experienceType: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm: FormData = {
  customerName: "",
  customerTitleOrLocation: "",
  rating: 5,
  quote: "",
  experienceType: "",
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
};

const EXPERIENCE_TYPES = [
  "Sunset Cruise",
  "Family Lake Day",
  "Fishing Trip",
  "Celebration",
  "Private Charter",
  "Fall Colors Cruise",
  "Corporate Event",
  "Other",
];

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`p-0.5 transition-colors ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          disabled={!onChange}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? "text-[#c8993e] fill-[#c8993e]"
                : "text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<TestimonialData | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTestimonials(data);
    } catch {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const openAddDialog = () => {
    setEditingTestimonial(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (t: TestimonialData) => {
    setEditingTestimonial(t);
    setForm({
      customerName: t.customerName,
      customerTitleOrLocation: t.customerTitleOrLocation || "",
      rating: t.rating,
      quote: t.quote,
      experienceType: t.experienceType || "",
      isFeatured: t.isFeatured,
      isActive: t.isActive,
      sortOrder: t.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.customerName.trim() || !form.quote.trim()) {
      toast.error("Please fill in customer name and quote");
      return;
    }

    if (form.rating < 1 || form.rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerName: form.customerName,
        customerTitleOrLocation: form.customerTitleOrLocation || null,
        rating: form.rating,
        quote: form.quote,
        experienceType: form.experienceType || null,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      };

      let res: Response;
      if (editingTestimonial) {
        res = await fetch(
          `/api/admin/testimonials/${editingTestimonial.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save testimonial");
      }

      toast.success(
        editingTestimonial
          ? "Testimonial updated successfully"
          : "Testimonial created successfully"
      );
      setDialogOpen(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save testimonial"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (
    id: string,
    field: "isActive" | "isFeatured",
    value: boolean
  ) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
      );
      toast.success(
        `${field === "isActive" ? "Active" : "Featured"} status updated`
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteConfirmId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Testimonial deleted successfully");
      setTestimonials((prev) =>
        prev.filter((t) => t.id !== deleteConfirmId)
      );
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete testimonial"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a2744]">
            Testimonials
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {testimonials.length}{" "}
            {testimonials.length === 1 ? "testimonial" : "testimonials"} total
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      {/* Testimonial Cards */}
      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Quote className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No testimonials yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your first customer testimonial to build social proof.
            </p>
            <Button onClick={openAddDialog} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Testimonial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="overflow-hidden">
              <CardContent className="p-5 space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">
                        {testimonial.customerName}
                      </h3>
                      {testimonial.isFeatured && (
                        <Badge className="gap-1 text-xs bg-[#c8993e] text-white hover:bg-[#c8993e] border-0">
                          <Star className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      <Badge
                        variant={testimonial.isActive ? "default" : "secondary"}
                        className={`text-xs ${
                          testimonial.isActive
                            ? "bg-[#2d5a3d] hover:bg-[#2d5a3d]"
                            : ""
                        }`}
                      >
                        {testimonial.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {testimonial.customerTitleOrLocation && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {testimonial.customerTitleOrLocation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <StarRating rating={testimonial.rating} />

                {/* Quote */}
                <div className="relative pl-4 border-l-2 border-[#c8993e]/30">
                  <Quote className="absolute -left-1 -top-1 h-4 w-4 text-[#c8993e]/50 fill-[#c8993e]/20" />
                  <p className="text-sm text-muted-foreground italic line-clamp-3 pl-3">
                    {testimonial.quote}
                  </p>
                </div>

                {/* Experience Type */}
                {testimonial.experienceType && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-[#1a2744]/5 border-[#1a2744]/20 text-[#1a2744]"
                  >
                    {testimonial.experienceType}
                  </Badge>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Switch
                        checked={testimonial.isActive}
                        onCheckedChange={(checked) =>
                          handleToggle(testimonial.id, "isActive", checked)
                        }
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Switch
                        checked={testimonial.isFeatured}
                        onCheckedChange={(checked) =>
                          handleToggle(testimonial.id, "isFeatured", checked)
                        }
                      />
                      Featured
                    </label>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(testimonial)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(testimonial.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1a2744]">
              {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial
                ? "Update the testimonial details below."
                : "Fill in the details to add a new customer testimonial."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Sarah Johnson"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerTitleOrLocation">
                  Title / Location
                </Label>
                <Input
                  id="customerTitleOrLocation"
                  value={form.customerTitleOrLocation}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      customerTitleOrLocation: e.target.value,
                    }))
                  }
                  placeholder="e.g. Mom of 3, Prior Lake"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-3">
                <StarRating
                  rating={form.rating}
                  onChange={(r) =>
                    setForm((prev) => ({ ...prev, rating: r }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {form.rating}/5
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quote">
                Quote <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="quote"
                value={form.quote}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, quote: e.target.value }))
                }
                placeholder="The customer's testimonial quote..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceType">Experience Type</Label>
              <Input
                id="experienceType"
                value={form.experienceType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    experienceType: e.target.value,
                  }))
                }
                placeholder="e.g. Sunset Cruise, Family Lake Day"
                list="experience-types"
              />
              <datalist id="experience-types">
                {EXPERIENCE_TYPES.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <div className="flex items-center gap-3">
                  <Switch
                    id="isFeatured"
                    checked={form.isFeatured}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, isFeatured: checked }))
                    }
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">
                    Featured
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1a2744] hover:bg-[#2a3d64]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editingTestimonial ? (
                "Update Testimonial"
              ) : (
                "Create Testimonial"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Testimonial
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this testimonial? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
