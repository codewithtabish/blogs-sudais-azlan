import {
  getAllCategoriesAction,
  type CategoryListItem,
} from "@/app/actions/(category)/get-all-categories-action";
import { NavbarClient } from "./navbar-client";
import { getOrCreateArticleUser } from "@/app/actions/users/get-or-create-article-user-action";
// ADJUST: point this at your existing admin/role lookup.

function toPublicCategories(categories: CategoryListItem[]): CategoryListItem[] {
  return categories
    .filter((category) => category.isActive)
    .map((category) => ({
      ...category,
      subcategories: category.subcategories.filter((sub) => sub.isActive),
    }));
}

async function resolveIsAdmin(): Promise<boolean> {
  try {
    const user = await getOrCreateArticleUser();
    return user?.role === "ADMIN";
  } catch (err) {
    console.error("[Navbar] Failed to resolve current user role:", err);
    return false;
  }
}

export async function Navbar() {
  const [categoriesResult, isAdmin] = await Promise.all([
    getAllCategoriesAction(),
    resolveIsAdmin(),
  ]);

  const categories = categoriesResult.success
    ? toPublicCategories(categoriesResult.categories)
    : [];

  return <NavbarClient categories={categories} isAdmin={isAdmin} />;
}
