import React from "react";

import { SecondContainer } from "../../general/layouts/second-container";
import {
  getHomeBlogsAction,
  type HomeBlogListItem,
} from "@/app/actions/(blog)/get-home-blogs-action";
import { StateMessage } from "./state-message";
import { HomeHero } from "./home-hero";
import { FeaturedStory } from "./featured-story";
import { LatestStories } from "./latest-stories";
import { CategoryShelf } from "./category-shelf";
import { TypeShelf } from "./type-shelf";
import TheDaily from "../../general/brand/the-daily";

type CategoryGroup = {
  category: { name: string; slug: string };
  blogs: HomeBlogListItem[];
};

function groupByCategory(blogs: HomeBlogListItem[]): CategoryGroup[] {
  const map = new Map<string, CategoryGroup>();

  for (const blog of blogs) {
    const key = blog.category.slug;
    const existing = map.get(key);

    if (existing) {
      existing.blogs.push(blog);
    } else {
      map.set(key, { category: blog.category, blogs: [blog] });
    }
  }

  // Only show category desks with enough articles to feel like a real shelf.
  return Array.from(map.values()).filter((group) => group.blogs.length >= 3);
}

function groupByType(
  blogs: HomeBlogListItem[],
  type: HomeBlogListItem["type"],
): HomeBlogListItem[] {
  return blogs.filter((blog) => blog.type === type);
}

const LandingPage = async () => {
  const result = await getHomeBlogsAction();

  if (!result.success) {
    return (
      <SecondContainer>
        <StateMessage
          title="Unable to load the latest stories."
          description="Something went wrong while loading INSIDER. Please try again shortly."
          showRetry
        />
      </SecondContainer>
    );
  }

  const { blogs } = result;

  if (blogs.length === 0) {
    return (
      <SecondContainer>
        <StateMessage
          title="Nothing published yet."
          description="Check back soon for the latest from INSIDER."
        />
      </SecondContainer>
    );
  }

  const featuredCandidates = blogs.filter((blog) => blog.featured);
  const featuredStory = featuredCandidates[0] ?? blogs[0];
  const remainingBlogs = blogs.filter((blog) => blog.id !== featuredStory.id);

  const categoryGroups = groupByCategory(blogs).slice(0, 3);

  const newsBlogs = groupByType(blogs, "NEWS");
  const analysisBlogs = groupByType(blogs, "ANALYSIS");
  const opinionBlogs = groupByType(blogs, "OPINION");

  return (
    <SecondContainer>
      <main className="flex w-full flex-col gap-20 py-12 sm:py-16 lg:py-20">
        <h1 className="sr-only">INSIDER — Technology, AI, Ideas & What&apos;s Next</h1>

        <HomeHero />

        <FeaturedStory blog={featuredStory} />

        <LatestStories blogs={remainingBlogs} />

        {categoryGroups.map(({ category, blogs: categoryBlogs }) => (
          <CategoryShelf key={category.slug} category={category} blogs={categoryBlogs} />
        ))}

        {newsBlogs.length >= 3 && <TypeShelf title="News" blogs={newsBlogs} />}
        {analysisBlogs.length >= 3 && <TypeShelf title="Analysis" blogs={analysisBlogs} />}
        {opinionBlogs.length >= 3 && <TypeShelf title="Opinion" blogs={opinionBlogs} />}
      </main>

      <TheDaily />
    </SecondContainer>
  );
};

export default LandingPage;
