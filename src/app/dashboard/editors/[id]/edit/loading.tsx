import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditEditorLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Profile Image Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-3 w-36" />
            </div>
          </CardContent>
        </Card>

        {/* Links Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`space-y-2 ${i === 4 ? "sm:col-span-2" : ""}`}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-64" />
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </CardContent>
        </Card>

        {/* Submit button */}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
