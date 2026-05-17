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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Clock,
  Users,
  DollarSign,
  Star,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface PackageData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  duration: string;
  capacity: string;
  startingPrice: string | null;
  priceLabel: string | null;
  priceType: string;
  isPriceVisible: boolean;
  isFeatured: boolean;
  isActive: boolean;
  showOnHomepage: boolean;
  showOnExperiencesPage: boolean;
  imageUrl: string | null;
  icon: string;
  ctaLabel: string;
  sortOrder: number;
  includedItems: string;
  highlights: string;
  optionalAddOns: string;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  duration: string;
  capacity: string;
  startingPrice: string;
  priceLabel: string;
  priceType: string;
  isPriceVisible: boolean;
  isFeatured: boolean;
  isActive: boolean;
  showOnHomepage: boolean;
  showOnExperiencesPage: boolean;
  imageUrl: string;
  icon: string;
  ctaLabel: string;
  sortOrder: number;
  includedItems: string;
  highlights: string;
  optionalAddOns: string;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: FormData = {
  title: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  duration: "",
  capacity: "",
  startingPrice: "",
  priceLabel: "",
  priceType: "starting_at",
  isPriceVisible: true,
  isFeatured: false,
  isActive: true,
  showOnHomepage: true,
  showOnExperiencesPage: true,
  imageUrl: "",
  icon: "compass",
  ctaLabel: "",
  sortOrder: 0,
  includedItems: "",
  highlights: "",
  optionalAddOns: "",
  seoTitle: "",
  seoDescription: "",
};

const ICON_OPTIONS = [
  { value: "sunset", label: "Sunset" },
  { value: "users", label: "Users" },
  { value: "fish", label: "Fish" },
  { value: "sparkles", label: "Sparkles" },
  { value: "leaf", label: "Leaf" },
  { value: "compass", label: "Compass" },
];

const PRICE_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed" },
  { value: "starting_at", label: "Starting At" },
  { value: "per_person", label: "Per Person" },
  { value: "request_quote", label: "Request Quote" },
  { value: "hidden", label: "Hidden" },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseJsonArrayToString(jsonStr: string): string {
  try {
    const arr = JSON.parse(jsonStr);
    if (Array.isArray(arr)) {
      return arr.join("\n");
    }
  } catch {
    // not valid JSON
  }
  return jsonStr || "";
}

