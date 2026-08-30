/**
 * INSIDER Navbar Skeleton
 *
 * Shown instantly while the real <Navbar /> (categories fetch +
 * streamed admin check) resolves inside its <Suspense> boundary.
 *
 * IMPORTANT: dimensions here must match the real navbar's header
 * height (h-16 / lg:h-[70px]) exactly, or the page will jump when
 * the real navbar swaps in.
 */
export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[70px] lg:px-8">
        {/* Logo placeholder */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-muted" />
          <span className="h-5 w-20 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Desktop nav placeholder */}
        <div className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
          {[64, 84, 96, 72, 88].map((width, i) => (
            <span
              key={i}
              className="h-8 animate-pulse rounded-full bg-muted"
              style={{ width, animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>

        {/* Right side placeholder */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="hidden h-8 w-8 animate-pulse rounded-full bg-muted lg:block" />
          <span aria-hidden="true" className="hidden h-6 w-px bg-border/70 lg:block" />
          <span className="hidden h-9 w-20 animate-pulse rounded-full bg-muted lg:block" />
          <span className="h-9 w-9 animate-pulse rounded-full bg-muted lg:hidden" />
        </div>
      </div>
    </header>
  );
}
