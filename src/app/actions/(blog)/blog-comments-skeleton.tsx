import { Skeleton } from "@/components/ui/skeleton";

export function BlogCommentsSkeleton() {
  return (
    <section className="not-prose mt-16 border-t border-border pt-10">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Policy text */}
      <Skeleton className="mb-6 h-4 w-full max-w-xl" />

      {/* Comment form */}
      <div className="mb-8 space-y-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Sort */}
      <Skeleton className="mb-6 h-5 w-32" />

      {/* Comments list */}
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            {/* Avatar */}
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

            <div className="min-w-0 flex-1 space-y-3">
              {/* Name + time */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>

              {/* Content lines */}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
