"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;
const TARGET_MAX_WIDTH = 1800;
const TARGET_MAX_HEIGHT = 1200;

interface ImageUploadFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  guide: string;
  previewHeight?: string;
}

async function resizeImageForUpload(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_SIZE && file.type === "image/png") return file;

  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not read image"));
      image.src = objectUrl;
    });

    const scale = Math.min(
      1,
      TARGET_MAX_WIDTH / image.naturalWidth,
      TARGET_MAX_HEIGHT / image.naturalHeight
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.88)
    );
    if (!blob) return file;

    return new File(
      [blob],
      file.name.replace(/\.[^.]+$/, "") + ".jpg",
      { type: "image/jpeg" }
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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

    const uploadFile = await resizeImageForUpload(file);
    if (uploadFile.size > MAX_UPLOAD_SIZE) {
      toast.error("Image is too large. Please choose a JPG or PNG under 8MB.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", uploadFile);
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
            {guide} JPG or PNG. Large photos are automatically resized before upload.
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
