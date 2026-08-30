// src/components/editors/editor-image-upload.tsx
"use client";

import { Camera, Check, Copy, Loader2, User } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { uploadEditorProfileImageAction } from "@/app/actions/(images)/upload-editor-profile-image-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// NOTE: adjust this import path to wherever `uploadEditorProfileImageAction`
// actually lives in your project (e.g. src/app/actions/(editor)/upload-editor-profile-image-action.ts)

interface EditorImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function EditorImageUpload({ value, onChange, disabled }: EditorImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [copied, setCopied] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview while the upload is in flight.
    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl);
    setIsUploading(true);
    setCopied(false);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const result = await uploadEditorProfileImageAction(formData);

      if (!result.success) {
        toast.error(result.error);
        setPreview(value);
        return;
      }

      onChange(result.data.url);
      setPreview(result.data.url);
      toast.success("Editor image uploaded successfully.");
    } catch (error) {
      console.error("Editor image upload failed:", error);
      toast.error("Something went wrong while uploading the image.");
      setPreview(value);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreviewUrl);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleCopy() {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Image URL copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the URL. Please copy it manually.");
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="relative shrink-0">
        <Avatar className="h-20 w-20 border">
          <AvatarImage src={preview} alt="Editor profile preview" />
          <AvatarFallback>
            <User className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className={cn(
            "absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
          aria-label="Upload editor image"
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/tiff"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
      </div>

      <div className="w-full space-y-1.5">
        <Label htmlFor="editor-image-url" className="text-xs text-muted-foreground">
          Image URL
        </Label>
        <div className="flex gap-2">
          <Input
            id="editor-image-url"
            readOnly
            value={value ?? ""}
            placeholder="Upload an image to generate a URL"
            className="text-xs sm:text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            disabled={!value}
            aria-label="Copy image URL"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, GIF, AVIF, or TIFF. Max 5 MB. Cropped to 800 × 800.
        </p>
      </div>
    </div>
  );
}
