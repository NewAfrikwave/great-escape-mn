"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Pencil,
  Loader2,
  Save,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface PageContentData {
  id: string;
  pageKey: string;
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EditFormData {
  pageKey: string;
  title: string;
  content: string;
}

export default function ContentManagementPage() {
  const [content, setContent] = useState<PageContentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    pageKey: "",
    title: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content");
      if (!res.ok) throw new Error("Failed to fetch content");
      const data: PageContentData[] = await res.json();
      setContent(data);
    } catch {
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const filtered = content.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.pageKey.toLowerCase().includes(q) ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.content && item.content.toLowerCase().includes(q))
    );
  });

  const openEdit = (item: PageContentData) => {
    setEditForm({
      pageKey: item.pageKey,
      title: item.title || "",
      content: item.content || "",
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            pageKey: editForm.pageKey,
            title: editForm.title || null,
            content: editForm.content || null,
          },
        ]),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save content");
      }

      // Update local state
      setContent((prev) =>
        prev.map((item) =>
          item.pageKey === editForm.pageKey
            ? { ...item, title: editForm.title || null, content: editForm.content || null, updatedAt: new Date().toISOString() }
            : item
        )
      );

      setEditDialogOpen(false);
      toast.success(`Content for "${editForm.pageKey}" updated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const groupByPagePrefix = (items: PageContentData[]) => {
    const groups: Record<string, PageContentData[]> = {};
    for (const item of items) {
      const prefix = item.pageKey.split("_")[0] || item.pageKey.split("-")[0] || "other";
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(item);
    }
    return groups;
  };

  const grouped = groupByPagePrefix(filtered);
  const groupLabels: Record<string, string> = {
    homepage: "Homepage",
    about: "About",
    booking: "Booking",
    gallery: "Gallery",
    faq: "FAQ",
    contact: "Contact",
    experiences: "Experiences",
    other: "Other",
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
          <FileText className="h-6 w-6 text-[#1a2744]" />
          <h1 className="text-2xl font-bold text-[#1a2744]">
            Pages &amp; Content
          </h1>
          <Badge className="bg-[#1a2744] text-white hover:bg-[#1a2744]">
            {content.length}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search content areas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Content Cards by Group */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No content areas found</h3>
            <p className="text-muted-foreground text-sm">
              {search
                ? "Try adjusting your search terms."
                : "Content areas will appear here when they are created."}
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([group, items]) => (
          <Card key={group}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
                {groupLabels[group] || group.charAt(0).toUpperCase() + group.slice(1)}
                <Badge variant="outline" className="text-xs">
                  {items.length} {items.length === 1 ? "area" : "areas"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {item.pageKey}
                      </span>
                      {item.title && (
                        <span className="font-medium text-sm truncate">
                          {item.title}
                        </span>
                      )}
                    </div>
                    {item.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(item.updatedAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(item)}
                    className="shrink-0 gap-1.5 text-[#1a2744] hover:text-[#c8993e]"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-[#1a2744]" />
              Edit Content
            </DialogTitle>
            <DialogDescription>
              Update the content for{" "}
              <span className="font-mono font-semibold text-foreground">
                {editForm.pageKey}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-pageKey">Page Key</Label>
              <Input
                id="edit-pageKey"
                value={editForm.pageKey}
                disabled
                className="font-mono text-sm bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Content area title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editForm.content}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Write your content here..."
                rows={12}
                className="resize-y"
              />
              <p className="text-xs text-muted-foreground">
                Supports plain text. For rich content, use appropriate formatting.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
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
              {saving ? "Saving..." : "Save Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
