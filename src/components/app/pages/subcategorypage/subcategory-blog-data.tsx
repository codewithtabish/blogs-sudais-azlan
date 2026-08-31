import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSubcategoryPageBlogsAction } from "@/app/actions/(category)/get-top-subcategory-blogs-action";
import { SubcategoryBlogComponent } from "./subcategory-blog-comp";

type SubcategoryBlogDataProps = {
  categorySlug: string;
  subcategorySlug: string;
};

export async function SubcategoryBlogData({
  categorySlug,
  subcategorySlug,
}: SubcategoryBlogDataProps) {
  const result = await getSubcategoryPageBlogsAction(subcategorySlug);

  if (!result.success) {
    notFound();
  }

  const subcategory = result.data;

  return (
    <>
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <nav aria-label="Breadcrumb" className="pt-8 sm:pt-10">
        <ol className="flex items-center gap-2 font-sans text-[18px] font-medium">
          <li>
            <Link href="/" className="text-foreground transition-colors hover:text-primary">
              Home
            </Link>
          </li>

          <li aria-hidden="true" className="text-muted-foreground">
            <ChevronRight className="size-5" />
          </li>

          <li>
            <Link
              href={`/${categorySlug}`}
              className="text-foreground transition-colors hover:text-primary"
            >
              {categorySlug}
            </Link>
          </li>

          <li aria-hidden="true" className="text-muted-foreground">
            <ChevronRight className="size-5" />
          </li>

          <li aria-current="page" className="text-primary">
            {subcategory.name}
          </li>
        </ol>
      </nav>

      {/* =====================================================
          SUBCATEGORY CONTENT
      ===================================================== */}

      <section className="pb-12 pt-10 sm:pb-16 sm:pt-12">
        <SubcategoryBlogComponent subcategory={subcategory} />
      </section>
    </>
  );
}
