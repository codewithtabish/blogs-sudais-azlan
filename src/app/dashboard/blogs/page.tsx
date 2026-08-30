import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import {
  GetBlogsInput,
  getDashboardBlogsAction,
} from "@/app/actions/(blog)/(dashboard)/get-dashboard-blog";
import {
  CategoryListItem,
  getAllCategoriesAction,
} from "@/app/actions/(category)/get-all-categories-action";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { BlogsTableSkeleton } from "@/components/app/dashboard/blog/blog-table-skeleton";
import { BlogsTable } from "@/components/app/dashboard/blog/dashboard-blog-table";

interface DashboardBlogsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// NOTE: this component is intentionally NOT async and does NOT touch
// `searchParams` itself. Next.js needs everything above the <Suspense>
// boundary to be static so it can prerender the shell (breadcrumb, title,
// layout) and stream the dynamic part in — that's what the "runtime data
// accessed outside of <Suspense>" error was about. The promise is just
// passed down unread; only the component *inside* Suspense awaits it.
export default function DashboardBlogsPage({ searchParams }: DashboardBlogsPageProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Blogs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Blogs</h1>
          <p className="text-sm text-muted-foreground">
            Manage every blog post — filter, browse, and take action.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/blogs/create">
            <Plus className="mr-2 h-4 w-4" />
            Create blog
          </Link>
        </Button>
      </div>

      <Suspense fallback={<BlogsTableSkeleton />}>
        <BlogsTableSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// ============================================================
// DATA-FETCHING BOUNDARY
// Everything dynamic — reading searchParams, fetching categories, fetching
// the blog list — happens in here, inside the Suspense boundary, so it can
// stream in behind the skeleton instead of blocking the whole route.
// ============================================================
async function BlogsTableSection({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const input: GetBlogsInput = {
    page: params.page ? Number(params.page) : 1,
    pageSize: params.pageSize ? Number(params.pageSize) : 10,
    search: typeof params.search === "string" ? params.search : undefined,
    status: (params.status as GetBlogsInput["status"]) ?? "ALL",
    type: (params.type as GetBlogsInput["type"]) ?? "ALL",
    categoryId: typeof params.categoryId === "string" ? params.categoryId : undefined,
    subcategoryId: typeof params.subcategoryId === "string" ? params.subcategoryId : undefined,
    sortBy: (params.sortBy as GetBlogsInput["sortBy"]) ?? "createdAt",
    sortOrder: (params.sortOrder as GetBlogsInput["sortOrder"]) ?? "desc",
  };

  const [categoriesResult, result] = await Promise.all([
    getAllCategoriesAction(),
    getDashboardBlogsAction(input),
  ]);

  const categories: CategoryListItem[] = categoriesResult.success
    ? categoriesResult.categories
    : [];

  return (
    <BlogsTable
      initialInput={input}
      initialBlogs={result.success ? result.data.blogs : []}
      initialPagination={
        result.success
          ? result.data.pagination
          : {
              page: 1,
              pageSize: input.pageSize ?? 10,
              totalCount: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            }
      }
      initialError={result.success ? null : result.error}
      categories={categories}
    />
  );
}
