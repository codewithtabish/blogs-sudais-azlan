// src/app/(pages)/dashboard/category/page.tsx
import { ChevronDown, FolderPlus, Plus } from "lucide-react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getAllCategoriesAction } from "@/app/actions/(category)/get-all-categories-action";
import { CategoryTable } from "@/components/app/dashboard/category/category-table";

const DashboardCatgoryPage = async () => {
  const result = await getAllCategoriesAction();
  const categories = result.success ? result.categories : [];

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
            <BreadcrumbPage>Category</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/category/create-category">
                <Plus className="mr-2 h-4 w-4" />
                Create category
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/category/create-subcategory">
                <FolderPlus className="mr-2 h-4 w-4" />
                Create subcategory
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!result.success && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {result.error}
        </p>
      )}

      <CategoryTable categories={categories} />
    </div>
  );
};

export default DashboardCatgoryPage;
