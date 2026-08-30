"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { LayoutDashboard, MenuIcon, PenLine, UserRound } from "lucide-react";

import { Show, SignInButton, UserButton, useUser } from "@clerk/nextjs";

import Link from "next/link";
import { usePathname } from "next/navigation";

// import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

const navigationData = [
  {
    title: "Articles",
    href: "/articles",
  },
  {
    title: "Categories",
    href: "/categories",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

const ADMIN_EMAIL = "kashisultan099@gmail.com";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isAdmin =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const isActive = (href: string) => {
    if (href === "/articles") {
      return pathname === "/articles" || pathname.startsWith("/articles/");
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 shadow-2xl backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}
        <div className="flex flex-1 items-center justify-center gap-6 font-medium text-muted-foreground lg:gap-10">
          {/* Left Navigation */}

          <Link
            href="/articles"
            className={`hidden transition-colors hover:text-primary md:block ${
              isActive("/articles") ? "text-primary" : ""
            }`}
          >
            Articles
          </Link>

          <Link
            href="/categories"
            className={`hidden transition-colors hover:text-primary md:block ${
              isActive("/categories") ? "text-primary" : ""
            }`}
          >
            Categories
          </Link>

          {/* Logo */}

          <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-foreground">
            Sudais Azlan
          </Link>

          {/* Right Navigation */}

          <Link
            href="/about"
            className={`hidden transition-colors hover:text-primary md:block ${
              isActive("/about") ? "text-primary" : ""
            }`}
          >
            About
          </Link>

          <Link
            href="/contact"
            className={`hidden transition-colors hover:text-primary md:block ${
              isActive("/contact") ? "text-primary" : ""
            }`}
          >
            Contact
          </Link>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Authentication */}

          <div className="hidden items-center gap-2 sm:flex">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="rounded-full px-4">
                  Login
                </Button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              >
                {isAdmin && (
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Dashboard"
                      labelIcon={<LayoutDashboard className="size-4" />}
                      href="/dashboard"
                    />

                    <UserButton.Link
                      label="Write Article"
                      labelIcon={<PenLine className="size-4" />}
                      href="/dashboard/articles/new"
                    />
                  </UserButton.MenuItems>
                )}
              </UserButton>
            </Show>
          </div>

          {/* Theme Toggle */}

          {/* =================================================
              MOBILE MENU
          ================================================== */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="rounded-full">
                <MenuIcon className="h-4 w-4" />

                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuGroup>
                {/* Articles */}

                <DropdownMenuItem asChild>
                  <Link href="/articles" className="flex items-center gap-2">
                    <PenLine className="size-4" />
                    Articles
                  </Link>
                </DropdownMenuItem>

                {/* Categories */}

                <DropdownMenuItem asChild>
                  <Link href="/categories" className="flex items-center gap-2">
                    Categories
                  </Link>
                </DropdownMenuItem>

                {/* About */}

                <DropdownMenuItem asChild>
                  <Link href="/about" className="flex items-center gap-2">
                    About
                  </Link>
                </DropdownMenuItem>

                {/* Contact */}

                <DropdownMenuItem asChild>
                  <Link href="/contact" className="flex items-center gap-2">
                    Contact
                  </Link>
                </DropdownMenuItem>

                {/* Admin Dashboard */}

                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/articles/new" className="flex items-center gap-2">
                        <PenLine className="size-4" />
                        Write Article
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>

              {/* =================================================
                  MOBILE AUTH
              ================================================== */}

              <div className="mt-1 border-t border-border px-1 pt-1">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <Button variant="ghost" className="w-full justify-start">
                      <UserRound className="mr-2 size-4" />
                      Login
                    </Button>
                  </SignInButton>
                </Show>

                <Show when="signed-in">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8",
                        },
                      }}
                    />

                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user?.firstName || user?.username || "Account"}
                      </span>

                      <span className="text-xs text-muted-foreground">Signed in</span>
                    </div>
                  </div>
                </Show>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
