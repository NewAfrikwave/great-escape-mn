"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  guide: string;
  previewHeight?: string;
}

export function ImageUploadField({
  id,
  label = "Image",
  value,
  onChange,
  required = false,
  guide,
  previewHeight = "h-40",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Please upload a JPG or PNG image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="rounded-lg border bg-muted/20 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload JPG/PNG
          </Button>
          <p className="text-xs text-muted-foreground">
            {guide} JPG or PNG, max 5MB.
          </p>
        </div>
        <div className="mt-3">
          <Input
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/uploads/admin/image.jpg or https://example.com/image.jpg"
          />
        </div>
        {value ? (
          <div className="mt-3 overflow-hidden rounded-md border bg-background">
            <img
              src={value}
              alt="Preview"
              className={`w-full ${previewHeight} object-cover`}
              onError={(event) => {
                (event.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className={`mt-3 flex ${previewHeight} items-center justify-center rounded-md border border-dashed bg-background text-muted-foreground`}>
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
      </div>
    </div>
  );
}
