"use client";

import {
  getAllCategoriesAction,
  type CategoryListItem,
} from "@/app/actions/(category)/get-all-categories-action";
import { checkIsAdminAction } from "@/app/actions/admin/check-is-admin-action";
import { useUser } from "@clerk/nextjs";
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

export function Navbar() {
  const { user } = useUser();

  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadNavbarData() {
      try {
        const [categoriesResult, adminResult] = await Promise.all([
          getAllCategoriesAction(),
          user ? checkIsAdminAction() : Promise.resolve(false),
        ]);

        if (!mounted) {
          return;
        }

        if (categoriesResult.success) {
          setCategories(toPublicCategories(categoriesResult.categories));
        } else {
          setCategories([]);
        }

        setIsAdmin(adminResult);
      } catch (error) {
        console.error("[Navbar] Failed to load navbar data:", error);

        if (mounted) {
          setCategories([]);
          setIsAdmin(false);
        }
      }
    }

    loadNavbarData();

    return () => {
      mounted = false;
    };
  }, [user]);

  return <NavbarClient categories={categories} isAdmin={isAdmin} />;
}
