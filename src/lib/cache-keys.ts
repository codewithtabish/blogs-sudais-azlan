// Central place for cache tags used with `use cache` + `revalidateTag`.

export const CACHE_TAGS = {
  categories: "categories",
  users: "users",

  // Editors
  editors: "editors",
  // editor: (id: string) => `editor:${id}`,

  // Newsletter
  newsletterSubscribers: "newsletter:subscribers",

  // Home
  home: "home",
  homeScreen: "home:screen",

  // Category pages
  category: (slug: string) => `category:${slug}`,
  categoryPageBlogs: (slug: string) => `category:blogs:${slug}`,
  subcategoryPageBlogs: (slug: string) => `subcategory:blogs:${slug}`,

  // Individual blog
  blog: (slug: string) => `blog:${slug}`,

  // Comments
  comments: (blogId: string) => `comments:${blogId}`,

  // Dashboard
  dashboardBlogs: "dashboard:blogs",
} as const;
