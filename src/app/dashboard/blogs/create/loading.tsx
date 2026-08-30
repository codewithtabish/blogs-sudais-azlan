import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* ─────────────────────────────────────────
          Breadcrumb
      ───────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* ─────────────────────────────────────────
          Page Header
      ───────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* ─────────────────────────────────────────
          Editor
      ───────────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main editor */}
        <div className="min-w-0 space-y-6">
          {/* Title */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>

          {/* Editor toolbar */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-8 rounded-md" />
              ))}

              <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>

            {/* Editor content */}
            <div className="min-h-[520px] space-y-5 p-5 sm:p-8">
              <Skeleton className="h-8 w-[70%]" />

              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[94%]" />
              <Skeleton className="h-4 w-[82%]" />

              <div className="py-2" />

              <Skeleton className="h-6 w-[45%]" />

              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[76%]" />

              <div className="py-2" />

              <Skeleton className="h-48 w-full rounded-xl" />

              <Skeleton className="h-4 w-[88%]" />
              <Skeleton className="h-4 w-[68%]" />
            </div>
          </div>

          {/* Bottom editor controls */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────
            Sidebar
        ───────────────────────────────────────── */}
        <aside className="space-y-5">
          {/* Publish */}
          <div className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-5 w-20" />

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Category */}
          <div className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-5 w-24" />

            <div className="mt-5 space-y-3">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Featured image */}
          <div className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-5 w-32" />

            <div className="mt-4 space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-5 w-20" />

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full rounded-md" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
