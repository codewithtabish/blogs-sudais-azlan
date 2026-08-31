import { Skeleton } from "@/components/ui/skeleton";

export function SubcategoryBlogSkeleton() {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Header skeleton */}
      <div className="flex flex-col items-center gap-6 text-center">
        <Skeleton className="size-14 rounded-full" />
        <Skeleton className="h-14 w-64 rounded-xl sm:w-80" />
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>

      {/* Featured + second blog row */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div>
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Two thumbnail blogs */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* More list */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <Skeleton className="h-4 w-32" />
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="size-20 shrink-0 rounded-md sm:size-24" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
