"use cache";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

interface AboutBasicSection {
  title: string;
  content: string;
  label?: string;
}

interface AboutImage {
  src: string;
  alt: string;
  srcDark?: string;
}

interface AboutBasicProps {
  heading: string;
  description?: string;
  images?: AboutImage[];
  sections?: AboutBasicSection[];
  className?: string;
}

type About29Props = AboutBasicProps;

type Props = Partial<About29Props>;

// ============================================================
// DEFAULT CONTENT
// ============================================================

const defaultProps: About29Props = {
  heading: "About INSIDER",

  description:
    "INSIDER is an independent editorial publication built to make the internet more useful. We explore technology, artificial intelligence, business, productivity, digital culture, science, money, lifestyle, and the ideas shaping how people live and work.",

  images: [
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/about/photo-1-16x9.jpg",
      alt: "INSIDER editorial workspace",
    },
    {
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/about/photo-2-16x9.jpg",
      alt: "INSIDER editorial team and creative workspace",
    },
  ],

  sections: [
    {
      title: "Our Vision",
      content:
        "The internet gives us access to more information than ever before, but more information does not always mean better understanding. INSIDER exists to help close that gap.\n\nWe believe good editorial work should be useful, clear, thoughtful, and grounded in reality. Our goal is to publish stories that help readers understand technology, discover better ideas, make smarter decisions, and keep up with a rapidly changing world.\n\nINSIDER brings together practical guides, explainers, original perspectives, product and technology coverage, business stories, and cultural ideas in one modern editorial publication.",
    },

    {
      title: "What We Cover",
      content:
        "INSIDER is designed as a broad editorial publication rather than a single-topic blog. Our coverage spans technology, artificial intelligence, software, startups, business, productivity, science, money, digital culture, lifestyle, and other subjects that matter in modern life.\n\nOur categories can evolve as the world changes. New topics, sections, and subcategories can be introduced when they become useful to our readers.\n\nThe objective is simple: publish useful information without unnecessary complexity.",
    },

    {
      label: "Our mission",
      title: "Make the internet more useful.",
      content:
        "Our mission is to create an editorial publication where readers can discover useful knowledge, understand complicated subjects, explore new ideas, and make better decisions.",
    },

    {
      label: "What drives us",
      title: "Useful journalism, practical knowledge, and ideas worth sharing.",
      content:
        "We start with the reader. Every story should have a reason to exist, whether it explains something complicated, solves a practical problem, introduces an important idea, or helps someone understand what is happening around them.",
    },

    {
      title: "Technology",
      content:
        "We cover software, web development, apps, platforms, devices, programming, emerging technologies, and the digital tools people use every day.",
    },

    {
      title: "Artificial Intelligence",
      content:
        "AI is changing how people work, create, learn, and build businesses. INSIDER explores AI tools, models, agents, applications, trends, and the practical impact of artificial intelligence.",
    },

    {
      title: "Business & Startups",
      content:
        "We explore companies, startups, entrepreneurship, digital businesses, products, markets, creators, and the people building the next generation of internet businesses.",
    },

    {
      title: "Productivity",
      content:
        "Better tools and better systems can change how we work. Our productivity coverage focuses on workflows, habits, software, organization, learning, and practical ways to get more done.",
    },

    {
      title: "Science",
      content:
        "We make scientific ideas easier to understand through accessible explanations, discoveries, emerging research, technology, space, and the science behind everyday life.",
    },

    {
      title: "Money",
      content:
        "Our money coverage focuses on personal finance, digital finance, business economics, earning, saving, technology and the changing relationship between people and money.",
    },

    {
      title: "Digital Culture",
      content:
        "The internet has changed how people communicate, create, consume media, and build communities. We explore the platforms, trends, creators, and cultural shifts shaping digital life.",
    },

    {
      title: "Lifestyle",
      content:
        "Technology is only part of modern life. Our lifestyle coverage looks at practical ideas, everyday experiences, learning, work, creativity, and the things that make life better.",
    },
  ],
};

// ============================================================
// CONSTANTS
// ============================================================

const MAX_GALLERY_IMAGES = 2;
const COLUMN_CHARS = 180;

// ============================================================
// HELPERS
// ============================================================

function truncate(content: string, length = COLUMN_CHARS) {
  if (content.length <= length) {
    return content;
  }

  return `${content.slice(0, length).trimEnd()}…`;
}

// ============================================================
// ABOUT COMPONENT
// ============================================================

