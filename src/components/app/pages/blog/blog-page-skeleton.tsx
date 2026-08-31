import { Skeleton } from "@/components/ui/skeleton";

export function BlogPostSkeleton() {
  return (
    <main>
      {/* Header skeleton */}
      <div className="mx-auto max-w-4xl space-y-4 px-4 pt-10 sm:pt-14">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="aspect-video w-full rounded-xl" />
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </main>
  );
}
