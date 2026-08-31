import { CategoryBlogAuthor } from "@/app/actions/(category)/get-top-category-blogs-action";
import { CalendarDays, UserRound } from "lucide-react";

type CategoryBlogMetaProps = {
  author: CategoryBlogAuthor;
  publishedAt: Date | null;
};

function getAuthorName(author: CategoryBlogAuthor) {
  const name = [author.firstName, author.lastName].filter(Boolean).join(" ");
  return name || "Staff Writer";
}

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function CategoryBlogMeta({ author, publishedAt }: CategoryBlogMetaProps) {
  const formattedDate = formatDate(publishedAt);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <UserRound className="size-3.5 opacity-70" />
        {getAuthorName(author)}
      </span>
      {formattedDate && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5 opacity-70" />
          {formattedDate}
        </span>
      )}
    </div>
  );
}
