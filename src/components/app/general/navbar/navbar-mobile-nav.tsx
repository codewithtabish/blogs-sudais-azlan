"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../theme/mode-toggle";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import type { CategoryListItem } from "@/app/actions/(category)/get-all-categories-action";

interface NavbarMobileNavProps {
  categories: CategoryListItem[];
  isAdmin: boolean;
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavbarMobileNav({ categories, isAdmin }: NavbarMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/60 px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-black tracking-[-0.03em]">
            <span className="h-2 w-2 rounded-full bg-primary" />
            INSIDER
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="flex flex-col gap-0.5" aria-label="Mobile primary">
            {categories.map((category) => (
              <MobileCategoryItem
                key={category.id}
                category={category}
                active={isActivePath(pathname, `/${category.slug}`)}
                onNavigate={close}
              />
            ))}

            {isAdmin && (
              <>
                <Separator className="my-4 bg-border/60" />
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Admin
                </p>
                <MobileLink
                  label="Dashboard"
                  href="/dashboard"
                  active={isActivePath(pathname, "/dashboard")}
                  onNavigate={close}
                />
                <MobileLink
                  label="Write Article"
                  href="/dashboard/write"
                  active={isActivePath(pathname, "/dashboard/write")}
                  onNavigate={close}
                />
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-5 py-4">
          <ModeToggle />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button
                size="sm"
                className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
              >
                Login
              </Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton afterSwitchSessionUrl="/" />
          </Show>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileLink({
  label,
  href,
  active,
  onNavigate,
}: {
  label: string;
  href: string;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "rounded-xl px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground",
        active && "bg-muted text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function MobileCategoryItem({
  category,
  active,
  onNavigate,
}: {
  category: CategoryListItem;
  active: boolean;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSubcategories = category.subcategories.length > 0;

  if (!hasSubcategories) {
    return (
      <MobileLink
        label={category.name}
        href={`/${category.slug}`}
        active={active}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground",
          active && "text-foreground",
          expanded && "bg-muted/60",
        )}
      >
        {category.name}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground/70 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-3 flex flex-col gap-0.5 border-l border-border/60 py-1.5 pl-3">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${category.slug}/${sub.slug}`}
                  onClick={onNavigate}
                  className="rounded-lg px-2.5 py-2 text-[14px] text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                >
                  {sub.name}
                </Link>
              ))}
              <Link
                href={`/${category.slug}`}
                onClick={onNavigate}
                className="mt-1 rounded-lg px-2.5 py-2 text-[14px] font-semibold text-primary"
              >
                View all {category.name} →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
