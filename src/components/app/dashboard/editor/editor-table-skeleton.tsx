// src/components/(app)/(dashbaord)/editor/editor-table-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EditorTableSkeletonProps {
  rows?: number;
}

export function EditorTableSkeleton({ rows = 6 }: EditorTableSkeletonProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Editor</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Categories</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[110px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Skeleton className="h-3.5 w-20" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-3.5 w-20" />
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
