import Image from "next/image";
import Link from "next/link";

import { getArticleImageUrl } from "@/lib/article-image";
import { ArticleTypeBadge } from "./article-type-badge";
import { AuthorMeta } from "./author-meta";
import { Reveal } from "./reveal";
import type { HomeBlogListItem } from "@/app/actions/(blog)/get-home-blogs-action";

export function FeaturedStory({ blog }: { blog: HomeBlogListItem }) {
  const href = `/${blog.category.slug}/${blog.subcategory.slug}/${blog.slug}`;
  const imageUrl = getArticleImageUrl(blog.bannerImage);
  const alt = blog.bannerImageAlt || blog.title;

  return (
    <Reveal>
      <article className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-10">
        <Link
          href={href}
          className="group relative col-span-1 block aspect-16/10 overflow-hidden rounded-sm bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:col-span-3 lg:aspect-4/3"
        >
          <Image
            src={imageUrl}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        </Link>

        <div className="col-span-1 flex flex-col justify-center gap-5 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${blog.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
            >
              {blog.category.name}
            </Link>
            <ArticleTypeBadge type={blog.type} />
          </div>

          <Link
            href={href}
            className="font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-4xl"
          >
            {blog.title}
          </Link>

          {blog.shortDescription && (
            <p className="line-clamp-3 max-w-prose text-base leading-relaxed text-muted-foreground">
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
    </Reveal>
  );
}
