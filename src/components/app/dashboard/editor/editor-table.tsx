// src/components/(app)/(dashbaord)/editor/editor-table.tsx
"use client";

import { Loader2, Pencil, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteEditorAction } from "@/app/actions/(editor)/editor-delete-action";
import { EditorListItem } from "@/app/actions/(editor)/get-all-editors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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

interface EditorTableProps {
  editors: EditorListItem[];
}

export function EditorTable({ editors }: EditorTableProps) {
  if (editors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <UserRound className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No editors yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first editor to start assigning categories.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Editor</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Categories</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[110px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editors.map((editor) => (
            <EditorRow key={editor.id} editor={editor} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EditorRow({ editor }: { editor: EditorListItem }) {
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEditorAction(editor.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Editor deleted", {
        description: editor.name,
      });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={editor.imageUrl ?? undefined} alt={editor.name} />
            <AvatarFallback>{editor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{editor.name}</p>
            {/* <p className="truncate text-xs text-muted-foreground">{editor.email}</p> */}
          </div>
        </div>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">{editor.location || "—"}</TableCell>

      <TableCell>
        <Badge variant="secondary">
          {editor.categoryCount} {editor.categoryCount === 1 ? "category" : "categories"}
        </Badge>
      </TableCell>

      <TableCell>
        <Badge variant={editor.isActive ? "default" : "outline"}>
          {editor.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>

      {/* Fixed: force consistent locale so server & client render the same string */}
      <TableCell className="text-sm text-muted-foreground">
        {new Date(editor.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/dashboard/editors/${editor.id}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit {editor.name}</span>
            </Link>
          </Button>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete {editor.name}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this editor?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{editor.name}</strong>. Any categories
                  currently assigned to them will be unassigned, not deleted. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
