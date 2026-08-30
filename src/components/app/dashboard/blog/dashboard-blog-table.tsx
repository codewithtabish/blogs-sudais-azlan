"use client";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { deleteBlogAction } from "@/app/actions/(blog)/(dashboard)/delete-blog-action";
import {
  BlogListItem,
  BlogsPagination,
  BlogStatusFilter,
  BlogTypeFilter,
  GetBlogsInput,
  getDashboardBlogsAction,
} from "@/app/actions/(blog)/(dashboard)/get-dashboard-blog";
import { CategoryListItem } from "@/app/actions/(category)/get-all-categories-action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ============================================================
// STATIC OPTIONS
// ============================================================
const STATUS_OPTIONS: { label: string; value: BlogStatusFilter }[] = [
  { label: "All statuses", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "In review", value: "IN_REVIEW" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

const TYPE_OPTIONS: { label: string; value: BlogTypeFilter }[] = [
  { label: "All types", value: "ALL" },
  { label: "Article", value: "ARTICLE" },
  { label: "News", value: "NEWS" },
  { label: "Opinion", value: "OPINION" },
  { label: "Analysis", value: "ANALYSIS" },
  { label: "Guide", value: "GUIDE" },
  { label: "Review", value: "REVIEW" },
  { label: "Interview", value: "INTERVIEW" },
];

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  IN_REVIEW: "outline",
  SCHEDULED: "outline",
  PUBLISHED: "default",
  ARCHIVED: "destructive",
};

// A sentinel value for the Select "all" option — shadcn's Select can't use
// an empty string as an item value, so we use this and map it back to
// `undefined` before sending the filter to the server action.
const ALL_VALUE = "ALL" as const;

// ============================================================
// PROPS
// ============================================================
interface BlogsTableProps {
  initialInput: GetBlogsInput;
  initialBlogs: BlogListItem[];
  initialPagination: BlogsPagination;
  initialError: string | null;
  categories: CategoryListItem[];
}

export function BlogsTable({
  initialInput,
  initialBlogs,
  initialPagination,
  initialError,
  categories,
}: BlogsTableProps) {
  const [blogs, setBlogs] = React.useState<BlogListItem[]>(initialBlogs);
  const [pagination, setPagination] = React.useState<BlogsPagination>(initialPagination);
  const [error, setError] = React.useState<string | null>(initialError);

  const [search, setSearch] = React.useState(initialInput.search ?? "");
  const [status, setStatus] = React.useState<BlogStatusFilter>(initialInput.status ?? "ALL");
  const [type, setType] = React.useState<BlogTypeFilter>(initialInput.type ?? "ALL");
  const [categoryId, setCategoryId] = React.useState<string>(initialInput.categoryId ?? ALL_VALUE);
  const [subcategoryId, setSubcategoryId] = React.useState<string>(
    initialInput.subcategoryId ?? ALL_VALUE,
  );

  const [isPending, startTransition] = React.useTransition();
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const [blogToDelete, setBlogToDelete] = React.useState<BlogListItem | null>(null);

  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout>>(null);

  // Subcategory options depend on whichever category is currently selected.
  const subcategoryOptions =
    categoryId === ALL_VALUE
      ? []
      : (categories.find((c) => c.id === categoryId)?.subcategories ?? []);

  // ------------------------------------------------------------
  // FETCH HELPER
  // ------------------------------------------------------------
  function fetchBlogs(overrides: Partial<GetBlogsInput> = {}) {
    startTransition(async () => {
      const input: GetBlogsInput = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        search,
        status,
        type,
        categoryId: categoryId === ALL_VALUE ? undefined : categoryId,
        subcategoryId: subcategoryId === ALL_VALUE ? undefined : subcategoryId,
        ...overrides,
      };

      const result = await getDashboardBlogsAction(input);

      if (result.success) {
        setBlogs(result.data.blogs);
        setPagination(result.data.pagination);
        setError(null);
      } else {
        setError(result.error);
      }
    });
  }

  // ------------------------------------------------------------
  // FILTER HANDLERS
  // ------------------------------------------------------------
  function handleSearchChange(value: string) {
    setSearch(value);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      fetchBlogs({ search: value, page: 1 });
    }, 400);
  }

  function handleStatusChange(value: BlogStatusFilter) {
    setStatus(value);
    fetchBlogs({ status: value, page: 1 });
  }

  function handleTypeChange(value: BlogTypeFilter) {
    setType(value);
    fetchBlogs({ type: value, page: 1 });
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    // Changing the category invalidates whatever subcategory was picked.
    setSubcategoryId(ALL_VALUE);
    fetchBlogs({
      categoryId: value === ALL_VALUE ? undefined : value,
      subcategoryId: undefined,
      page: 1,
    });
  }

  function handleSubcategoryChange(value: string) {
    setSubcategoryId(value);
    fetchBlogs({
      subcategoryId: value === ALL_VALUE ? undefined : value,
      page: 1,
    });
  }

  // ------------------------------------------------------------
  // PAGINATION HANDLERS
  // ------------------------------------------------------------
  function goToPage(page: number) {
    if (page < 1 || page > pagination.totalPages) return;
    fetchBlogs({ page });
  }

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------
  function handleConfirmDelete() {
    if (!blogToDelete) return;
    const blog = blogToDelete;

    startDeleteTransition(async () => {
      const result = await deleteBlogAction(blog.id);

      if (result.success) {
        toast.success("Blog deleted", { description: blog.title });
        setBlogToDelete(null);
        // Re-pull the current page so pagination totals/counts stay correct
        // (e.g. if this was the last item on the page, we drop back a page).
        const isLastItemOnPage = blogs.length === 1 && pagination.page > 1;
        fetchBlogs(isLastItemOnPage ? { page: pagination.page - 1 } : {});
      } else {
        toast.error(result.error || "Failed to delete blog");
      }
    });
  }

  const authorName = (blog: BlogListItem) =>
    [blog.author.firstName, blog.author.lastName].filter(Boolean).join(" ") || "Unknown";

  return (
    <div className="flex flex-col gap-4">
      {/* ============================================================ */}
      {/* FILTER BAR */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search blogs..."
            className="pl-8"
          />
        </div>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryId} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={subcategoryId}
          onValueChange={handleSubcategoryChange}
          disabled={categoryId === ALL_VALUE}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Subcategory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All subcategories</SelectItem>
            {subcategoryOptions.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ============================================================ */}
      {/* TABLE */}
      {/* ============================================================ */}
      <div className="relative rounded-lg border bg-card">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">Banner</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {error && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-sm text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            )}

            {!error && blogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                  No blogs found.
                </TableCell>
              </TableRow>
            )}

            {!error &&
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    <div className="relative h-10 w-14 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={blog.bannerImage}
                        alt={blog.bannerImageAlt ?? blog.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="max-w-[260px]">
                    <div className="flex items-center gap-1.5">
                      {blog.featured && (
                        <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                      )}
                      <span className="truncate font-medium">{blog.title}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{blog.category.name}</span>
                      <span className="text-xs text-muted-foreground">{blog.subcategory.name}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm">{authorName(blog)}</TableCell>

                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[blog.status]}>
                      {blog.status.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{blog.type}</Badge>
                  </TableCell>

                  <TableCell className="text-right text-sm tabular-nums">
                    {blog.viewCount.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "—"}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/blogs/${blog.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setBlogToDelete(blog)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* ============================================================ */}
      {/* PAGINATION */}
      {/* ============================================================ */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages} · {pagination.totalCount} blog
          {pagination.totalCount === 1 ? "" : "s"}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevPage || isPending}
            onClick={() => goToPage(pagination.page - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage || isPending}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DELETE CONFIRM DIALOG */}
      {/* ============================================================ */}
      <AlertDialog
        open={!!blogToDelete}
        onOpenChange={(open) => {
          // Don't let the dialog close mid-delete.
          if (!open && !isDeleting) setBlogToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this blog?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">{blogToDelete?.title}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}
              disabled={isDeleting}
              onClick={(e) => {
                // Prevent the dialog's default auto-close so we can control
                // it ourselves once the delete actually finishes.
                e.preventDefault();
                handleConfirmDelete();
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
