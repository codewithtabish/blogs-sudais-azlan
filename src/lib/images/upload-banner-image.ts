import s3Client from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import sharp from "sharp";

interface UploadBannerOptions {
  file: Buffer;
  fileName?: string;
  folder?: string;
}

export async function uploadBannerImage({
  file,
  fileName,
  folder = process.env.AWS_S3_BLOGS_FOLDER || "blogs",
}: UploadBannerOptions) {
  // ---------------------------------------------------------
  // 1. Basic buffer validation
  // ---------------------------------------------------------

  if (!Buffer.isBuffer(file)) {
    throw new Error("Uploaded image is not a valid Buffer.");
  }

  if (file.length === 0) {
    throw new Error("Uploaded image is empty.");
  }

  // ---------------------------------------------------------
  // 2. Verify the ORIGINAL image
  // ---------------------------------------------------------

  let metadata;

  try {
    metadata = await sharp(file).metadata();
  } catch (error) {
    console.error("Sharp could not read banner image:", error);

    throw new Error("The uploaded file is not a valid or supported image.");
  }

  if (!metadata.format) {
    throw new Error("Unable to detect the banner image format.");
  }

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to detect the banner image dimensions.");
  }

  console.log("Banner image detected:", {
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    size: file.length,
  });

  // ---------------------------------------------------------
  // 3. Process image
  //
  // IMPORTANT:
  // There is intentionally NO SVG/composite here.
  //
  // This avoids the SVG/libvips issue that was causing:
  //
  // Input buffer contains unsupported image format
  // ---------------------------------------------------------

  let processedImage: Buffer;

  try {
    processedImage = await sharp(file)
      /*
       * Respect EXIF orientation.
       */
      .rotate()

      /*
       * ATATIVE blog banner:
       *
       * 1600 × 900
       * 16:9
       */
      .resize(1600, 900, {
        fit: "cover",
        position: "centre",
      })

      /*
       * Convert to optimized WebP.
       */
      .webp({
        quality: 85,
        effort: 4,
      })

      .toBuffer();
  } catch (error) {
    console.error("Banner image processing failed:", error);

    throw new Error("Failed to process the banner image.");
  }

  if (!processedImage || processedImage.length === 0) {
    throw new Error("Image processing produced an empty image.");
  }

  // ---------------------------------------------------------
  // 4. Generate unique filename
  // ---------------------------------------------------------

  const uniqueId = randomUUID().split("-")[0];

  const cleanFileName = fileName
    ? fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "banner";

  const finalFileName = `${cleanFileName}-${uniqueId}.webp`;

  // ---------------------------------------------------------
  // 5. S3 key
  // ---------------------------------------------------------

  const key = `${folder}/banner/${finalFileName}`;

  // ---------------------------------------------------------
  // 6. Upload to S3
  // ---------------------------------------------------------

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: processedImage,
        ContentType: "image/webp",

        /*
         * Images are immutable because every upload gets
         * a unique filename.
         */
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    console.error("Banner S3 upload failed:", error);

    throw new Error("Failed to upload the banner image to storage.");
  }

  // ---------------------------------------------------------
  // 7. CloudFront URL
  // ---------------------------------------------------------

  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL?.replace(/\/$/, "");

  if (!cloudFrontUrl) {
    throw new Error("AWS_CLOUDFRONT_URL is not configured.");
  }

  const url = `${cloudFrontUrl}/${key}`;

  // ---------------------------------------------------------
  // 8. Return result
  // ---------------------------------------------------------

  return {
    url,
    key,
    width: 1600,
    height: 900,
    format: "webp",
  };
}
