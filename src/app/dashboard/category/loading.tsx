// src/app/(pages)/dashboard/category/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CategoryLoading() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-14" />
      </div>

      {/* Header row skeleton — title + create dropdown button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[36px]" />
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Subcategories</TableHead>
              <TableHead className="text-center">Sort order</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="flex justify-center">
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell className="flex justify-center">
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell className="flex justify-center">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="flex justify-end">
                  <Skeleton className="h-7 w-7 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
