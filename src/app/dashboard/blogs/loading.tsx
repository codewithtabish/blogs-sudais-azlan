import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-3" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Page title */}
          <Skeleton className="h-8 w-32" />

          {/* Description */}
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        {/* Create button */}
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Filters / toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
        {/* Search */}
        <Skeleton className="h-10 w-full sm:max-w-sm" />

        {/* Category filter */}
        <Skeleton className="h-10 w-full sm:w-40" />

        {/* Status filter */}
        <Skeleton className="h-10 w-full sm:w-32" />

        {/* Spacer / additional action */}
        <div className="hidden flex-1 sm:block" />

        <Skeleton className="h-10 w-24" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Table header */}
        <div className="hidden border-b border-border px-4 py-3 md:grid md:grid-cols-[minmax(260px,2fr)_1fr_1fr_120px_80px] md:items-center md:gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-4 w-12" />
        </div>

        {/* Table rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(260px,2fr)_1fr_1fr_120px_80px] md:items-center"
            >
              {/* Blog */}
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="h-12 w-16 shrink-0 rounded-md" />

                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-[75%] max-w-64" />
                  <Skeleton className="h-3 w-[45%] max-w-40" />
                </div>
              </div>

              {/* Category */}
              <div className="hidden md:block">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>

              {/* Author */}
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Status */}
              <div className="hidden md:block">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>

              {/* Mobile metadata */}
              <div className="flex items-center gap-3 md:hidden">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-40" />

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
