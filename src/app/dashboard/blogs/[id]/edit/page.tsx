import Link from "next/link";
import { Suspense } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import UpdateBlogForm from "@/components/app/dashboard/blog/update-blog-form";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

function EditBlogPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
      <div className="h-125 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

async function EditBlogContent({ params }: EditBlogPageProps) {
  const { id } = await params;

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
            <BreadcrumbLink asChild>
              <Link href="/dashboard/blogs">Blogs</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <UpdateBlogForm blogId={id} />
    </div>
  );
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  return (
    <Suspense fallback={<EditBlogPageSkeleton />}>
      <EditBlogContent params={params} />
    </Suspense>
  );
}
