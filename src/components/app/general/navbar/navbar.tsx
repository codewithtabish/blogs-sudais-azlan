"use client";

import {
  getAllCategoriesAction,
  type CategoryListItem,
} from "@/app/actions/(category)/get-all-categories-action";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavbarClient } from "./navbar-client";

function toPublicCategories(categories: CategoryListItem[]): CategoryListItem[] {
  return categories
    .filter((category) => category.isActive)
    .map((category) => ({
      ...category,
      subcategories: category.subcategories.filter((subcategory) => subcategory.isActive),
    }));
}

function isAgentRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/agent" || pathname.startsWith("/agent/");
}

export function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();

  const [categories, setCategories] = useState<CategoryListItem[]>([]);

  const hideNavbar = isAgentRoute(pathname);

  useEffect(() => {
    if (hideNavbar) {
      return;
    }

    let mounted = true;

    async function loadNavbarData() {
      try {
        const categoriesResult = await getAllCategoriesAction();

        if (!mounted) {
          return;
        }

        if (categoriesResult.success) {
          setCategories(toPublicCategories(categoriesResult.categories));
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("[Navbar] Failed to load navbar data:", error);

        if (mounted) {
          setCategories([]);
        }
      }
    }

    loadNavbarData();

    return () => {
      mounted = false;
    };
  }, [user, hideNavbar]);

  if (hideNavbar) {
    return null;
  }

  return <NavbarClient categories={categories} isAuthenticated={Boolean(user)} />;
}