function stringLinesToJsonArray(str: string): string {
  const lines = str
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return JSON.stringify(lines);
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/packages");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPackages(data);
    } catch {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const openAddDialog = () => {
    setEditingPackage(null);
    setForm(emptyForm);
    setSlugManuallyEdited(false);
    setDialogOpen(true);
  };

  const openEditDialog = (pkg: PackageData) => {
    setEditingPackage(pkg);
    setForm({
      title: pkg.title,
      slug: pkg.slug,
      shortDescription: pkg.shortDescription,
      fullDescription: pkg.fullDescription,
      duration: pkg.duration,
      capacity: pkg.capacity,
      startingPrice: pkg.startingPrice || "",
      priceLabel: pkg.priceLabel || "",
      priceType: pkg.priceType,
      isPriceVisible: pkg.isPriceVisible,
      isFeatured: pkg.isFeatured,
      isActive: pkg.isActive,
      showOnHomepage: pkg.showOnHomepage,
      showOnExperiencesPage: pkg.showOnExperiencesPage,
      imageUrl: pkg.imageUrl || "",
      icon: pkg.icon,
      ctaLabel: pkg.ctaLabel,
      sortOrder: pkg.sortOrder,
      includedItems: parseJsonArrayToString(pkg.includedItems),
      highlights: parseJsonArrayToString(pkg.highlights),
      optionalAddOns: parseJsonArrayToString(pkg.optionalAddOns),
      seoTitle: pkg.seoTitle || "",
      seoDescription: pkg.seoDescription || "",
    });
    setSlugManuallyEdited(true);
    setDialogOpen(true);
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => {
      const updated = { ...prev, title: value };
      if (!slugManuallyEdited) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const handleSave = async () => {
    if (!form.title || !form.shortDescription || !form.duration || !form.capacity || !form.ctaLabel) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        startingPrice: form.startingPrice || null,
        priceLabel: form.priceLabel || null,
        imageUrl: form.imageUrl || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        includedItems: stringLinesToJsonArray(form.includedItems),
        highlights: stringLinesToJsonArray(form.highlights),
        optionalAddOns: stringLinesToJsonArray(form.optionalAddOns),
      };

      let res: Response;
      if (editingPackage) {
        res = await fetch(`/api/admin/packages/${editingPackage.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save package");
      }

      toast.success(editingPackage ? "Package updated successfully" : "Package created successfully");
      setDialogOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, field: "isActive" | "isFeatured", value: boolean) => {
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setPackages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
      toast.success(`${field === "isActive" ? "Active" : "Featured"} status updated`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/packages/${deleteConfirmId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Package deleted successfully");
      setPackages((prev) => prev.filter((p) => p.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete package");
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
          <h1 className="text-2xl font-bold tracking-tight">Packages & Experiences</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {packages.length} {packages.length === 1 ? "package" : "packages"} total
          </p>
        </div>
        <Button onClick={openAddDialog} className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Package
        </Button>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No packages yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first package to get started.
            </p>
            <Button onClick={openAddDialog} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Image Thumbnail */}
                  <div className="sm:w-40 sm:min-h-full h-32 sm:h-auto bg-muted flex-shrink-0 relative overflow-hidden">
                    {pkg.imageUrl ? (
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    {pkg.isFeatured && (
                      <Badge className="absolute top-2 left-2 gap-1 text-xs" variant="default">
                        <Star className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base truncate">{pkg.title}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{pkg.slug}</p>
                      </div>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pkg.shortDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {pkg.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {pkg.capacity}
                      </span>
                      {pkg.startingPrice && pkg.isPriceVisible && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {pkg.startingPrice}
                        </span>
                      )}
                    </div>

                    {/* Toggles & Actions */}
                    <div className="flex flex-col gap-3 pt-1 border-t sm:flex-row sm:items-center sm:justify-between">
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4">
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <Switch
                            checked={pkg.isActive}
                            onCheckedChange={(checked) =>
                              handleToggle(pkg.id, "isActive", checked)
                            }
                          />
                          Active
                        </label>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <Switch
                            checked={pkg.isFeatured}
                            onCheckedChange={(checked) =>
                              handleToggle(pkg.id, "isFeatured", checked)
                            }
                          />
                          Featured
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(pkg)}
                          className="h-11 w-full p-0 sm:h-8 sm:w-8"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sm:sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(pkg.id)}
                          className="h-11 w-full p-0 text-destructive hover:text-destructive sm:h-8 sm:w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sm:sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Add Package"}
            </DialogTitle>
            <DialogDescription>
              {editingPackage
                ? "Update the package details below."
                : "Fill in the details to create a new package."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Basic Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Sunset Cruise"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="auto-generated-from-title"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from title. Edit to customize.
                  </p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="shortDescription">
                    Short Description <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="shortDescription"
                    value={form.shortDescription}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, shortDescription: e.target.value }))
                    }
                    placeholder="Brief description for cards and listings"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullDescription">Full Description</Label>
                  <Textarea
                    id="fullDescription"
                    value={form.fullDescription}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, fullDescription: e.target.value }))
                    }
                    placeholder="Detailed description of the package"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Package Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="duration"
                    value={form.duration}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, duration: e.target.value }))
                    }
                    placeholder="e.g. 2 hours"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">
                    Capacity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="capacity"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, capacity: e.target.value }))
                    }
                    placeholder="e.g. Up to 12 passengers"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaLabel">
                    CTA Label <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ctaLabel"
                    value={form.ctaLabel}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))
                    }
                    placeholder="e.g. Book This Cruise"
                  />
                </div>

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
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Pricing
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startingPrice">Starting Price</Label>
                  <Input
                    id="startingPrice"
                    value={form.startingPrice}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, startingPrice: e.target.value }))
                    }
                    placeholder="e.g. $350"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceLabel">Price Label</Label>
                  <Input
                    id="priceLabel"
                    value={form.priceLabel}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, priceLabel: e.target.value }))
                    }
                    placeholder="e.g. per cruise"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceType">Price Type</Label>
                  <Select
                    value={form.priceType}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, priceType: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select price type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex items-center gap-3 pt-6">
                  <Switch
                    id="isPriceVisible"
                    checked={form.isPriceVisible}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, isPriceVisible: checked }))
                    }
                  />
                  <Label htmlFor="isPriceVisible" className="cursor-pointer">
                    Show Price
                  </Label>
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Media & Appearance
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <ImageUploadField
                    id="imageUrl"
                    label="Package Image"
                    value={form.imageUrl}
                    guide="Recommended size: 1600 x 1000px for package cards and experience pages."
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, imageUrl: value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={form.icon}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, icon: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Visibility Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Visibility & Status
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    id="showOnHomepage"
                    checked={form.showOnHomepage}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, showOnHomepage: checked }))
                    }
                  />
                  <Label htmlFor="showOnHomepage" className="cursor-pointer">
                    Show on Homepage
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="showOnExperiencesPage"
                    checked={form.showOnExperiencesPage}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        showOnExperiencesPage: checked,
                      }))
                    }
                  />
                  <Label htmlFor="showOnExperiencesPage" className="cursor-pointer">
                    Show on Experiences Page
                  </Label>
                </div>
              </div>
            </div>

            {/* Content Lists Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Content Lists
              </h4>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="includedItems">Included Items</Label>
                  <Textarea
                    id="includedItems"
                    value={form.includedItems}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, includedItems: e.target.value }))
                    }
                    placeholder="One item per line&#10;e.g.&#10;Captain and crew&#10;Fuel&#10;Life jackets"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    One item per line. These will be displayed as a list.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="highlights">Highlights</Label>
                  <Textarea
                    id="highlights"
                    value={form.highlights}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, highlights: e.target.value }))
                    }
                    placeholder="One highlight per line&#10;e.g.&#10;Stunning sunset views&#10;Complimentary drinks"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    One highlight per line.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optionalAddOns">Optional Add-ons</Label>
                  <Textarea
                    id="optionalAddOns"
                    value={form.optionalAddOns}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        optionalAddOns: e.target.value,
                      }))
                    }
                    placeholder="One add-on per line&#10;e.g.&#10;Fishing gear - $50&#10;Tubing - $75"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    One add-on per line.
                  </p>
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                SEO
              </h4>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={form.seoTitle}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, seoTitle: e.target.value }))
                    }
                    placeholder="Custom title for search engines"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={form.seoDescription}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        seoDescription: e.target.value,
                      }))
                    }
                    placeholder="Meta description for search engines"
                    rows={2}
                  />
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editingPackage ? (
                "Update Package"
              ) : (
                "Create Package"
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
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Package
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this package? This action cannot be
              undone.
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
