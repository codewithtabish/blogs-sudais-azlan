// src/app/(pages)/dashboard/editor/page.tsx
import { Plus } from "lucide-react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

import { getAllEditorsAction } from "@/app/actions/(editor)/get-all-editors";
import { Suspense } from "react";
import { EditorTableSkeleton } from "@/components/app/dashboard/editor/editor-table-skeleton";
import { EditorTable } from "@/components/app/dashboard/editor/editor-table";

const DashboardEditorPage = async () => {
  const result = await getAllEditorsAction();
  const editors = result.success ? result.editors : [];

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editor</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editors</h1>

        <Button asChild>
          <Link href="/dashboard/editors/create-editor">
            <Plus className="mr-2 h-4 w-4" />
            Create editor
          </Link>
        </Button>
      </div>

      {!result.success && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {result.error}
        </p>
      )}
      <Suspense fallback={<EditorTableSkeleton />}>
        <EditorTable editors={editors} />
      </Suspense>
    </div>
  );
};

export default DashboardEditorPage;
