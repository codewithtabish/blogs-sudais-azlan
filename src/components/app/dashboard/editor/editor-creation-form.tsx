"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { CategoryListItem } from "@/app/actions/(category)/get-all-categories-action";
import { getAllCategoriesAction } from "@/app/actions/(category)/get-all-categories-action";

import { createEditorAction } from "@/app/actions/(editor)/create-editor-creation";
import { editorFormDefaultValues, EditorFormValues, editorSchema } from "@/schemas/editor-schema";
import { CategoryMultiSelect } from "./category-multiple-select";
import { EditorImageUpload } from "./editor-upload-image";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from "../../general/theme/social-icons";

type FieldErrors = Partial<Record<keyof EditorFormValues, string>>;

export default function CreateEditorForm() {
  const [isPending, startTransition] = useTransition();

  // Form state — same flat useState pattern as CreateBlogForm
  const [name, setName] = useState(editorFormDefaultValues.name);
  const [email, setEmail] = useState(editorFormDefaultValues.email);
  const [imageUrl, setImageUrl] = useState(editorFormDefaultValues.imageUrl);
  const [bio, setBio] = useState(editorFormDefaultValues.bio);
  const [experience, setExperience] = useState(editorFormDefaultValues.experience);
  const [location, setLocation] = useState(editorFormDefaultValues.location);
  const [website, setWebsite] = useState(editorFormDefaultValues.website);
  const [twitter, setTwitter] = useState(editorFormDefaultValues.twitter);
  const [linkedin, setLinkedin] = useState(editorFormDefaultValues.linkedin);
  const [facebook, setFacebook] = useState(editorFormDefaultValues.facebook);
  const [instagram, setInstagram] = useState(editorFormDefaultValues.instagram);
  const [github, setGithub] = useState(editorFormDefaultValues.github);
  const [isActive, setIsActive] = useState(editorFormDefaultValues.isActive);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);

  // Categories
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

  function resetForm() {
    setName(editorFormDefaultValues.name);
    setEmail(editorFormDefaultValues.email);
    setImageUrl(editorFormDefaultValues.imageUrl);
    setBio(editorFormDefaultValues.bio);
    setExperience(editorFormDefaultValues.experience);
    setLocation(editorFormDefaultValues.location);
    setWebsite(editorFormDefaultValues.website);
    setTwitter(editorFormDefaultValues.twitter);
    setLinkedin(editorFormDefaultValues.linkedin);
    setFacebook(editorFormDefaultValues.facebook);
    setInstagram(editorFormDefaultValues.instagram);
    setGithub(editorFormDefaultValues.github);
    setIsActive(editorFormDefaultValues.isActive);
    setCategoryIds([]);
    setFieldErrors({});
  }

  function handleSubmit() {
    setJustCreatedId(null);

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

    // Client-side validation for immediate feedback, mirroring
    // the checks in createEditorAction.
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
      const result = await createEditorAction(values);

      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      toast.success("Editor created — done!", {
        description: name.trim(),
      });
      setJustCreatedId(result.editorId);
      resetForm();
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 px-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Editor</h1>
          <p className="text-muted-foreground mt-1">
            Add a new editor and assign them to one or more categories
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Editor"
          )}
        </Button>
      </div>

      {justCreatedId && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Editor created successfully.</span>
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
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
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
            />
            {fieldErrors.website && (
              <p className="text-sm text-destructive">{fieldErrors.website}</p>
            )}
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-1.5">
                <XIcon className="h-3.5 w-3.5" /> Twitter / X
              </Label>
              <Input
                id="twitter"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/username"
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
            This editor will be assigned as the owner of every category selected here.
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
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating editor...
          </>
        ) : (
          "Create editor"
        )}
      </Button>
    </div>
  );
}
