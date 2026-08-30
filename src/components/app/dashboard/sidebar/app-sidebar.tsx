// src/components/dashboard/sidebar.tsx

"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  LayoutDashboard,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Tags,
  UserRoundPen,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Suspense,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import { ModeToggle } from "../../general/theme/mode-toggle";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    label: "Editors",
    href: "/dashboard/editors",
    icon: UserRoundPen,
  },
  {
    label: "Category",
    href: "/dashboard/category",
    icon: Tags,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Blogs",
    href: "/dashboard/blogs",
    icon: Newspaper,
  },
];

const STORAGE_KEY = "dashboard-sidebar-collapsed";

/* =========================================================
   SIDEBAR COLLAPSED STORE
   ========================================================= */

const collapsedListeners = new Set<() => void>();

function subscribeCollapsed(onChange: () => void) {
  collapsedListeners.add(onChange);

  window.addEventListener("storage", onChange);

  return () => {
    collapsedListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getCollapsedSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function getCollapsedServerSnapshot() {
  return false;
}

function setCollapsedStore(next: boolean) {
  window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");

  collapsedListeners.forEach((listener) => {
    listener();
  });
}

/* =========================================================
   SIDEBAR
   ========================================================= */

export function DashboardSidebar() {
  return (
    <Suspense fallback={<DashboardSidebarSkeleton />}>
      <DashboardSidebarContent />
    </Suspense>
  );
}

/* =========================================================
   SIDEBAR CONTENT
   ========================================================= */

function DashboardSidebarContent() {
  const pathname = usePathname();

  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );

  const listRef = useRef<HTMLUListElement>(null);

  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const [marker, setMarker] = useState({
    top: 0,
    height: 0,
    ready: false,
  });

  const toggleCollapsed = () => {
    setCollapsedStore(!collapsed);
  };

  const isActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }

    return pathname?.startsWith(item.href) ?? false;
  };

  /* =========================================================
     ACTIVE NAVIGATION MARKER
     ========================================================= */

  useLayoutEffect(() => {
    const activeItem = NAV_ITEMS.find(isActive);

    const activeElement = activeItem ? itemRefs.current.get(activeItem.href) : null;

    if (!activeElement || !listRef.current) {
      setMarker((previous) => ({
        ...previous,
        ready: false,
      }));

      return;
    }

    const listRect = listRef.current.getBoundingClientRect();
    const itemRect = activeElement.getBoundingClientRect();

    setMarker({
      top: itemRect.top - listRect.top,
      height: itemRect.height,
      ready: true,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, collapsed]);

  return (
    <aside
      className={cn(
        "group/sidebar sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden",
        "border-r border-border bg-sidebar text-sidebar-foreground",
        "transition-[width] duration-300 ease-out",
        collapsed ? "w-19" : "w-64",
      )}
    >
      {/* =====================================================
          NAMEPLATE
          ===================================================== */}

      <div className="relative flex h-20 shrink-0 items-center border-b border-sidebar-border px-5">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="ATATIVE Dashboard"
        >
          {/* Brand mark */}

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-sidebar-primary/40 font-serif text-base font-semibold text-sidebar-primary">
            A
          </span>

          {/* Wordmark */}

          <span
            className={cn(
              "flex min-w-0 flex-col overflow-hidden transition-all duration-300",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            <span className="truncate font-serif text-[15px] font-semibold tracking-[0.14em] uppercase">
              Atative
            </span>

            <span className="truncate text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Editorial Desk
            </span>
          </span>
        </Link>

        {/* ===================================================
            COLLAPSE BUTTON
            =================================================== */}

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className={cn(
            "absolute top-1/2 -right-3.5 flex h-7 w-7",
            "-translate-y-1/2 items-center justify-center",
            "rounded-full border border-sidebar-border",
            "bg-sidebar text-muted-foreground shadow-sm",
            "transition-colors",
            "hover:border-sidebar-primary/50",
            "hover:text-sidebar-primary",
            "focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* =====================================================
          SECTION LABEL
          ===================================================== */}

      <div
        className={cn(
          "px-5 pt-5 pb-2 text-[10px] font-medium",
          "tracking-[0.22em] text-muted-foreground uppercase",
          "transition-opacity duration-200",
          collapsed && "opacity-0",
        )}
      >
        Sections
      </div>

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <nav aria-label="Dashboard navigation" className="relative flex-1 px-3">
        <ul ref={listRef} className="relative flex flex-col gap-1">
          {/* =================================================
              SLIDING ACTIVE MARKER
              ================================================= */}

          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-0 w-0.75",
              "rounded-full bg-sidebar-primary",
              "transition-all duration-300 ease-out",
              marker.ready ? "opacity-100" : "opacity-0",
            )}
            style={{
              top: marker.top,
              height: marker.height,
            }}
          />

          {/* =================================================
              NAV ITEMS
              ================================================= */}

          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;

            return (
              <li
                key={item.href}
                ref={(element) => {
                  if (element) {
                    itemRefs.current.set(item.href, element);
                  } else {
                    itemRefs.current.delete(item.href);
                  }
                }}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3",
                    "rounded-sm py-2.5 pr-3 pl-4 text-sm",
                    "transition-colors",

                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-primary"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  {/* Icon */}

                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0",
                      "transition-transform duration-200",
                      active && "text-sidebar-primary",
                      "group-hover:scale-[1.06]",
                    )}
                  />

                  {/* Label */}

                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap",
                      "transition-all duration-300",
                      collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                    )}
                  >
                    {item.label}
                  </span>

                  {/* =================================================
                      COLLAPSED TOOLTIP
                      ================================================= */}

                  {collapsed && (
                    <span
                      className={cn(
                        "pointer-events-none absolute left-full top-1/2 z-50",
                        "ml-3 -translate-y-1/2 whitespace-nowrap",
                        "rounded-sm border border-border",
                        "bg-popover px-2.5 py-1.5",
                        "text-xs text-popover-foreground shadow-md",
                        "scale-95 opacity-0",
                        "transition-all duration-150",
                        "group-hover:scale-100 group-hover:opacity-100",
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <div
        className={cn(
          "flex items-center gap-3",
          "border-t border-sidebar-border p-4",
          collapsed ? "flex-col" : "flex-row justify-between",
        )}
      >
        <p
          className={cn(
            "truncate text-[10px]",
            "tracking-[0.18em] text-muted-foreground uppercase",
            "transition-opacity duration-200",
            collapsed ? "hidden" : "block",
          )}
        >
          Vol. 01 — Est. 2026
        </p>

        <ModeToggle />
      </div>
    </aside>
  );
}

/* =========================================================
   SUSPENSE FALLBACK
   ========================================================= */

function DashboardSidebarSkeleton() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar text-sidebar-foreground">
      {/* Header */}

      <div className="flex h-20 shrink-0 items-center border-b border-sidebar-border px-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-sm bg-sidebar-accent" />

          <div className="space-y-1.5">
            <div className="h-4 w-20 animate-pulse rounded bg-sidebar-accent" />

            <div className="h-2.5 w-24 animate-pulse rounded bg-sidebar-accent" />
          </div>
        </div>
      </div>

      {/* Section label */}

      <div className="px-5 pt-5 pb-2">
        <div className="h-2.5 w-16 animate-pulse rounded bg-sidebar-accent" />
      </div>

      {/* Navigation */}

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <div className="flex h-10 items-center gap-3 rounded-sm px-4">
                <div className="h-4.5 w-4.5 shrink-0 animate-pulse rounded bg-sidebar-accent" />

                <div className="h-3.5 w-24 animate-pulse rounded bg-sidebar-accent" />
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}

      <div className="flex items-center justify-between border-t border-sidebar-border p-4">
        <div className="h-2.5 w-28 animate-pulse rounded bg-sidebar-accent" />

        <div className="h-8 w-8 animate-pulse rounded-md bg-sidebar-accent" />
      </div>
    </aside>
  );
}

export default DashboardSidebar;
