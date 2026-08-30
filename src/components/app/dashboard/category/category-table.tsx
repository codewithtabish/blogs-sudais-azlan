// src/app/(pages)/dashboard/category/_components/category-table.tsx
"use client";

import { ChevronDown, ChevronRight, Loader2, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { deleteCategoryAction } from "@/app/actions/(category)/delete-category-action";
import { deleteSubcategoryAction } from "@/app/actions/(category)/delete-subcategory-action";
import type {
  CategoryListItem,
  SubcategoryListItem,
} from "@/app/actions/(category)/get-all-categories-action";

type CategoryTableProps = {
  categories: CategoryListItem[];
};

type DeleteTarget =
  | { type: "category"; id: string; name: string }
  | { type: "subcategory"; id: string; name: string };

export function CategoryTable({ categories }: CategoryTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(categoryId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setPendingId(target.id);

    startTransition(async () => {
      try {
        const result =
          target.type === "category"
            ? await deleteCategoryAction(target.id)
            : await deleteSubcategoryAction(target.id);

        if (!result.success) {
          toast.error(
            target.type === "category" ? "Couldn't delete category" : "Couldn't delete subcategory",
            { description: result.error },
          );
          return;
        }

        toast.success(target.type === "category" ? "Category deleted" : "Subcategory deleted", {
          description: `"${target.name}" was removed.`,
        });
        router.refresh();
      } catch (err) {
        toast.error("Couldn't delete", {
          description: err instanceof Error ? err.message : "Unexpected error. Please try again.",
        });
      } finally {
        setPendingId(null);
        setDeleteTarget(null);
      }
    });
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">No categories yet</p>
        <p className="text-sm text-muted-foreground">Create your first category to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[36px]" />
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Editor</TableHead>
              <TableHead className="text-center">Subcategories</TableHead>
              <TableHead className="text-center">Sort order</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
              const isExpanded = expandedIds.has(category.id);
              const hasSubcategories = category.subcategories.length > 0;

              return (
                <React.Fragment key={category.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground disabled:opacity-30"
                        disabled={!hasSubcategories}
                        onClick={() => toggleExpanded(category.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle subcategories</span>
                      </Button>
                    </TableCell>

                    <TableCell className="font-medium">{category.name}</TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {category.slug}
                    </TableCell>

                    {/* Editor column */}
                    <TableCell>
                      {category.editor ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage
                              src={category.editor.imageUrl ?? undefined}
                              alt={category.editor.name}
                            />
                            <AvatarFallback className="text-[10px]">
                              {category.editor.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium leading-none">
                              {category.editor.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground mt-0.5">
                              {category.editor.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <UserRound className="h-3.5 w-3.5" />
                          <span className="text-sm">Unassigned</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-center text-sm text-muted-foreground">
                      {category.subcategories.length}
                    </TableCell>

                    <TableCell className="text-center text-sm text-muted-foreground">
                      {category.sortOrder}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                        className={
                          category.isActive
                            ? "bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground hover:bg-muted"
                        }
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        disabled={isPending && pendingId === category.id}
                        onClick={() =>
                          setDeleteTarget({
                            type: "category",
                            id: category.id,
                            name: category.name,
                          })
                        }
                      >
                        {isPending && pendingId === category.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete {category.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>

                  {isExpanded && hasSubcategories && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell />
                      <TableCell colSpan={7} className="bg-muted/20 py-3">
                        <ul className="flex flex-col divide-y divide-border/70 pl-1">
                          {category.subcategories.map((subcategory: SubcategoryListItem) => (
                            <li
                              key={subcategory.id}
                              className="flex items-center justify-between gap-3 py-2"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                                <span className="truncate text-sm text-foreground">
                                  {subcategory.name}
                                </span>
                                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                                  {subcategory.slug}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={
                                    subcategory.isActive
                                      ? "bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-400"
                                      : "bg-muted text-muted-foreground hover:bg-muted"
                                  }
                                >
                                  {subcategory.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                disabled={isPending && pendingId === subcategory.id}
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "subcategory",
                                    id: subcategory.id,
                                    name: subcategory.name,
                                  })
                                }
                              >
                                {isPending && pendingId === subcategory.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                <span className="sr-only">Delete {subcategory.name}</span>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === "category" ? "Delete category?" : "Delete subcategory?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                &ldquo;{deleteTarget?.name}&rdquo;
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
