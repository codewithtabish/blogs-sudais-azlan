import { ArticleCard } from "./article-card";
import { EditorialSection } from "./editorial-section";
import type { HomeBlogListItem } from "@/app/actions/(blog)/get-home-blogs-action";

export function TypeShelf({ title, blogs }: { title: string; blogs: HomeBlogListItem[] }) {
  if (blogs.length === 0) return null;

  return (
    <EditorialSection title={title}>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.slice(0, 3).map((blog) => (
          <ArticleCard key={blog.id} blog={blog} variant="default" />
        ))}
      </div>
    </EditorialSection>
  );
}
