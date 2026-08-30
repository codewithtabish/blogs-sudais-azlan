// src/app/(pages)/dashboard/editor/loading.tsx
import { Plus } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SKELETON_ROWS = 6;

export default function DashboardEditorLoading() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editor</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editors</h1>

        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create editor
        </Button>
      </div>

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
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
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
    </div>
  );
}
