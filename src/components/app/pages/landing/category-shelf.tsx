import { ArticleCard } from "./article-card";
import { EditorialSection } from "./editorial-section";
import type { HomeBlogListItem } from "@/app/actions/(blog)/get-home-blogs-action";

export function CategoryShelf({
  category,
  blogs,
}: {
  category: { name: string; slug: string };
  blogs: HomeBlogListItem[];
}) {
  if (blogs.length === 0) return null;

  const [featured, ...rest] = blogs;

  return (
    <EditorialSection title={category.name} viewAllHref={`/${category.slug}`}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <ArticleCard blog={featured} variant="large" />

        {rest.length > 0 && (
          <div className="flex flex-col gap-6 lg:col-span-2">
            {rest.slice(0, 4).map((blog) => (
              <ArticleCard key={blog.id} blog={blog} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </EditorialSection>
  );
}
