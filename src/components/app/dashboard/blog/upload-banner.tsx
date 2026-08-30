"use client";

import { uploadBannerAction } from "@/app/actions/(images)/upload-banner-action";
import { uploadOgAction } from "@/app/actions/(images)/upload-og-action";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner"; // or whatever toast you are using

export default function UploadImages() {
  // Banner states
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerLoading, setBannerLoading] = useState(false);

  // OG states
  const [ogPreview, setOgPreview] = useState<string | null>(null);
  const [ogUrl, setOgUrl] = useState<string | null>(null);
  const [ogLoading, setOgLoading] = useState(false);

  const handleBannerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBannerLoading(true);
    setBannerUrl(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (file) {
      setBannerPreview(URL.createObjectURL(file));
    }

    const result = await uploadBannerAction(formData);

    if (result.success) {
      setBannerUrl(result.data.url);
      toast.success("Banner uploaded successfully!");
    } else {
      toast.error(result.error);
    }

    setBannerLoading(false);
  };

  const handleOgSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOgLoading(true);
    setOgUrl(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (file) {
      setOgPreview(URL.createObjectURL(file));
    }

    const result = await uploadOgAction(formData);

    if (result.success) {
      setOgUrl(result.data.url);
      toast.success("OG image uploaded successfully!");
    } else {
      toast.error(result.error);
    }

    setOgLoading(false);
  };

  return (
    <div className="space-y-10">
      {/* ==================== BANNER UPLOAD ==================== */}
      <div className="max-w-2xl space-y-6 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Upload Banner Image</h2>

        <form onSubmit={handleBannerSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Select Banner Image</label>
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              disabled={bannerLoading}
              className="block w-full cursor-pointer text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={bannerLoading}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {bannerLoading ? "Uploading..." : "Upload Banner"}
          </button>
        </form>

        {bannerPreview && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Preview</p>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
              <Image
                src={bannerUrl || bannerPreview}
                alt="Banner preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

        {bannerUrl && (
          <div className="space-y-1 rounded-md bg-muted p-3">
            <p className="text-sm font-medium text-green-600">Uploaded successfully!</p>
            <p className="break-all text-xs text-muted-foreground">{bannerUrl}</p>
          </div>
        )}
      </div>

      {/* ==================== OG IMAGE UPLOAD ==================== */}
      <div className="max-w-2xl space-y-6 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Upload OG Image</h2>

        <form onSubmit={handleOgSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Select OG Image</label>
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              disabled={ogLoading}
              className="block w-full cursor-pointer text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={ogLoading}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {ogLoading ? "Uploading..." : "Upload OG Image"}
          </button>
        </form>

        {ogPreview && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Preview</p>
            <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-lg border">
              <Image
                src={ogUrl || ogPreview}
                alt="OG image preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

        {ogUrl && (
          <div className="space-y-1 rounded-md bg-muted p-3">
            <p className="text-sm font-medium text-green-600">Uploaded successfully!</p>
            <p className="break-all text-xs text-muted-foreground">{ogUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}
