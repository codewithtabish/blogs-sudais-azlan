"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { LayoutDashboard, WashingMachineIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { CategoryListItem } from "@/app/actions/(category)/get-all-categories-action";

import { ModeToggle } from "../theme/mode-toggle";
import { Logo } from "../brand/logo";

import { NavbarDesktopNav } from "./navbar-desktop-nav";
import { NavbarMobileNav } from "./navbar-mobile-nav";

interface NavbarClientProps {
  categories: CategoryListItem[];
  isAdmin: boolean;
}

/**
 * INSIDER Navbar Client
 *
 * IMPORTANT:
 * - This component does NOT call getOrCreateArticleUser().
 * - This component does NOT query Prisma.
 * - This component does NOT create/sync local users.
 * - Authentication UI is handled by Clerk.
 * - Admin authorization is handled server-side.
 * - `isAdmin` is provided by the parent/server layer.
 */
export function NavbarClient({ categories, isAdmin }: NavbarClientProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[70px] lg:px-8">
        {/* =====================================================
            INSIDER LOGO
        ====================================================== */}

        <Logo variant="lockup" size="md" priority />

        {/* =====================================================
            DESKTOP NAVIGATION
            (ml-6/8 gives clear breathing room after the logo)
        ====================================================== */}

        <div className="hidden min-w-0 flex-1 lg:ml-8 lg:block xl:ml-10">
          <NavbarDesktopNav categories={categories} />
        </div>

        {/* =====================================================
            RIGHT SIDE ACTIONS
        ====================================================== */}

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* ---------------------------------------------------
              THEME TOGGLE
          ---------------------------------------------------- */}

          <div className="hidden lg:block">
            <ModeToggle />
          </div>

          <div aria-hidden="true" className="hidden h-6 w-px bg-border/70 lg:block" />

          {/* ---------------------------------------------------
              DESKTOP CLERK AUTH
          ---------------------------------------------------- */}

          <div className="hidden items-center lg:flex">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="h-9 rounded-full bg-foreground px-5 font-medium text-background shadow-none transition-transform duration-200 hover:scale-[1.03] hover:bg-foreground/90"
                >
                  Login
                </Button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              <UserButton
                afterSwitchSessionUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-border/60 ring-offset-2 ring-offset-background",
                  },
                }}
              >
                {isAdmin ? (
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Dashboard"
                      href="/dashboard"
                      labelIcon={<LayoutDashboard className="h-4 w-4" />}
                    />
                    <UserButton.Link
                      label="AGENT"
                      href="/agent"
                      labelIcon={<WashingMachineIcon className="h-4 w-4" />}
                    />
                  </UserButton.MenuItems>
                ) : null}
              </UserButton>
            </Show>
          </div>

          {/* ===================================================
              MOBILE NAVIGATION
          ==================================================== */}

          <NavbarMobileNav categories={categories} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
