"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import type { CategoryListItem } from "@/app/actions/(category)/get-all-categories-action";
import { getAllCategoriesAction } from "@/app/actions/(category)/get-all-categories-action";
import { updateEditorAction } from "@/app/actions/(editor)/update-editor-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EditorFormValues, editorSchema } from "@/schemas/editor-schema";

import { EditorDetail } from "@/app/actions/(editor)/get-editor-by-id";

import { CategoryMultiSelect } from "./category-multiple-select";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from "../../general/theme/social-icons";
import { EditorImageUpload } from "./editor-upload-image";

type FieldErrors = Partial<Record<keyof EditorFormValues, string>>;

interface UpdateEditorFormProps {
  editor: EditorDetail;
}

export default function UpdateEditorForm({ editor }: UpdateEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(editor.name);
  const [email, setEmail] = useState(editor.email);
  const [imageUrl, setImageUrl] = useState(editor.imageUrl ?? "");
  const [bio, setBio] = useState(editor.bio ?? "");
  const [experience, setExperience] = useState(editor.experience ?? "");
  const [location, setLocation] = useState(editor.location ?? "");
  const [website, setWebsite] = useState(editor.website ?? "");
  const [twitter, setTwitter] = useState(editor.twitter ?? "");
  const [linkedin, setLinkedin] = useState(editor.linkedin ?? "");
  const [facebook, setFacebook] = useState(editor.facebook ?? "");
  const [instagram, setInstagram] = useState(editor.instagram ?? "");
  const [github, setGithub] = useState(editor.github ?? "");
  const [isActive, setIsActive] = useState(editor.isActive);
  const [categoryIds, setCategoryIds] = useState<string[]>(editor.categoryIds);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [justUpdated, setJustUpdated] = useState(false);

  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    async function load() {
      setLoadingCategories(true);
      const res = await getAllCategoriesAction();
      if (res.success) {
        setCategories(res.categories);
      } else {
        toast.error(res.error || "Failed to load categories");
      }
      setLoadingCategories(false);
    }
    load();
  }, []);

  function handleSubmit() {
    setJustUpdated(false);

    const values: EditorFormValues = {
      name: name.trim(),
      email: email.trim(),
      imageUrl: imageUrl || "",
      bio: bio || "",
      experience: experience || "",
      location: location || "",
      website: website || "",
      twitter: twitter || "",
      linkedin: linkedin || "",
      facebook: facebook || "",
      instagram: instagram || "",
      github: github || "",
      isActive,
      categoryIds,
    };

    const parsed = editorSchema.safeParse(values);

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof EditorFormValues | undefined;
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      const result = await updateEditorAction(editor.id, values);

      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      toast.success("Editor updated — done!", {
        description: name.trim(),
      });
      setJustUpdated(true);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Editor</h1>
          <p className="mt-1 text-muted-foreground">
            Update profile, links, and category assignments for{" "}
            <span className="font-medium text-foreground">{editor.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/editors")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>

      {justUpdated && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Editor updated successfully.</span>
        </div>
      )}

      {/* Profile image */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Image</CardTitle>
        </CardHeader>
        <CardContent>
          <EditorImageUpload value={imageUrl} onChange={setImageUrl} disabled={isPending} />
          {fieldErrors.imageUrl && (
            <p className="mt-2 text-sm text-destructive">{fieldErrors.imageUrl}</p>
          )}
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                disabled={isPending}
              />
              {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                disabled={isPending}
              />
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="New York, USA"
              disabled={isPending}
            />
            {fieldErrors.location && (
              <p className="text-sm text-destructive">{fieldErrors.location}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio about this editor..."
              className="min-h-20 resize-y"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">Max 500 characters.</p>
            {fieldErrors.bio && <p className="text-sm text-destructive">{fieldErrors.bio}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Professional background and experience..."
              className="min-h-24 resize-y"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">Max 1000 characters.</p>
            {fieldErrors.experience && (
              <p className="text-sm text-destructive">{fieldErrors.experience}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              disabled={isPending}
            />
            {fieldErrors.website && (
              <p className="text-sm text-destructive">{fieldErrors.website}</p>
            )}
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-1.5">
                <XIcon className="h-3.5 w-3.5" /> Twitter / X
              </Label>
              <Input
                id="twitter"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/username"
                disabled={isPending}
              />
              {fieldErrors.twitter && (
                <p className="text-sm text-destructive">{fieldErrors.twitter}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-1.5">
                <LinkedinIcon className="h-3.5 w-3.5" /> LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                disabled={isPending}
              />
              {fieldErrors.linkedin && (
                <p className="text-sm text-destructive">{fieldErrors.linkedin}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center gap-1.5">
                <FacebookIcon className="h-3.5 w-3.5" /> Facebook
              </Label>
              <Input
                id="facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/username"
                disabled={isPending}
              />
              {fieldErrors.facebook && (
                <p className="text-sm text-destructive">{fieldErrors.facebook}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-1.5">
                <InstagramIcon className="h-3.5 w-3.5" /> Instagram
              </Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/username"
                disabled={isPending}
              />
              {fieldErrors.instagram && (
                <p className="text-sm text-destructive">{fieldErrors.instagram}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="github" className="flex items-center gap-1.5">
                <GithubIcon className="h-3.5 w-3.5" /> GitHub
              </Label>
              <Input
                id="github"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
                disabled={isPending}
              />
              {fieldErrors.github && (
                <p className="text-sm text-destructive">{fieldErrors.github}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <CategoryMultiSelect
            categories={categories}
            value={categoryIds}
            onChange={setCategoryIds}
            disabled={isPending || loadingCategories}
          />
          <p className="text-xs text-muted-foreground">
            This editor will be assigned as the owner of every category selected here. Previous
            assignments will be cleared.
          </p>
          {fieldErrors.categoryIds && (
            <p className="text-sm text-destructive">{fieldErrors.categoryIds}</p>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div className="space-y-0.5">
            <Label htmlFor="isActive">Active</Label>
            <p className="text-sm text-muted-foreground">
              Inactive editors are hidden from public editor listings.
            </p>
          </div>
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving changes...
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </div>
  );
}
