import Image from "next/image";

import { formatArticleDate, getAuthorDisplayName, getAuthorInitials } from "@/lib/format";
import type { HomeBlogListItem } from "@/app/actions/(blog)/get-home-blogs-action";

export function AuthorMeta({
  author,
  publishedAt,
  readingTime,
  size = "default",
}: {
  author: HomeBlogListItem["author"];
  publishedAt: Date | null;
  readingTime: number | null;
  size?: "default" | "sm";
}) {
  const name = getAuthorDisplayName(author);
  const initials = getAuthorInitials(author);
  const date = formatArticleDate(publishedAt);
  const avatarSize = size === "sm" ? 20 : 28;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      <span
        className="relative flex shrink-0 overflow-hidden rounded-full bg-muted"
        style={{ width: avatarSize, height: avatarSize }}
      >
        {author.imageUrl ? (
          <Image
            src={author.imageUrl}
            alt={name}
            fill
            sizes={`${avatarSize}px`}
            className="object-cover"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center font-medium text-foreground"
            style={{ fontSize: avatarSize * 0.4 }}
            aria-hidden="true"
          >
            {initials}
          </span>
        )}
      </span>

      <span className="truncate font-medium text-foreground">{name}</span>

      {date && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(publishedAt as Date).toISOString()}>{date}</time>
        </>
      )}

      {readingTime != null && (
        <>
          <span aria-hidden="true">·</span>
          <span>{readingTime} min read</span>
        </>
      )}
    </div>
  );
}
