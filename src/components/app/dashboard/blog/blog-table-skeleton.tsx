import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BlogsTableSkeletonProps {
  rows?: number;
}

export function BlogsTableSkeleton({ rows = 8 }: BlogsTableSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-9 w-full sm:max-w-xs" />
          <Skeleton className="h-9 w-full sm:w-[160px]" />
          <Skeleton className="h-9 w-full sm:w-[160px]" />
        </div>
        <Skeleton className="h-9 w-full sm:w-[140px]" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border bg-card">
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
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-10 w-14 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="mb-1.5 h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="mb-1.5 h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
