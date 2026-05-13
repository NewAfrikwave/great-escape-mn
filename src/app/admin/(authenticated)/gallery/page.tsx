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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  Loader2,
  AlertTriangle,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface GalleryData {
  id: string;
  title: string;
  altText: string;
  caption: string | null;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  altText: string;
  caption: string;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm: FormData = {
  title: "",
  altText: "",
  caption: "",
  imageUrl: "",
  category: "Other",
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
};

const CATEGORY_OPTIONS = [
  { value: "Sunset Cruises", label: "Sunset Cruises" },
  { value: "Family Lake Days", label: "Family Lake Days" },
  { value: "Fishing Trips", label: "Fishing Trips" },
  { value: "Celebrations", label: "Celebrations" },
  { value: "Fall Colors", label: "Fall Colors" },
  { value: "Pontoon Boat", label: "Pontoon Boat" },
  { value: "Behind the Scenes", label: "Behind the Scenes" },
  { value: "Other", label: "Other" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Sunset Cruises": "bg-orange-100 text-orange-800 border-orange-200",
  "Family Lake Days": "bg-sky-100 text-sky-800 border-sky-200",
  "Fishing Trips": "bg-cyan-100 text-cyan-800 border-cyan-200",
  Celebrations: "bg-pink-100 text-pink-800 border-pink-200",
  "Fall Colors": "bg-amber-100 text-amber-800 border-amber-200",
  "Pontoon Boat": "bg-blue-100 text-blue-800 border-blue-200",
  "Behind the Scenes": "bg-gray-100 text-gray-800 border-gray-200",
  Other: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryData | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/gallery");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setImages(data);
    } catch {
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const filteredImages =
    activeCategory === "All"
      ? images
      : images.filter((img) => img.category === activeCategory);

  const openAddDialog = () => {
    setEditingImage(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (img: GalleryData) => {
    setEditingImage(img);
    setForm({
      title: img.title,
      altText: img.altText,
      caption: img.caption || "",
      imageUrl: img.imageUrl,
      category: img.category,
      isFeatured: img.isFeatured,
      isActive: img.isActive,
      sortOrder: img.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.imageUrl.trim() || !form.category) {
      toast.error("Please fill in title, image URL, and category");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        altText: form.altText || form.title,
        caption: form.caption || null,
      };

      let res: Response;
      if (editingImage) {
        res = await fetch(`/api/admin/gallery/${editingImage.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save gallery image");
      }

      toast.success(
        editingImage
          ? "Gallery image updated successfully"
          : "Gallery image created successfully"
      );
      setDialogOpen(false);
      fetchImages();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save gallery image"
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
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, [field]: value } : img))
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
      const res = await fetch(`/api/admin/gallery/${deleteConfirmId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Gallery image deleted successfully");
      setImages((prev) => prev.filter((img) => img.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete gallery image"
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
            Gallery
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {images.length} {images.length === 1 ? "image" : "images"} total
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]">
          <Plus className="h-4 w-4" />
          Add Image
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger
            value="All"
            className="text-xs data-[state=active]:bg-[#1a2744] data-[state=active]:text-white"
          >
            All
          </TabsTrigger>
          {CATEGORY_OPTIONS.map((opt) => (
            <TabsTrigger
              key={opt.value}
              value={opt.value}
              className="text-xs data-[state=active]:bg-[#1a2744] data-[state=active]:text-white"
            >
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No images found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {activeCategory !== "All"
                ? "No images in this category. Try selecting a different category or add a new image."
                : "Add your first gallery image to get started."}
            </p>
            <Button onClick={openAddDialog} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredImages.map((img) => (
            <Card key={img.id} className="overflow-hidden group">
              {/* Image Thumbnail */}
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {img.imageUrl ? (
                  <img
                    src={img.imageUrl}
                    alt={img.altText || img.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}

                {/* Overlay Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {img.isFeatured && (
                    <Badge className="gap-1 text-xs bg-[#c8993e] text-white hover:bg-[#c8993e] border-0">
                      <Star className="h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Active/Inactive Overlay */}
                {!img.isActive && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge variant="secondary" className="text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </Badge>
                  </div>
                )}

                {/* Action Buttons Overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditDialog(img)}
                    className="h-7 w-7 p-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDeleteConfirmId(img.id)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>

              {/* Card Content */}
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-medium text-sm truncate min-w-0">
                    {img.title}
                  </h3>
                </div>

                <Badge
                  variant="outline"
                  className={`text-xs ${
                    CATEGORY_COLORS[img.category] || CATEGORY_COLORS.Other
                  }`}
                >
                  {img.category}
                </Badge>

                <div className="flex items-center justify-between pt-1 border-t">
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <Switch
                      checked={img.isActive}
                      onCheckedChange={(checked) =>
                        handleToggle(img.id, "isActive", checked)
                      }
                    />
                    <Eye className="h-3 w-3 text-muted-foreground" />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <Switch
                      checked={img.isFeatured}
                      onCheckedChange={(checked) =>
                        handleToggle(img.id, "isFeatured", checked)
                      }
                    />
                    <Star
                      className={`h-3 w-3 ${
                        img.isFeatured
                          ? "text-[#c8993e] fill-[#c8993e]"
                          : "text-muted-foreground"
                      }`}
                    />
                  </label>
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
              {editingImage ? "Edit Gallery Image" : "Add Gallery Image"}
            </DialogTitle>
            <DialogDescription>
              {editingImage
                ? "Update the image details below."
                : "Fill in the details to add a new gallery image."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. Sunset on Prior Lake"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="altText">Alt Text</Label>
              <Input
                id="altText"
                value={form.altText}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, altText: e.target.value }))
                }
                placeholder="Descriptive alt text for accessibility (defaults to title)"
              />
              <p className="text-xs text-muted-foreground">
                Used for accessibility and SEO. Defaults to title if left empty.
              </p>
            </div>

            <ImageUploadField
              id="imageUrl"
              label="Gallery Image"
              value={form.imageUrl}
              required
              guide="Recommended size: 1600 x 1000px for gallery photos."
              onChange={(value) =>
                setForm((prev) => ({ ...prev, imageUrl: value }))
              }
            />

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={form.caption}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, caption: e.target.value }))
                }
                placeholder="Optional caption for the image..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              ) : editingImage ? (
                "Update Image"
              ) : (
                "Add Image"
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
              Delete Image
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gallery image? This action cannot
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
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
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
