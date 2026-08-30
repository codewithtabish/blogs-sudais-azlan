// src/components/editors/category-multi-select.tsx
"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useMemo, useState } from "react";

import { CategoryListItem } from "@/app/actions/(category)/get-all-categories-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CategoryMultiSelectProps {
  categories: CategoryListItem[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function CategoryMultiSelect({
  categories,
  value,
  onChange,
  disabled,
}: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCategories = useMemo(
    () => categories.filter((category) => value.includes(category.id)),
    [categories, value],
  );

  function toggleCategory(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((categoryId) => categoryId !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function removeCategory(id: string) {
    onChange(value.filter((categoryId) => categoryId !== id));
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className="text-muted-foreground">
              {value.length === 0
                ? "Select categories..."
                : `${value.length} categor${value.length === 1 ? "y" : "ies"} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => {
                  const isSelected = value.includes(category.id);

                  return (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => toggleCategory(category.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                      />
                      <span className="flex-1">{category.name}</span>
                      {!category.isActive && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCategories.map((category) => (
            <Badge key={category.id} variant="secondary" className="gap-1 pr-1 font-normal">
              {category.name}
              <button
                type="button"
                onClick={() => removeCategory(category.id)}
                disabled={disabled}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${category.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
