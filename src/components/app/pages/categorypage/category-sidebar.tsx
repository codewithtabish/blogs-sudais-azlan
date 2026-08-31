"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Globe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { CategoryPageData } from "@/app/actions/(category)/get-top-category-blogs-action";

import { CategorySubcategorySelect } from "./category-subcategory-select";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from "../../general/theme/social-icons";

type CategorySidebarProps = {
  category: CategoryPageData;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type SocialLink = {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

function getSocialLinks(editor: CategoryPageData["editor"]): SocialLink[] {
  const links: SocialLink[] = [];

  if (editor.twitter) {
    links.push({
      name: "X (Twitter)",
      url: editor.twitter.startsWith("http")
        ? editor.twitter
        : `https://x.com/${editor.twitter.replace("@", "")}`,
      icon: XIcon,
    });
  }
  if (editor.linkedin) {
    links.push({
      name: "LinkedIn",
      url: editor.linkedin.startsWith("http")
        ? editor.linkedin
        : `https://linkedin.com/in/${editor.linkedin}`,
      icon: LinkedinIcon,
    });
  }
  if (editor.github) {
    links.push({
      name: "GitHub",
      url: editor.github.startsWith("http") ? editor.github : `https://github.com/${editor.github}`,
      icon: GithubIcon,
    });
  }
  if (editor.instagram) {
    links.push({
      name: "Instagram",
      url: editor.instagram.startsWith("http")
        ? editor.instagram
        : `https://instagram.com/${editor.instagram.replace("@", "")}`,
      icon: InstagramIcon,
    });
  }
  if (editor.facebook) {
    links.push({
      name: "Facebook",
      url: editor.facebook.startsWith("http")
        ? editor.facebook
        : `https://facebook.com/${editor.facebook}`,
      icon: FacebookIcon,
    });
  }
  if (editor.website) {
    links.push({
      name: "Website",
      url: editor.website.startsWith("http") ? editor.website : `https://${editor.website}`,
      icon: Globe,
    });
  }

  return links;
}

export function CategorySidebar({ category }: CategorySidebarProps) {
  const { editor } = category;
  const socialLinks = getSocialLinks(editor);

  const [showFullBio, setShowFullBio] = useState(false);
  const [showFullExperience, setShowFullExperience] = useState(false);

  // Lower threshold so the button appears more reliably
  const shouldShowBioToggle = (editor.bio?.length ?? 0) > 120;
  const shouldShowExperienceToggle = (editor.experience?.length ?? 0) > 100;

  return (
    <Card className="h-fit overflow-hidden border-border bg-card">
      <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
        {/* Category badge */}
        <Badge
          variant="outline"
          className="rounded-full border-primary/60 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-primary"
        >
          {category.name}
        </Badge>

        {/* Square portrait */}
        <div className="relative size-40 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
          {editor.imageUrl ? (
            <Image src={editor.imageUrl} alt={editor.name} fill className="object-cover" priority />
          ) : (
            <div className="flex size-full items-center justify-center text-3xl font-semibold text-muted-foreground">
              {getInitials(editor.name)}
            </div>
          )}
        </div>

        {/* Name + single title only */}
        <div className="space-y-1">
          <p className="text-xl font-bold tracking-tight text-foreground">{editor.name}</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {editor.bio}
          </p>
        </div>

        {/* Experience – 3 lines + Show more / Show less (justified) */}
        {editor.experience && (
          <div className="w-full space-y-1.5">
            <p
              className={`text-xs leading-relaxed text-muted-foreground/80 text-justify ${
                showFullExperience ? "" : "line-clamp-3"
              }`}
            >
              {editor.experience}
            </p>

            {shouldShowExperienceToggle && (
              <button
                type="button"
                onClick={() => setShowFullExperience(!showFullExperience)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {showFullExperience ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        {/* Social icons – opens nice popover */}
        {socialLinks.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="mt-1 w-full gap-2 rounded-full text-xs font-medium"
              >
                <Globe className="size-3.5" />
                Connect
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-56 p-3" align="center" sideOffset={8}>
              <div className="space-y-1">
                <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
                  Follow {editor.name.split(" ")[0]}
                </p>

                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <span>{social.name}</span>
                    </Link>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Subcategory select */}
        <div className="w-full pt-1">
          <CategorySubcategorySelect
            categorySlug={category.slug}
            subcategories={category.subcategories}
          />
        </div>
      </CardContent>
    </Card>
  );
}
