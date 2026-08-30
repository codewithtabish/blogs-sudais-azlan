"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { CategoryListItem } from "@/app/actions/(category)/get-all-categories-action";
import { useNavOverflow } from "./use-nav-overflow";

interface NavbarDesktopNavProps {
  categories: CategoryListItem[];
}

type NavItem = { type: "category"; category: CategoryListItem };

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavbarDesktopNav({ categories }: NavbarDesktopNavProps) {
  const pathname = usePathname();

  const allItems: NavItem[] = categories.map((category) => ({
    type: "category" as const,
    category,
  }));

  const { containerRef, measureRef, visibleCount } = useNavOverflow({
    itemCount: allItems.length,
    moreButtonWidth: 88,
  });

  const visibleItems = allItems.slice(0, visibleCount);
  const overflowItems = allItems.slice(visibleCount);

  return (
    <nav
      ref={containerRef}
      className="relative flex min-w-0 items-center gap-0.5"
      aria-label="Primary"
    >
      {/* Hidden measuring row: mirrors the real items so we can compute widths before rendering. */}
      <div
        ref={measureRef}
        className="pointer-events-none absolute left-0 top-0 flex items-center gap-0.5 opacity-0"
        aria-hidden="true"
      >
        {allItems.map((item) => (
          <div
            key={item.category.id}
            className="whitespace-nowrap px-3.5 py-2 text-[13.5px] font-medium"
          >
            {item.category.name}
            {item.category.subcategories.length > 0 ? " ▾" : ""}
          </div>
        ))}
      </div>

      {visibleItems.map((item) => (
        <CategoryNavItem
          key={item.category.id}
          category={item.category}
          active={isActivePath(pathname, `/${item.category.slug}`)}
        />
      ))}

      {overflowItems.length > 0 && <MoreDropdown items={overflowItems} pathname={pathname} />}
    </nav>
  );
}

function CategoryNavItem({ category, active }: { category: CategoryListItem; active: boolean }) {
  const hasSubcategories = category.subcategories.length > 0;

  if (!hasSubcategories) {
    return (
      <Link
        href={`/${category.slug}`}
        className={cn(
          "relative whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted/70 hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {category.name}
        {active && (
          <motion.span
            layoutId="navbar-active-indicator"
            className="absolute inset-x-3.5 -bottom-[7px] h-[2px] rounded-full bg-primary"
            transition={{ type: "tween", duration: 0.2 }}
          />
        )}
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "group relative flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] font-medium text-muted-foreground outline-none transition-colors duration-200 hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
            active && "text-foreground",
          )}
        >
          {category.name}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          {active && (
            <motion.span
              layoutId="navbar-active-indicator"
              className="absolute inset-x-3.5 -bottom-[7px] h-[2px] rounded-full bg-primary"
              transition={{ type: "tween", duration: 0.2 }}
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={14}
        className={cn(
          "overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl shadow-black/[0.03]",
          category.subcategories.length > 4 ? "w-[440px]" : "w-72",
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="p-5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            {category.name}
          </p>
          <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
            Explore the latest {category.name.toLowerCase()} stories
          </p>

          <DropdownMenuSeparator className="my-4 bg-border/60" />

          <div
            className={cn(
              "grid gap-x-4 gap-y-0.5",
              category.subcategories.length > 4 ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {category.subcategories.map((sub) => (
              <DropdownMenuItem
                key={sub.id}
                asChild
                className="cursor-pointer rounded-lg px-2.5 py-2 text-[13.5px] transition-colors focus:bg-muted"
              >
                <Link href={`/${category.slug}/${sub.slug}`}>{sub.name}</Link>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="my-4 bg-border/60" />

          <DropdownMenuItem
            asChild
            className="group cursor-pointer rounded-lg px-2.5 py-2 text-[13.5px] font-semibold text-foreground focus:bg-muted"
          >
            <Link href={`/${category.slug}`} className="flex items-center gap-1.5">
              View all {category.name}
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MoreDropdown({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] font-medium text-muted-foreground outline-none transition-colors duration-200 hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          More
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={14}
        className="w-72 overflow-hidden rounded-2xl border-border/60 p-2 shadow-xl shadow-black/[0.03]"
      >
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          {items.map((item, idx) => (
            <div key={item.category.id}>
              <DropdownMenuItem
                asChild
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-2 text-[13.5px] font-semibold",
                  isActivePath(pathname, `/${item.category.slug}`) && "text-primary",
                )}
              >
                <Link href={`/${item.category.slug}`}>{item.category.name}</Link>
              </DropdownMenuItem>
              {item.category.subcategories.map((sub) => (
                <DropdownMenuItem
                  key={sub.id}
                  asChild
                  className="cursor-pointer rounded-lg py-2 pl-6 pr-2.5 text-[13px] text-muted-foreground"
                >
                  <Link href={`/${item.category.slug}/${sub.slug}`}>{sub.name}</Link>
                </DropdownMenuItem>
              ))}
              {idx < items.length - 1 && <DropdownMenuSeparator className="my-2 bg-border/60" />}
            </div>
          ))}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
