/**
 * ASSUMPTION: no existing CloudFront helper was found.
 * If your project already has one, delete this file and use that instead.
 */
export function getArticleImageUrl(bannerImage: string): string {
  if (!bannerImage) {
    return "/placeholder-article.jpg";
  }

  if (/^https?:\/\//i.test(bannerImage)) {
    return bannerImage;
  }

  const base = process.env.AWS_CLOUDFRONT_URL ?? "https://d2rpzp0h8kdnc1.cloudfront.net";

  return `${base.replace(/\/$/, "")}/${bannerImage.replace(/^\//, "")}`;
}
