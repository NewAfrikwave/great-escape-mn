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
  MapPin,
  Loader2,
  AlertTriangle,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface LakeData {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  locationNotes: string | null;
  region: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  slug: string;
  shortDescription: string;
  locationNotes: string;
  region: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm: FormData = {
  name: "",
  slug: "",
  shortDescription: "",
  locationNotes: "",
  region: "",
  imageUrl: "",
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminLakesPage() {
  const [lakes, setLakes] = useState<LakeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLake, setEditingLake] = useState<LakeData | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const fetchLakes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/lakes");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLakes(data);
    } catch {
      toast.error("Failed to load lakes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLakes();
  }, [fetchLakes]);

  const openAddDialog = () => {
    setEditingLake(null);
    setForm(emptyForm);
    setSlugManuallyEdited(false);
    setDialogOpen(true);
  };

  const openEditDialog = (lake: LakeData) => {
    setEditingLake(lake);
    setForm({
      name: lake.name,
      slug: lake.slug,
      shortDescription: lake.shortDescription || "",
      locationNotes: lake.locationNotes || "",
      region: lake.region || "",
      imageUrl: lake.imageUrl || "",
      isFeatured: lake.isFeatured,
      isActive: lake.isActive,
      sortOrder: lake.sortOrder,
    });
    setSlugManuallyEdited(true);
    setDialogOpen(true);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => {
      const updated = { ...prev, name: value };
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
    if (!form.name.trim()) {
      toast.error("Please enter a lake name");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        shortDescription: form.shortDescription || null,
        locationNotes: form.locationNotes || null,
        region: form.region || null,
        imageUrl: form.imageUrl || null,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      };

      let res: Response;
      if (editingLake) {
        res = await fetch(`/api/admin/lakes/${editingLake.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/lakes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save lake");
      }

      toast.success(
        editingLake
          ? "Lake updated successfully"
          : "Lake created successfully"
      );
      setDialogOpen(false);
      fetchLakes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save lake");
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
      const res = await fetch(`/api/admin/lakes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setLakes((prev) =>
        prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
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
      const res = await fetch(`/api/admin/lakes/${deleteConfirmId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Lake deleted successfully");
      setLakes((prev) => prev.filter((l) => l.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete lake");
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
            Service Areas / Lakes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lakes.length} {lakes.length === 1 ? "lake" : "lakes"} total
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]"
        >
          <Plus className="h-4 w-4" />
          Add Lake
        </Button>
      </div>

      {/* Lake Cards */}
      {lakes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No lakes yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your first service area lake to get started.
            </p>
            <Button onClick={openAddDialog} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lake
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lakes.map((lake) => (
            <Card key={lake.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Image Thumbnail */}
                  <div className="sm:w-36 sm:min-h-full h-28 sm:h-auto bg-muted flex-shrink-0 relative overflow-hidden">
                    {lake.imageUrl ? (
                      <img
                        src={lake.imageUrl}
                        alt={lake.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    {lake.isFeatured && (
                      <Badge className="absolute top-2 left-2 gap-1 text-xs bg-[#c8993e] text-white hover:bg-[#c8993e] border-0">
                        <Star className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base">{lake.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">
                          {lake.slug}
                        </p>
                      </div>
                      <Badge
                        variant={lake.isActive ? "default" : "secondary"}
                        className={`text-xs ${
                          lake.isActive
                            ? "bg-[#2d5a3d] hover:bg-[#2d5a3d]"
                            : ""
                        }`}
                      >
                        {lake.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {lake.shortDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {lake.shortDescription}
                      </p>
                    )}

                    {lake.region && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-[#1a2744]/5 border-[#1a2744]/20 text-[#1a2744]"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {lake.region}
                      </Badge>
                    )}

                    {/* Toggles & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <Switch
                            checked={lake.isActive}
                            onCheckedChange={(checked) =>
                              handleToggle(lake.id, "isActive", checked)
                            }
                          />
                          Active
                        </label>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <Switch
                            checked={lake.isFeatured}
                            onCheckedChange={(checked) =>
                              handleToggle(lake.id, "isFeatured", checked)
                            }
                          />
                          Featured
                        </label>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(lake)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(lake.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1a2744]">
              {editingLake ? "Edit Lake" : "Add Lake"}
            </DialogTitle>
            <DialogDescription>
              {editingLake
                ? "Update the lake details below."
                : "Fill in the details to add a new service area lake."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Lake Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Prior Lake"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-generated-from-name"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from name. Edit to customize.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={form.region}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, region: e.target.value }))
                }
                placeholder="e.g. South Metro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                value={form.shortDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shortDescription: e.target.value,
                  }))
                }
                placeholder="Brief description of this lake and area..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationNotes">Location Notes</Label>
              <Textarea
                id="locationNotes"
                value={form.locationNotes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    locationNotes: e.target.value,
                  }))
                }
                placeholder="Notes about location, access, landmarks..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                placeholder="https://example.com/lake-image.jpg"
              />
            </div>

            {/* Image Preview */}
            {form.imageUrl && (
              <div className="rounded-lg overflow-hidden border bg-muted">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

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
              ) : editingLake ? (
                "Update Lake"
              ) : (
                "Create Lake"
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
              Delete Lake
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lake? This action cannot be
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
