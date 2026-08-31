import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import {
  CategoryPageBlogItem,
  CategoryPageData,
} from "@/app/actions/(category)/get-top-category-blogs-action";
import { CategoryBlogMeta } from "./category-blog-metadat";
import { CategorySidebar } from "./category-sidebar";

type CategoryBlogComponentProps = {
  category: CategoryPageData;
};

function blogHref(categorySlug: string, blog: CategoryPageBlogItem) {
  return `/${categorySlug}/${blog.subcategory.slug}/${blog.slug}`;
}

export function CategoryBlogComponent({ category }: CategoryBlogComponentProps) {
  const [featuredBlog, ...restBlogs] = category.blogs;
  const gridBlogs = restBlogs.slice(0, 3);
  const moreBlogs = restBlogs.slice(3);

  return (
    <div className="space-y-12">
      {/* ──────────────────────────────────────────────
          TOP SECTION → Sidebar + Featured (image on top)
          ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sticky Sidebar */}
        <div className="lg:sticky lg:top-24">
          <CategorySidebar category={category} />
        </div>

        {/* Featured Article – image on top, content below */}
        {featuredBlog ? (
          <div className="space-y-5">
            {/* Big image */}
            <Link
              href={blogHref(category.slug, featuredBlog)}
              className="group relative block aspect-[16/9] overflow-hidden rounded-xl bg-muted lg:aspect-[2/1]"
            >
              <Image
                src={featuredBlog.bannerImage}
                alt={featuredBlog.bannerImageAlt ?? featuredBlog.title}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>

            {/* Content below image */}
            <div className="space-y-3">
              <Badge
                variant="secondary"
                className="w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
              >
                {featuredBlog.subcategory.name}
              </Badge>

              <Link href={blogHref(category.slug, featuredBlog)} className="group block">
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary lg:text-4xl">
                  {featuredBlog.title}
                </h2>
              </Link>

              {featuredBlog.shortDescription && (
                <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
                  {featuredBlog.shortDescription}
                </p>
              )}

              <CategoryBlogMeta
                author={featuredBlog.author}
                publishedAt={featuredBlog.publishedAt}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No articles published yet.</p>
        )}
      </div>

      {/* ──────────────────────────────────────────────
          3-CARD GRID → Full width
          ────────────────────────────────────────────── */}
      {gridBlogs.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gridBlogs.map((blog) => (
            <Link key={blog.id} href={blogHref(category.slug, blog)} className="group">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                <Image
                  src={blog.bannerImage}
                  alt={blog.bannerImageAlt ?? blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-4 space-y-2">
                <Badge
                  variant="secondary"
                  className="w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                >
                  {blog.subcategory.name}
                </Badge>

                <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {blog.title}
                </h3>

                <CategoryBlogMeta author={blog.author} publishedAt={blog.publishedAt} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ──────────────────────────────────────────────
          MORE SECTION → Full width list
          ────────────────────────────────────────────── */}
      {moreBlogs.length > 0 && (
        <div>
          <div className="mb-8 flex items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
              More {category.name}
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-8">
            {moreBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={blogHref(category.slug, blog)}
                className="group flex items-start gap-5"
              >
                <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
                  <Image
                    src={blog.bannerImage}
                    alt={blog.bannerImageAlt ?? blog.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-2 pt-0.5">
                  <Badge
                    variant="secondary"
                    className="w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                  >
                    {blog.subcategory.name}
                  </Badge>

                  <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {blog.title}
                  </h3>

                  <CategoryBlogMeta author={blog.author} publishedAt={blog.publishedAt} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
