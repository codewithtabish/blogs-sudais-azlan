"use client";

import { useRouter } from "next/navigation";

import { CategoryPageSubcategory } from "@/app/actions/(category)/get-top-category-blogs-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategorySubcategorySelectProps = {
  categorySlug: string;
  subcategories: CategoryPageSubcategory[];
  triggerClassName?: string;
};

export function CategorySubcategorySelect({
  categorySlug,
  subcategories,
  triggerClassName,
}: CategorySubcategorySelectProps) {
  const router = useRouter();

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <Select onValueChange={(value) => router.push(`/${categorySlug}/${value}`)}>
      <SelectTrigger className={triggerClassName ?? "w-full bg-background text-foreground"}>
        <SelectValue placeholder="Categories" />
      </SelectTrigger>
      <SelectContent>
        {subcategories.map((subcategory) => (
          <SelectItem key={subcategory.id} value={subcategory.slug}>
            {subcategory.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
