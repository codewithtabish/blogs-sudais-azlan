"use server";

import { uploadBannerImage } from "@/lib/images/upload-banner-image";

type UploadBannerSuccess = {
  success: true;

  data: {
    url: string;
    key: string;
    width: number;
    height: number;
    format: string;
  };
};

type UploadBannerError = {
  success: false;
  error: string;
};

export type UploadBannerResult = UploadBannerSuccess | UploadBannerError;

// 10 MB maximum
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/tiff",
]);

export async function uploadBannerAction(formData: FormData): Promise<UploadBannerResult> {
  try {
    // -------------------------------------------------------
    // 1. Get file
    // -------------------------------------------------------

    const value = formData.get("file");

    if (!(value instanceof File)) {
      return {
        success: false,
        error: "No valid banner image was provided.",
      };
    }

    // -------------------------------------------------------
    // 2. Validate size
    // -------------------------------------------------------

    if (value.size === 0) {
      return {
        success: false,
        error: "The selected banner image is empty.",
      };
    }

    if (value.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Banner image must be smaller than 10 MB.",
      };
    }

    // -------------------------------------------------------
    // 3. Validate MIME type
    // -------------------------------------------------------

    if (!ALLOWED_TYPES.has(value.type)) {
      return {
        success: false,
        error: "Unsupported banner image type. Please upload JPEG, PNG, WebP, GIF, AVIF, or TIFF.",
      };
    }

    // -------------------------------------------------------
    // 4. Convert File → Buffer
    // -------------------------------------------------------

    const arrayBuffer = await value.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return {
        success: false,
        error: "The uploaded banner image contains no data.",
      };
    }

    // -------------------------------------------------------
    // 5. Debug information
    // -------------------------------------------------------

    console.log("Banner upload received:", {
      name: value.name,
      type: value.type,
      size: value.size,
      bufferSize: buffer.length,
    });

    // -------------------------------------------------------
    // 6. Process + upload
    // -------------------------------------------------------

    const result = await uploadBannerImage({
      file: buffer,
      fileName: value.name,
    });

    // -------------------------------------------------------
    // 7. Success
    // -------------------------------------------------------

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Banner upload failed:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload banner image. Please try again.",
    };
  }
}
