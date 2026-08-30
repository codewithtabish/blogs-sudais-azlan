// src/app/(pages)/dashboard/items/create-category/_components/create-category-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { createCategoryAction } from "@/app/actions/(category)/create-category-action";
import { generateSlug } from "@/lib/slug";
import { CategoryFormValues, categorySchema } from "@/schemas/category-schema";

// Shared classes so every input/textarea shows a clearly visible
// error state in both light and dark mode (border + ring + text tint).
const invalidFieldClasses =
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:text-destructive";

export function CreateCategoryForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  // Auto-generate slug as the user types the name,
  // unless they've manually edited the slug themselves.
  function handleNameChange(value: string) {
    form.setValue("name", value);
    if (!slugTouched) {
      form.setValue("slug", generateSlug(value), { shouldValidate: true });
    }
  }

  // Manual regenerate — click the icon inside the slug field
  // to re-derive it from the current name at any time.
  function handleRegenerateSlug() {
    const name = form.getValues("name");
    form.setValue("slug", generateSlug(name), { shouldValidate: true });
    setSlugTouched(false);
  }

  function onSubmit(values: CategoryFormValues) {
    startTransition(async () => {
      try {
        const result = await createCategoryAction(values);

        if (!result.success) {
          toast.error("Couldn't create category", {
            description: result.error || "Something went wrong. Please try again.",
          });
          return;
        }

        toast.success("Category created", {
          description: `"${values.name}" was added successfully.`,
        });
        form.reset();
        setSlugTouched(false);
        router.refresh();
      } catch (err) {
        toast.error("Couldn't create category", {
          description: err instanceof Error ? err.message : "Unexpected error. Please try again.",
        });
      }
    });
  }

  return (
    <Card className="w-full max-w-4xl border-border bg-card">
      <CardHeader>
        <CardTitle>Create category</CardTitle>
        <CardDescription>
          Add a new top-level category. Subcategories can be attached to it afterward.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Name */}
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    placeholder="e.g. Men's Fashion"
                    aria-invalid={fieldState.invalid}
                    className={invalidFieldClasses}
                    {...field}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                  <FieldDescription>The display name shown to customers.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Slug */}
            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      placeholder="mens-fashion"
                      aria-invalid={fieldState.invalid}
                      className={`pr-10 ${invalidFieldClasses}`}
                      {...field}
                      onChange={(e) => {
                        setSlugTouched(true);
                        field.onChange(e);
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateSlug}
                      title="Regenerate slug from name"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <FieldDescription>
                    Used in the URL. Click the icon to regenerate from the name.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Description */}
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    placeholder="Short description shown on the category page…"
                    className={`resize-none ${invalidFieldClasses}`}
                    rows={4}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Sort order */}
            <Controller
              control={form.control}
              name="sortOrder"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Sort order</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    min={0}
                    aria-invalid={fieldState.invalid}
                    className={invalidFieldClasses}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                  <FieldDescription>Lower numbers appear first.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Active toggle */}
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Field orientation="horizontal" className="rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor={field.name}>Active</FieldLabel>
                    <FieldDescription>
                      Inactive categories are hidden from customers.
                    </FieldDescription>
                  </div>
                  <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSlugTouched(false);
                }}
                disabled={isPending}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create category"
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
