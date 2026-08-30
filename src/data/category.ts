export type SubCategory = {
  name: string;
  slug: string;
};

export type Category = {
  name: string;
  slug: string;
  subcategories: SubCategory[];
};

export const categories: Category[] = [
  {
    name: "Latest",
    slug: "latest",
    subcategories: [
      { name: "Latest Stories", slug: "latest-stories" },
      { name: "Trending", slug: "trending" },
      { name: "Most Read", slug: "most-read" },
      { name: "Editor's Picks", slug: "editors-picks" },
      { name: "What's New", slug: "whats-new" },
    ],
  },

  {
    name: "Tech",
    slug: "tech",
    subcategories: [
      { name: "AI", slug: "ai" },
      { name: "Apps", slug: "apps" },
      { name: "Gadgets", slug: "gadgets" },
      { name: "Computing", slug: "computing" },
      { name: "Internet", slug: "internet" },
      { name: "Cybersecurity", slug: "cybersecurity" },
      { name: "Smart Home", slug: "smart-home" },
      { name: "Mobile", slug: "mobile" },
      { name: "Software", slug: "software" },
      { name: "Future Tech", slug: "future-tech" },
    ],
  },

  {
    name: "Best Picks",
    slug: "best-picks",
    subcategories: [
      { name: "Best Overall", slug: "best-overall" },
      { name: "Best Tech", slug: "best-tech" },
      { name: "Best Apps", slug: "best-apps" },
      { name: "Best Gadgets", slug: "best-gadgets" },
      { name: "Best for Home", slug: "best-for-home" },
      { name: "Best for Work", slug: "best-for-work" },
      { name: "Best Budget", slug: "best-budget" },
      { name: "Editor's Choice", slug: "editors-choice" },
    ],
  },

  {
    name: "Entertainment",
    slug: "entertainment",
    subcategories: [
      { name: "Movies", slug: "movies" },
      { name: "TV Shows", slug: "tv-shows" },
      { name: "Streaming", slug: "streaming" },
      { name: "Netflix", slug: "netflix" },
      { name: "Music", slug: "music" },
      { name: "Gaming", slug: "gaming" },
      { name: "Books", slug: "books" },
      { name: "Celebrity", slug: "celebrity" },
      { name: "Culture", slug: "culture" },
    ],
  },

  {
    name: "Health",
    slug: "health",
    subcategories: [
      { name: "Wellness", slug: "wellness" },
      { name: "Fitness", slug: "fitness" },
      { name: "Nutrition", slug: "nutrition" },
      { name: "Sleep", slug: "sleep" },
      { name: "Mental Wellbeing", slug: "mental-wellbeing" },
      { name: "Healthy Living", slug: "healthy-living" },
      { name: "Self Care", slug: "self-care" },
      { name: "Science & Health", slug: "science-health" },
    ],
  },

  {
    name: "Reviews",
    slug: "reviews",
    subcategories: [
      { name: "Tech Reviews", slug: "tech-reviews" },
      { name: "App Reviews", slug: "app-reviews" },
      { name: "Gadget Reviews", slug: "gadget-reviews" },
      { name: "Product Reviews", slug: "product-reviews" },
      { name: "Home Reviews", slug: "home-reviews" },
      { name: "Service Reviews", slug: "service-reviews" },
      { name: "Software Reviews", slug: "software-reviews" },
      { name: "In-Depth Reviews", slug: "in-depth-reviews" },
    ],
  },

  {
    name: "Home & Garden",
    slug: "home-garden",
    subcategories: [
      { name: "Home", slug: "home" },
      { name: "Cleaning", slug: "cleaning" },
      { name: "Kitchen", slug: "kitchen" },
      { name: "Decor", slug: "decor" },
      { name: "Organization", slug: "organization" },
      { name: "DIY", slug: "diy" },
      { name: "Garden", slug: "garden" },
      { name: "Smart Home", slug: "smart-home" },
      { name: "Outdoor Living", slug: "outdoor-living" },
    ],
  },

  {
    name: "Deals",
    slug: "deals",
    subcategories: [
      { name: "Today's Deals", slug: "todays-deals" },
      { name: "Tech Deals", slug: "tech-deals" },
      { name: "Gadget Deals", slug: "gadget-deals" },
      { name: "Home Deals", slug: "home-deals" },
      { name: "App & Software Deals", slug: "software-deals" },
      { name: "Amazon Deals", slug: "amazon-deals" },
      { name: "Best Under $50", slug: "best-under-50" },
      { name: "Best Under $100", slug: "best-under-100" },
    ],
  },

  {
    name: "Comparisons",
    slug: "comparisons",
    subcategories: [
      { name: "Tech Comparisons", slug: "tech-comparisons" },
      { name: "Phone Comparisons", slug: "phone-comparisons" },
      { name: "Laptop Comparisons", slug: "laptop-comparisons" },
      { name: "App Comparisons", slug: "app-comparisons" },
      { name: "Software Comparisons", slug: "software-comparisons" },
      { name: "Streaming Comparisons", slug: "streaming-comparisons" },
      { name: "Product Comparisons", slug: "product-comparisons" },
      { name: "Versus", slug: "versus" },
    ],
  },

  {
    name: "Hacks",
    slug: "hacks",
    subcategories: [
      { name: "Life Hacks", slug: "life-hacks" },
      { name: "Tech Hacks", slug: "tech-hacks" },
      { name: "Productivity Hacks", slug: "productivity-hacks" },
      { name: "Home Hacks", slug: "home-hacks" },
      { name: "Cleaning Hacks", slug: "cleaning-hacks" },
      { name: "Money Hacks", slug: "money-hacks" },
      { name: "Travel Hacks", slug: "travel-hacks" },
      { name: "Kitchen Hacks", slug: "kitchen-hacks" },
      { name: "Everyday Tricks", slug: "everyday-tricks" },
    ],
  },
];
