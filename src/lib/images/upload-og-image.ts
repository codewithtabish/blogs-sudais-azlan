import s3Client from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import sharp from "sharp";

interface UploadOgImageOptions {
  file: Buffer;
  fileName?: string;
  folder?: string;
}

export async function uploadOgImage({
  file,
  fileName,
  folder = process.env.AWS_S3_BLOGS_FOLDER || "blogs",
}: UploadOgImageOptions) {
  // ---------------------------------------------------------
  // 1. Basic buffer validation
  // ---------------------------------------------------------

  if (!Buffer.isBuffer(file)) {
    throw new Error("Uploaded OG image is not a valid Buffer.");
  }

  if (file.length === 0) {
    throw new Error("Uploaded OG image is empty.");
  }

  // ---------------------------------------------------------
  // 2. Verify original image
  // ---------------------------------------------------------

  let metadata;

  try {
    metadata = await sharp(file).metadata();
  } catch (error) {
    console.error("Sharp could not read OG image:", error);

    throw new Error("The uploaded OG file is not a valid or supported image.");
  }

  if (!metadata.format) {
    throw new Error("Unable to detect the OG image format.");
  }

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to detect the OG image dimensions.");
  }

  console.log("OG image detected:", {
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    size: file.length,
  });

  // ---------------------------------------------------------
  // 3. Process OG image
  //
  // NO SVG
  // NO composite
  //
  // This is intentional.
  // ---------------------------------------------------------

  let processedImage: Buffer;

  try {
    processedImage = await sharp(file)
      /*
       * Respect EXIF orientation.
       */
      .rotate()

      /*
       * Standard Open Graph dimensions:
       *
       * 1200 × 630
       */
      .resize(1200, 630, {
        fit: "cover",
        position: "centre",
      })

      /*
       * Optimized WebP.
       */
      .webp({
        quality: 88,
        effort: 4,
      })

      .toBuffer();
  } catch (error) {
    console.error("OG image processing failed:", error);

    throw new Error("Failed to process the OG image.");
  }

  if (!processedImage || processedImage.length === 0) {
    throw new Error("OG image processing produced an empty image.");
  }

  // ---------------------------------------------------------
  // 4. Unique filename
  // ---------------------------------------------------------

  const uniqueId = randomUUID().split("-")[0];

  const cleanFileName = fileName
    ? fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "og-image";

  const finalFileName = `${cleanFileName}-${uniqueId}.webp`;

  // ---------------------------------------------------------
  // 5. S3 key
  // ---------------------------------------------------------

  const key = `${folder}/og/${finalFileName}`;

  // ---------------------------------------------------------
  // 6. Upload
  // ---------------------------------------------------------

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: processedImage,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    console.error("OG S3 upload failed:", error);

    throw new Error("Failed to upload the OG image to storage.");
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
    width: 1200,
    height: 630,
    format: "webp",
  };
}
