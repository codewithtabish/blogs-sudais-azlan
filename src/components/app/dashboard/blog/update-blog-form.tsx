"use client";

import { Eye, ImageIcon, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getAllCategoriesAction } from "@/app/actions/(category)/get-all-categories-action";
import { uploadBannerAction } from "@/app/actions/(images)/upload-banner-action";
import { uploadOgAction } from "@/app/actions/(images)/upload-og-action";

import { getBlogForEditAction } from "@/app/actions/(blog)/(dashboard)/get-blog-edit-action";
import { updateBlogAction } from "@/app/actions/(blog)/(dashboard)/update-blog-action";
import type { CategoryListItem } from "@/app/actions/(category)/get-all-categories-action";
import { TableOfContentsItem } from "@/schemas/blog-schema";
import { BlogPreviewer } from "./blog-previewr";
import BlogEditor from "./create-blog-editor";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface UpdateBlogFormProps {
  blogId: string;
}

export default function UpdateBlogForm({ blogId }: UpdateBlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Loading the existing blog
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [content, setContent] = useState<any>({ blocks: [] });
  const [bannerImage, setBannerImage] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [ogPreview, setOgPreview] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [type, setType] = useState("ARTICLE");
  const [status, setStatus] = useState("DRAFT");
  const [featured, setFeatured] = useState(false);
  const [toc, setToc] = useState<TableOfContentsItem[]>([]);

  // Categories
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Upload loading
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  const bannerFormRef = useRef<HTMLFormElement>(null);
  const ogFormRef = useRef<HTMLFormElement>(null);

  // Load categories
  useEffect(() => {
    async function load() {
      setLoadingCategories(true);
      const res = await getAllCategoriesAction();
      if (res.success) {
        setCategories(res.categories.filter((c) => c.isActive));
      } else {
        toast.error(res.error || "Failed to load categories");
      }
      setLoadingCategories(false);
    }
    load();
  }, []);

  // Load the existing blog and prefill the form
  useEffect(() => {
    async function load() {
      setLoadingBlog(true);
      const res = await getBlogForEditAction(blogId);

      if (!res.success) {
        setLoadError(res.error);
        toast.error(res.error || "Failed to load blog");
        setLoadingBlog(false);
        return;
      }

      const blog = res.blog;

      setTitle(blog.title);
      setSlug(blog.slug);
      setSlugManuallyEdited(true); // don't auto-regenerate the slug on load
      setContent(blog.content ?? { blocks: [] });
      setBannerImage(blog.bannerImage);
      setBannerPreview(blog.bannerImage);
      setOgImage(blog.seo?.ogImage ?? "");
      setOgPreview(blog.seo?.ogImage ?? "");
      setCategoryId(blog.categoryId);
      setSubcategoryId(blog.subcategoryId);
      setType(blog.type);
      setStatus(blog.status);
      setFeatured(blog.featured);
      setToc((blog.tableOfContents as TableOfContentsItem[] | null) ?? []);

      setLoadingBlog(false);
    }
    load();
  }, [blogId]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId],
  );

  const availableSubcategories = useMemo(
    () => (selectedCategory?.subcategories || []).filter((s) => s.isActive),
    [selectedCategory],
  );

  // ===================== HANDLERS =====================

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubcategoryId("");
  };

  // Banner upload
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bannerFormRef.current) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP or GIF images are allowed");
      bannerFormRef.current.reset();
      return;
    }

    if (file.size === 0) {
      toast.error("That file looks empty — try selecting it again");
      bannerFormRef.current.reset();
      return;
    }

    setUploadingBanner(true);
    setBannerPreview(URL.createObjectURL(file));

    const formData = new FormData(bannerFormRef.current);

    try {
      const res = await uploadBannerAction(formData);
      if (res.success && res.data) {
        setBannerImage(res.data.url);
        setBannerPreview(res.data.url);
        toast.success("Banner uploaded successfully");
      } else {
        toast.error("Failed to upload banner");
        setBannerPreview(bannerImage);
      }
    } catch (err) {
      console.error(err);
      toast.error("Banner upload failed");
      setBannerPreview(bannerImage);
    } finally {
      setUploadingBanner(false);
      bannerFormRef.current.reset();
    }
  };

  // OG upload
  const handleOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ogFormRef.current) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP or GIF images are allowed");
      ogFormRef.current.reset();
      return;
    }

    if (file.size === 0) {
      toast.error("That file looks empty — try selecting it again");
      ogFormRef.current.reset();
      return;
    }

    setUploadingOg(true);
    setOgPreview(URL.createObjectURL(file));

    const formData = new FormData(ogFormRef.current);

    try {
      const res = await uploadOgAction(formData);
      if (res.success && res.data) {
        setOgImage(res.data.url);
        setOgPreview(res.data.url);
        toast.success("OG image uploaded successfully");
      } else {
        toast.error("Failed to upload OG image");
        setOgPreview(ogImage);
      }
    } catch (err) {
      console.error(err);
      toast.error("OG image upload failed");
      setOgPreview(ogImage);
    } finally {
      setUploadingOg(false);
      ogFormRef.current.reset();
    }
  };

  const removeBanner = () => {
    setBannerImage("");
    setBannerPreview("");
    toast.info("Banner removed");
  };

  const removeOg = () => {
    setOgImage("");
    setOgPreview("");
    toast.info("OG image removed");
  };

  // TOC helpers
  const addTocItem = () => {
    setToc((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        slug: "",
        level: 2,
      },
    ]);
  };

  const updateTocItem = (id: string, field: keyof TableOfContentsItem, value: string | number) => {
    setToc((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "title" && typeof value === "string") {
          updated.slug = slugify(value);
        }
        return updated;
      }),
    );
  };

  const removeTocItem = (id: string) => {
    setToc((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit
  const handleSubmit = () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!slug.trim()) return toast.error("Slug is required");
    if (!bannerImage) return toast.error("Banner image is required");
    if (!ogImage) return toast.error("OG image is required");
    if (!categoryId || !subcategoryId) return toast.error("Please select category and subcategory");
    if (!content?.blocks?.length) return toast.error("Content cannot be empty");

    startTransition(async () => {
      const result = await updateBlogAction({
        id: blogId,
        title: title.trim(),
        slug: slug.trim(),
        content,
        bannerImage,
        bannerImageAlt: title.trim(),
        ogImage,
        categoryId,
        subcategoryId,
        type,
        status,
        featured,
        tableOfContents: toc.filter((t) => t.title.trim()),
      });

      if (result.success) {
        toast.success("Blog updated successfully!", {
          description: `Slug: ${result.data.blog.slug}`,
        });
        router.push("/dashboard/blogs");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update blog");
      }
    });
  };

  // ===================== LOADING / ERROR STATES =====================
  if (loadingBlog) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/blogs")}>
          Back to blogs
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Update Blog</h1>
          <p className="text-muted-foreground mt-1">Edit, preview and save changes</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* ================= WRITE TAB ================= */}
        <TabsContent value="write" className="space-y-6 mt-6">
          {/* Title + slug */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter blog title..."
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="auto-generated-from-title"
                />
                <p className="text-xs text-muted-foreground">URL: /blogs/{slug || "your-slug"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Banner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Banner Image *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bannerPreview ? (
                  <div className="relative group">
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <Image
                        src={bannerPreview}
                        alt="Banner preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="mt-2 text-xs text-muted-foreground break-all">{bannerImage}</p>
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center bg-muted/40 gap-3">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No banner uploaded</p>
                  </div>
                )}

                <form ref={bannerFormRef} onSubmit={(e) => e.preventDefault()}>
                  <Label htmlFor="banner" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md border bg-background hover:bg-muted transition-colors text-sm font-medium">
                      {uploadingBanner ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          {bannerPreview ? "Change Banner" : "Upload Banner"}
                        </>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="banner"
                    name="file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                  />
                </form>
              </CardContent>
            </Card>

            {/* OG Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  OG / Twitter Image *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ogPreview ? (
                  <div className="relative group">
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <Image
                        src={ogPreview}
                        alt="OG preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeOg}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="mt-2 text-xs text-muted-foreground break-all">{ogImage}</p>
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center bg-muted/40 gap-3">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No OG image uploaded</p>
                  </div>
                )}

                <form ref={ogFormRef} onSubmit={(e) => e.preventDefault()}>
                  <Label htmlFor="og" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md border bg-background hover:bg-muted transition-colors text-sm font-medium">
                      {uploadingOg ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          {ogPreview ? "Change OG Image" : "Upload OG Image"}
                        </>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="og"
                    name="file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleOgUpload}
                    disabled={uploadingOg}
                  />
                </form>
                <p className="text-xs text-muted-foreground">
                  This image is also used as Twitter image.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={categoryId}
                  onValueChange={handleCategoryChange}
                  disabled={loadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subcategory *</Label>
                <Select
                  value={subcategoryId}
                  onValueChange={setSubcategoryId}
                  disabled={!categoryId || availableSubcategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["ARTICLE", "NEWS", "OPINION", "ANALYSIS", "GUIDE", "REVIEW", "INTERVIEW"].map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0) + t.slice(1).toLowerCase()}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-3 pt-8">
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </CardContent>
          </Card>

          {/* Table of Contents (editor only) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Table of Contents</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addTocItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {toc.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Optional. Add headings that will appear in the TOC dropdown.
                </p>
              )}
              {toc.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-3 items-start p-3 rounded-lg border bg-muted/30"
                >
                  <span className="text-sm text-muted-foreground pt-2 w-6">{index + 1}.</span>
                  <div className="flex-1 grid sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Heading title"
                      value={item.title}
                      onChange={(e) => updateTocItem(item.id, "title", e.target.value)}
                    />
                    <Input
                      placeholder="slug"
                      value={item.slug}
                      onChange={(e) => updateTocItem(item.id, "slug", slugify(e.target.value))}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeTocItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content *</CardTitle>
            </CardHeader>
            <CardContent>
              <BlogEditor value={content} onChange={setContent} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= PREVIEW TAB ================= */}
        <TabsContent value="preview" className="mt-6">
          <div className="min-w-0">
            {bannerPreview && (
              <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden mb-8 border">
                <Image
                  src={bannerPreview}
                  alt={title || "Banner"}
                  fill
                  unoptimized
                  priority
                  className="object-cover"
                />
              </div>
            )}

            <h1 className="text-4xl font-bold tracking-tight mb-6">{title || "Untitled Blog"}</h1>

            {/* Dropdown TOC lives inside BlogPreviewer */}
            <BlogPreviewer content={content} tableOfContents={toc} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
