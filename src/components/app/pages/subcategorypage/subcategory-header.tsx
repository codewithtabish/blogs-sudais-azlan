"use client";

import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SubcategoryPageCategory } from "@/app/actions/(category)/get-top-subcategory-blogs-action";

type SubcategoryHeaderProps = {
  category: SubcategoryPageCategory;
  currentSubcategorySlug: string;
  currentSubcategoryName: string;
};

function TypingTitleInner({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 45);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      <motion.span
        aria-hidden="true"
        className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.05em] bg-primary align-middle"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear", times: [0, 0.5, 0.5, 1] }}
      />
    </span>
  );
}

function TypingTitle({ text }: { text: string }) {
  // key={text} forces a full remount when text changes,
  // so `displayed` starts fresh via useState's initializer
  // instead of being reset with a synchronous setState in an effect.
  return <TypingTitleInner key={text} text={text} />;
}

export function SubcategoryHeader({
  category,
  currentSubcategorySlug,
  currentSubcategoryName,
}: SubcategoryHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Icon bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary shadow-[0_0_30px_-8px] shadow-primary/50"
      >
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/40"
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <MessageSquareText className="size-7" />
      </motion.div>

      {/* Big title — no border, animated gradient text + typing caret */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
        className="bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_auto] bg-clip-text px-4 text-3xl font-extrabold uppercase tracking-wide text-transparent sm:text-4xl"
        style={{ animation: "shine 4s linear infinite" }}
      >
        <TypingTitle text={currentSubcategoryName} />
      </motion.h1>

      {/* Sibling subcategory pill nav */}
      {category.subcategories.length > 0 ? (
        <motion.nav
          aria-label="Subcategories"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } },
          }}
          className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 pt-6"
        >
          {category.subcategories.map((sub) => {
            const isActive = sub.slug === currentSubcategorySlug;

            return (
              <motion.div
                key={sub.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <Link
                  href={`/${category.slug}/${sub.slug}`}
                  className="group relative inline-block px-3 py-1.5 text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  <motion.span
                    whileHover={{ y: -1 }}
                    className={
                      isActive
                        ? "relative z-10 text-primary"
                        : "relative z-10 text-foreground transition-colors group-hover:text-primary"
                    }
                  >
                    {sub.name}
                  </motion.span>

                  {isActive ? (
                    <motion.span
                      layoutId="active-subcategory-pill"
                      className="absolute inset-0 rounded-full bg-primary/10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  ) : (
                    <span className="absolute inset-x-3 bottom-0 h-px scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>
      ) : null}

      <style jsx>{`
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  );
}
