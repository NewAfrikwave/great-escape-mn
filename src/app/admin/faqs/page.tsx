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
import {
  Plus,
  Pencil,
  Trash2,
  HelpCircle,
  Loader2,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

interface FAQData {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm: FormData = {
  question: "",
  answer: "",
  category: "General",
  isActive: true,
  sortOrder: 0,
};

const CATEGORY_OPTIONS = [
  { value: "Booking", label: "Booking" },
  { value: "Pricing", label: "Pricing" },
  { value: "Boat & Safety", label: "Boat & Safety" },
  { value: "Food & Drinks", label: "Food & Drinks" },
  { value: "Fishing", label: "Fishing" },
  { value: "Weather", label: "Weather" },
  { value: "Service Areas", label: "Service Areas" },
  { value: "General", label: "General" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Booking: "bg-blue-100 text-blue-800 border-blue-200",
  Pricing: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Boat & Safety": "bg-orange-100 text-orange-800 border-orange-200",
  "Food & Drinks": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Fishing: "bg-cyan-100 text-cyan-800 border-cyan-200",
  Weather: "bg-purple-100 text-purple-800 border-purple-200",
  "Service Areas": "bg-pink-100 text-pink-800 border-pink-200",
  General: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQData | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFAQs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFaqs(data);
    } catch {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const openAddDialog = () => {
    setEditingFAQ(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (faq: FAQData) => {
    setEditingFAQ(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive,
      sortOrder: faq.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Please fill in both question and answer");
      return;
    }

    setSaving(true);
    try {
      let res: Response;
      if (editingFAQ) {
        res = await fetch(`/api/admin/faqs/${editingFAQ.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save FAQ");
      }

      toast.success(editingFAQ ? "FAQ updated successfully" : "FAQ created successfully");
      setDialogOpen(false);
      fetchFAQs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, value: boolean) => {
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: value }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setFaqs((prev) =>
        prev.map((f) => (f.id === id ? { ...f, isActive: value } : f))
      );
      toast.success(value ? "FAQ activated" : "FAQ deactivated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/faqs/${deleteConfirmId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("FAQ deleted successfully");
      setFaqs((prev) => prev.filter((f) => f.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete FAQ");
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
          <h1 className="text-2xl font-bold tracking-tight text-[#1a2744]">FAQs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {faqs.length} {faqs.length === 1 ? "FAQ" : "FAQs"} total
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]">
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* FAQ List */}
      {faqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No FAQs yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first FAQ to help answer common customer questions.
            </p>
            <Button onClick={openAddDialog} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Sort Order Indicator */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground sm:pt-0.5 shrink-0">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span className="font-mono">#{faq.sortOrder}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base">
                        {faq.question}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${CATEGORY_COLORS[faq.category] || CATEGORY_COLORS.General}`}
                      >
                        {faq.category}
                      </Badge>
                      <Badge
                        variant={faq.isActive ? "default" : "secondary"}
                        className={`text-xs ${faq.isActive ? "bg-[#2d5a3d] hover:bg-[#2d5a3d]" : ""}`}
                      >
                        {faq.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 sm:pt-0.5">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Switch
                        checked={faq.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleActive(faq.id, checked)
                        }
                      />
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(faq)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(faq.id)}
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
              {editingFAQ ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
            <DialogDescription>
              {editingFAQ
                ? "Update the FAQ details below."
                : "Fill in the details to create a new FAQ."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="question">
                Question <span className="text-destructive">*</span>
              </Label>
              <Input
                id="question"
                value={form.question}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, question: e.target.value }))
                }
                placeholder="e.g. What should I bring on the cruise?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">
                Answer <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="answer"
                value={form.answer}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, answer: e.target.value }))
                }
                placeholder="Provide the answer to this question..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
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

              <div className="flex items-center gap-3 pt-7">
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
              ) : editingFAQ ? (
                "Update FAQ"
              ) : (
                "Create FAQ"
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
              Delete FAQ
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
