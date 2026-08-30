"use server";

import { uploadOgImage } from "@/lib/images/upload-og-image";

type UploadOgSuccess = {
  success: true;

  data: {
    url: string;
    key: string;
    width: number;
    height: number;
    format: string;
  };
};

type UploadOgError = {
  success: false;
  error: string;
};

export type UploadOgResult = UploadOgSuccess | UploadOgError;

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

export async function uploadOgAction(formData: FormData): Promise<UploadOgResult> {
  try {
    // -------------------------------------------------------
    // 1. Get file
    // -------------------------------------------------------

    const value = formData.get("file");

    if (!(value instanceof File)) {
      return {
        success: false,
        error: "No valid OG image was provided.",
      };
    }

    // -------------------------------------------------------
    // 2. Validate size
    // -------------------------------------------------------

    if (value.size === 0) {
      return {
        success: false,
        error: "The selected OG image is empty.",
      };
    }

    if (value.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "OG image must be smaller than 10 MB.",
      };
    }

    // -------------------------------------------------------
    // 3. Validate MIME type
    // -------------------------------------------------------

    if (!ALLOWED_TYPES.has(value.type)) {
      return {
        success: false,
        error: "Unsupported OG image type. Please upload JPEG, PNG, WebP, GIF, AVIF, or TIFF.",
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
        error: "The uploaded OG image contains no data.",
      };
    }

    // -------------------------------------------------------
    // 5. Debug
    // -------------------------------------------------------

    console.log("OG upload received:", {
      name: value.name,
      type: value.type,
      size: value.size,
      bufferSize: buffer.length,
    });

    // -------------------------------------------------------
    // 6. Process + upload
    // -------------------------------------------------------

    const result = await uploadOgImage({
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
    console.error("OG image upload failed:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload OG image. Please try again.",
    };
  }
}
