"use server";

import { uploadEditorProfileImage } from "@/lib/images/upload-editor-profile-image";

// ---------------------------------------------------------
// Success result
// ---------------------------------------------------------

type UploadEditorProfileImageSuccess = {
  success: true;

  data: {
    url: string;
    key: string;
    width: number;
    height: number;
    format: string;
  };
};

// ---------------------------------------------------------
// Error result
// ---------------------------------------------------------

type UploadEditorProfileImageError = {
  success: false;
  error: string;
};

// ---------------------------------------------------------
// Public result type
// ---------------------------------------------------------

export type UploadEditorProfileImageResult =
  UploadEditorProfileImageSuccess | UploadEditorProfileImageError;

// ---------------------------------------------------------
// Upload configuration
// ---------------------------------------------------------

// 5 MB maximum original upload
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/tiff",
]);

// ---------------------------------------------------------
// Upload Editor Profile Image
// ---------------------------------------------------------

export async function uploadEditorProfileImageAction(
  formData: FormData,
): Promise<UploadEditorProfileImageResult> {
  try {
    // -------------------------------------------------------
    // 1. Get file
    // -------------------------------------------------------

    const value = formData.get("file");

    if (!(value instanceof File)) {
      return {
        success: false,
        error: "No valid editor profile image was provided.",
      };
    }

    // -------------------------------------------------------
    // 2. Validate size
    // -------------------------------------------------------

    if (value.size === 0) {
      return {
        success: false,
        error: "The selected editor profile image is empty.",
      };
    }

    if (value.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Editor profile image must be smaller than 5 MB.",
      };
    }

    // -------------------------------------------------------
    // 3. Validate MIME type
    // -------------------------------------------------------

    if (!ALLOWED_TYPES.has(value.type)) {
      return {
        success: false,
        error: "Unsupported image type. Please upload JPEG, PNG, WebP, GIF, AVIF, or TIFF.",
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
        error: "The uploaded editor profile image contains no data.",
      };
    }

    // -------------------------------------------------------
    // 5. Debug information
    // -------------------------------------------------------

    console.log("Editor profile upload received:", {
      name: value.name,
      type: value.type,
      size: value.size,
      bufferSize: buffer.length,
    });

    // -------------------------------------------------------
    // 6. Process + upload
    // -------------------------------------------------------

    const result = await uploadEditorProfileImage({
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
    console.error("Editor profile image upload failed:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload editor profile image. Please try again.",
    };
  }
}
