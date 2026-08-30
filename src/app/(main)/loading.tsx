import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { SecondContainer } from "@/components/app/general/layouts/second-container";

function HeroSkeleton() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full max-w-xl sm:h-12" />
      <Skeleton className="h-10 w-5/6 sm:h-12" />
      <div className="mt-2 flex flex-col gap-2">
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-4 w-2/3 max-w-md" />
      </div>
    </div>
  );
}

function AuthorMetaSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-7 w-7 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

function FeaturedStorySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-10">
      <div className="col-span-1 lg:col-span-3">
        <Skeleton className="aspect-[16/10] w-full rounded-sm lg:aspect-[4/3]" />
      </div>

      <div className="col-span-1 flex flex-col justify-center gap-4 lg:col-span-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-4/5" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <AuthorMetaSkeleton />
      </div>
    </div>
  );
}

function LargeCardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-[16/10] w-full rounded-sm" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-3/4" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <AuthorMetaSkeleton />
    </div>
  );
}

function DefaultCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[4/3] w-full rounded-sm" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <AuthorMetaSkeleton />
    </div>
  );
}

function LatestStoriesSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <Skeleton className="h-8 w-32" />
      </div>

      <Skeleton className="h-px w-full" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <LargeCardSkeleton />
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <DefaultCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

function CompactCardSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="aspect-[4/3] w-24 shrink-0 rounded-sm sm:w-28" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

function CategoryShelfSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-16" />
      </div>

      <Skeleton className="h-px w-full" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <LargeCardSkeleton />

        <div className="flex flex-col gap-6 lg:col-span-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <CompactCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <SecondContainer>
      <main
        className="flex w-full flex-col gap-20 py-12 sm:py-16 lg:py-20"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading the latest stories from INSIDER…</span>

        <HeroSkeleton />
        <FeaturedStorySkeleton />
        <LatestStoriesSkeleton />
        <CategoryShelfSkeleton />
      </main>
    </SecondContainer>
  );
}
