import { ArticleCard } from "./article-card";
import type { HomeBlogListItem } from "@/app/actions/(blog)/get-home-blogs-action";
import { EditorialSection } from "./editorial-section";

export function LatestStories({ blogs }: { blogs: HomeBlogListItem[] }) {
  if (blogs.length === 0) return null;

  const [first, ...rest] = blogs;

  return (
    <EditorialSection title="Latest">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <ArticleCard blog={first} variant="large" />
        </div>

        {rest.slice(0, 6).map((blog) => (
          <ArticleCard key={blog.id} blog={blog} variant="default" />
        ))}
      </div>
    </EditorialSection>
  );
}
