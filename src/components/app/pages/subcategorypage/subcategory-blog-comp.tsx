import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import {
  SubcategoryPageBlogItem,
  SubcategoryPageData,
} from "@/app/actions/(category)/get-top-subcategory-blogs-action";
import { SubcategoryBlogMeta } from "./subcategory-blog-metadata";
import { SubcategoryHeader } from "./subcategory-header";

type SubcategoryBlogComponentProps = {
  subcategory: SubcategoryPageData;
};

function blogHref(subcategorySlug: string, blog: SubcategoryPageBlogItem) {
  return `/${blog.category.slug}/${subcategorySlug}/${blog.slug}`;
}

export function SubcategoryBlogComponent({ subcategory }: SubcategoryBlogComponentProps) {
  const [featuredBlog, secondBlog, ...restBlogs] = subcategory.blogs;
  const thumbBlogs = restBlogs.slice(0, 2);
  const moreBlogs = restBlogs.slice(2);

  return (
    <div className="space-y-10 sm:space-y-12">
      <SubcategoryHeader
        category={subcategory.category}
        currentSubcategorySlug={subcategory.slug}
        currentSubcategoryName={subcategory.name}
      />

      {subcategory.blogs.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No articles published yet.</p>
      ) : (
        <div className="space-y-10">
          {/* Featured + second blog row */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
            {featuredBlog ? (
              <div>
                <Link
                  href={blogHref(subcategory.slug, featuredBlog)}
                  className="group relative block aspect-video overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    src={featuredBlog.bannerImage}
                    alt={featuredBlog.bannerImageAlt ?? featuredBlog.title}
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="mt-4 space-y-2">
                  <Badge variant="secondary" className="w-fit uppercase text-xs">
                    {featuredBlog.category.name}
                  </Badge>
                  <Link href={blogHref(subcategory.slug, featuredBlog)} className="group">
                    <h2 className="text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                      {featuredBlog.title}
                    </h2>
                  </Link>
                  {featuredBlog.shortDescription ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {featuredBlog.shortDescription}
                    </p>
                  ) : null}
                  <SubcategoryBlogMeta
                    author={featuredBlog.author}
                    publishedAt={featuredBlog.publishedAt}
                  />
                </div>
              </div>
            ) : null}

            {secondBlog ? (
              <div>
                <Link
                  href={blogHref(subcategory.slug, secondBlog)}
                  className="group relative block aspect-video overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={secondBlog.bannerImage}
                    alt={secondBlog.bannerImageAlt ?? secondBlog.title}
                    fill
                    sizes="(min-width: 1024px) 35vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="mt-3 space-y-2">
                  <Badge variant="secondary" className="w-fit uppercase text-xs">
                    {secondBlog.category.name}
                  </Badge>
                  <Link href={blogHref(subcategory.slug, secondBlog)} className="group">
                    <h3 className="text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
                      {secondBlog.title}
                    </h3>
                  </Link>
                  {secondBlog.shortDescription ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {secondBlog.shortDescription}
                    </p>
                  ) : null}
                  <SubcategoryBlogMeta
                    author={secondBlog.author}
                    publishedAt={secondBlog.publishedAt}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Two thumbnail blogs — now WITH title/category/meta */}
          {thumbBlogs.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {thumbBlogs.map((blog) => (
                <div key={blog.id}>
                  <Link
                    href={blogHref(subcategory.slug, blog)}
                    className="group relative block aspect-video overflow-hidden rounded-lg bg-muted"
                  >
                    <Image
                      src={blog.bannerImage}
                      alt={blog.bannerImageAlt ?? blog.title}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                  <div className="mt-3 space-y-2">
                    <Badge variant="secondary" className="w-fit uppercase text-xs">
                      {blog.category.name}
                    </Badge>
                    <Link href={blogHref(subcategory.slug, blog)} className="group">
                      <h3 className="text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {blog.title}
                      </h3>
                    </Link>
                    {blog.shortDescription ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {blog.shortDescription}
                      </p>
                    ) : null}
                    <SubcategoryBlogMeta author={blog.author} publishedAt={blog.publishedAt} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* More <Subcategory> list */}
          {moreBlogs.length > 0 ? (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
                  More {subcategory.name}
                </h2>
                <div className="h-px flex-1 bg-primary/40" />
              </div>

              <div className="space-y-6">
                {moreBlogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={blogHref(subcategory.slug, blog)}
                    className="group flex items-start gap-4"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:size-24">
                      <Image
                        src={blog.bannerImage}
                        alt={blog.bannerImageAlt ?? blog.title}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <Badge variant="secondary" className="w-fit uppercase text-xs">
                        {blog.category.name}
                      </Badge>
                      <h3 className="font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {blog.title}
                      </h3>
                      {blog.shortDescription ? (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {blog.shortDescription}
                        </p>
                      ) : null}
                      <SubcategoryBlogMeta author={blog.author} publishedAt={blog.publishedAt} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
