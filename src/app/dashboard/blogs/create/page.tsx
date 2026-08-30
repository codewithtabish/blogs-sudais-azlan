import CreateBlogForm from "@/components/app/dashboard/blog/blog-create-form";
import ScrollToTopBottom from "@/components/app/dashboard/blog/floating-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const CreateSingleBlogPage = () => {
  return (
    <div className="flex flex-col gap-6 px-4 py-10">
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
            <BreadcrumbPage>Create blog</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-center">
        <CreateBlogForm />
      </div>

      {/* Floating scroll button - only on this page */}
      <ScrollToTopBottom />
    </div>
  );
};

export default CreateSingleBlogPage;
