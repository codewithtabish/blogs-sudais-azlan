import type { HomeBlogListItem } from "@/app/actions/(blog)/get-home-blogs-action";

export function formatArticleDate(date: Date | null): string {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getAuthorDisplayName(
  author: Pick<HomeBlogListItem["author"], "firstName" | "lastName">,
): string {
  const name = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();

  return name.length > 0 ? name : "INSIDER";
}

export function getAuthorInitials(
  author: Pick<HomeBlogListItem["author"], "firstName" | "lastName">,
): string {
  const first = author.firstName?.[0] ?? "";
  const last = author.lastName?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();

  return initials.length > 0 ? initials : "IN";
}

export const ARTICLE_TYPE_LABELS: Record<HomeBlogListItem["type"], string> = {
  ARTICLE: "Article",
  NEWS: "News",
  OPINION: "Opinion",
  ANALYSIS: "Analysis",
  GUIDE: "Guide",
  REVIEW: "Review",
  INTERVIEW: "Interview",
};
