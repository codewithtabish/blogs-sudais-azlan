import { Badge } from "@/components/ui/badge";
import { ARTICLE_TYPE_LABELS } from "@/lib/format";
import type { HomeBlogListItem } from "@/app/actions/(blog)/get-home-blogs-action";

export function ArticleTypeBadge({
  type,
  className,
}: {
  type: HomeBlogListItem["type"];
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={`rounded-none border-0 border-l-2 border-primary/60 bg-transparent px-2 py-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground ${
        className ?? ""
      }`}
    >
      {ARTICLE_TYPE_LABELS[type]}
    </Badge>
  );
}
