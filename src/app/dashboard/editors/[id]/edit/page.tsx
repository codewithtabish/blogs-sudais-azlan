import { notFound } from "next/navigation";

import { getEditorByIdAction } from "@/app/actions/(editor)/get-editor-by-id";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Suspense } from "react";
import { EditorTableSkeleton } from "@/components/app/dashboard/editor/editor-table-skeleton";
import UpdateEditorForm from "@/components/app/dashboard/editor/update-editor-form";

interface EditEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEditorPage({ params }: EditEditorPageProps) {
  const { id } = await params;

  const result = await getEditorByIdAction(id);

  if (!result.success) {
    notFound();
  }

  const { editor } = result;

  return (
    <div className="space-y-6 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/editors">Editors</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit {editor.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Suspense fallback={<EditorTableSkeleton />}>
        <UpdateEditorForm editor={editor} />
      </Suspense>
    </div>
  );
}
