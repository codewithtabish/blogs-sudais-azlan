// src/app/(pages)/dashboard/category/create-category/loading.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateCategoryLoading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-10">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-4xl border-border bg-card">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            {/* Name field */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-3 w-56" />
            </div>

            {/* Slug field */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-3 w-64" />
            </div>

            {/* Description field */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>

            {/* Sort order field */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-3 w-48" />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