const About29 = async (props: Props) => {
  const { heading, description, images, sections, className } = {
    ...defaultProps,
    ...props,
  };

  const gallery = (images ?? []).slice(0, MAX_GALLERY_IMAGES);
  const allSections = sections ?? [];

  const mission = allSections.find((section) => section.label?.toLowerCase() === "our mission");

  const valuesSection = allSections.find(
    (section) => section.label?.toLowerCase() === "what drives us",
  );

  const editorialSections = allSections
    .filter((section) => section !== mission && section !== valuesSection && !section.label)
    .slice(0, 3);

  return (
    <section className={cn("py-24 md:py-32", className)}>
      <div className="container mx-auto">
        <div className="flex flex-col gap-16 lg:gap-28">
          {/* ================================================== */}
          {/* HERO */}
          {/* ================================================== */}

          <div className="flex flex-col gap-5 lg:gap-8">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Independent Editorial Publication
              </p>

              <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-7xl">
                {heading}
              </h1>
            </div>

            {description && (
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
                {description}
              </p>
            )}
          </div>

          {/* ================================================== */}
          {/* IMAGE GALLERY */}
          {/* ================================================== */}

          {gallery.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {gallery[0] && (
                <div className="relative min-h-[280px] overflow-hidden rounded-2xl md:min-h-[420px]">
                  <Image
                    src={gallery[0].src}
                    alt={gallery[0].alt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}

              {gallery[1] && (
                <div className="relative min-h-[280px] overflow-hidden rounded-2xl md:min-h-[420px]">
                  <Image
                    src={gallery[1].src}
                    alt={gallery[1].alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-black/45" />

                  <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-end p-8 md:min-h-[420px] md:p-10">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                      {mission?.label ?? "Our Mission"}
                    </p>

                    <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-white md:text-4xl">
                      {mission?.title ?? "Make the internet more useful."}
                    </h2>

                    {mission?.content && (
                      <p className="mt-4 max-w-xl text-base leading-7 text-white/85">
                        {mission.content}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================== */}
          {/* OUR STORY */}
          {/* ================================================== */}

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Our Story
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                Built by creators who believe useful information matters.
              </h2>
            </div>

            <div className="space-y-6 text-lg leading-8 text-muted-foreground">
              <p>
                INSIDER was created around a simple idea: the web should not just give people more
                information. It should help people understand information.
              </p>

              <p>
                We are building an editorial platform where technology, business, artificial
                intelligence, science, productivity, money, digital culture, and lifestyle can be
                explored through useful and accessible stories.
              </p>

              <p>
                Our publication is designed to grow with its readers. As new technologies emerge and
                society changes, our editorial categories can evolve with them.
              </p>
            </div>
          </div>

          {/* ================================================== */}
          {/* WHAT DRIVES US */}
          {/* ================================================== */}

          {valuesSection && (
            <div className="flex flex-col gap-10">
              <div className="max-w-3xl">
                {valuesSection.label && (
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    {valuesSection.label}
                  </p>
                )}

                <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  {valuesSection.title}
                </h2>

                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  {valuesSection.content}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3 md:gap-12">
                {editorialSections.map((section) => (
                  <article
                    key={section.title}
                    className="flex flex-col gap-4 border-t border-border pt-6"
                  >
                    <h3 className="text-lg font-semibold">{section.title}</h3>

                    <p className="leading-7 text-muted-foreground">{truncate(section.content)}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* EDITORIAL CATEGORIES */}
          {/* ================================================== */}

          <div className="flex flex-col gap-10">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Editorial Coverage
              </p>

              <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                Stories across the modern world.
              </h2>

              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                INSIDER is intentionally broad. Our editorial categories are built around the
                subjects people need to understand, use, and navigate in modern life.
              </p>
            </div>

            <div className="grid gap-x-10 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
              {allSections
                .filter(
                  (section) =>
                    section.title &&
                    !section.label &&
                    section.title !== "Our Vision" &&
                    section.title !== "What We Cover" &&
                    section.title !== "Our Creators",
                )
                .map((section) => (
                  <article key={section.title} className="border-t border-border py-7">
                    <h3 className="text-lg font-semibold">{section.title}</h3>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {truncate(section.content, 150)}
                    </p>
                  </article>
                ))}
            </div>
          </div>

          {/* ================================================== */}
          {/* STARTUP / CODEWITH TABISH */}
          {/* ================================================== */}

          <div className="overflow-hidden rounded-3xl border border-border bg-muted/40">
            <div className="grid lg:grid-cols-[1fr_1.2fr]">
              <div className="flex flex-col justify-between border-b border-border p-8 md:p-12 lg:border-b-0 lg:border-r">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Behind INSIDER
                  </p>

                  <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                    Built by CodeWithTabish.
                  </h2>
                </div>

                <div className="mt-10">
                  <Link
                    href="https://codewithtabish.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Visit CodeWithTabish
                    <span className="ml-2" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <p className="text-lg leading-8 text-muted-foreground">
                  INSIDER is part of a broader creator and technology journey built through{" "}
                  <span className="font-medium text-foreground">CodeWithTabish</span>.
                </p>

                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  CodeWithTabish focuses on building software, exploring modern web technologies,
                  artificial intelligence, developer tools, and digital products. INSIDER extends
                  that builder mindset into publishing — creating a place where useful knowledge and
                  ideas can reach a much wider audience.
                </p>

                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  The goal is bigger than a single website. We are building a startup and digital
                  publishing ecosystem around technology, creativity, education, and useful
                  information.
                </p>

                <div className="mt-10 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
                  <div>
                    <p className="text-2xl font-semibold">INSIDER</p>
                    <p className="mt-1 text-sm text-muted-foreground">Editorial publication</p>
                  </div>

                  <div>
                    <p className="text-2xl font-semibold">CodeWithTabish</p>
                    <p className="mt-1 text-sm text-muted-foreground">Technology & development</p>
                  </div>

                  <div>
                    <p className="text-2xl font-semibold">Startup</p>
                    <p className="mt-1 text-sm text-muted-foreground">Building digital products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* VISION / CREATORS */}
          {/* ================================================== */}

          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            {allSections
              .filter(
                (section) => section.title === "Our Vision" || section.title === "What We Cover",
              )
              .map((section) => (
                <article key={section.title} className="border-t border-border pt-7">
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    {section.title}
                  </h2>

                  <div className="mt-5 whitespace-pre-line text-base leading-8 text-muted-foreground">
                    {section.content}
                  </div>
                </article>
              ))}
          </div>

          {/* ================================================== */}
          {/* FINAL STATEMENT */}
          {/* ================================================== */}

          <div className="border-t border-border pt-10">
            <div className="max-w-4xl">
              <p className="text-2xl font-medium leading-10 tracking-tight md:text-4xl md:leading-tight">
                We are building INSIDER for curious people — people who want to understand what is
                changing, discover what is useful, and find ideas worth taking into the real world.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { About29 };
