import { Container } from "@/components/app/general/layouts/container";
import { SubcategoryBlogSkeleton } from "@/components/app/pages/subcategorypage/subcategory-blog-skeleton";

export default function Loading() {
  return (
    <main>
      <Container>
        <div className="pb-12 pt-10 sm:pb-16 sm:pt-12">
          <SubcategoryBlogSkeleton />
        </div>
      </Container>
    </main>
  );
}
