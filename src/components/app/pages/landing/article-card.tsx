import Image from "next/image";
import Link from "next/link";

import { getArticleImageUrl } from "@/lib/article-image";
import { ArticleTypeBadge } from "./article-type-badge";
import { AuthorMeta } from "./author-meta";
import type { HomeBlogListItem } from "@/app/actions/(blog)/get-home-blogs-action";

export function ArticleCard({
  blog,
  variant = "default",
  priority = false,
}: {
  blog: HomeBlogListItem;
  variant?: "large" | "default" | "compact";
  priority?: boolean;
}) {
  const href = `/${blog.category.slug}/${blog.subcategory.slug}/${blog.slug}`;
  const imageUrl = getArticleImageUrl(blog.bannerImage);
  const alt = blog.bannerImageAlt || blog.title;
  const hasSubcategory = Boolean(blog.subcategory?.slug);

  if (variant === "compact") {
    return (
      <article className="group flex gap-4">
        <Link
          href={href}
          className="relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-sm bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-28"
        >
          <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${blog.category.slug}`}
              className="text-xs font-medium uppercase tracking-wide text-primary hover:underline"
            >
              {blog.category.name}
            </Link>
            <ArticleTypeBadge type={blog.type} />
          </div>

          <Link
            href={href}
            className="line-clamp-2 font-serif text-base font-semibold leading-snug text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {blog.title}
          </Link>

          <AuthorMeta
            author={blog.author}
            publishedAt={blog.publishedAt}
            readingTime={blog.readingTime}
            size="sm"
          />
        </div>
      </article>
    );
  }

  const isLarge = variant === "large";

  return (
    <article className="group flex flex-col gap-4">
      <Link
        href={href}
        className={`relative block overflow-hidden rounded-sm bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isLarge ? "aspect-16/10" : "aspect-4/3"
        }`}
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          priority={priority}
          sizes={
            isLarge
              ? "(max-width: 768px) 100vw, 40vw"
              : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${blog.category.slug}`}
            className="text-xs font-medium uppercase tracking-wide text-primary hover:underline"
          >
            {blog.category.name}
          </Link>
          {hasSubcategory && (
            <>
              <span className="text-xs text-muted-foreground" aria-hidden="true">
                /
              </span>
              <Link
                href={`/${blog.category.slug}/${blog.subcategory.slug}`}
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:underline"
              >
                {blog.subcategory.name}
              </Link>
            </>
          )}
          <ArticleTypeBadge type={blog.type} />
        </div>

        <Link
          href={href}
          className={`font-serif font-semibold leading-tight text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isLarge ? "text-2xl md:text-3xl" : "text-lg"
          }`}
        >
          {blog.title}
        </Link>

        {blog.shortDescription && (
          <p
            className={`text-muted-foreground ${
              isLarge ? "line-clamp-3 text-base" : "line-clamp-2 text-sm"
            }`}
          >
            {blog.shortDescription}
          </p>
        )}

        <AuthorMeta
          author={blog.author}
          publishedAt={blog.publishedAt}
          readingTime={blog.readingTime}
        />
      </div>
    </article>
  );
}
