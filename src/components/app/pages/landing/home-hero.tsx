"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HomeHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex max-w-2xl flex-col gap-4"
    >
      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">INSIDER</span>

      <h1 className="font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
        Technology, ideas, and the world taking shape around them.
      </h1>

      <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        INSIDER explores artificial intelligence, programming, emerging technology, and the trends
        shaping how people build, work, and think — explained clearly, without the noise.
      </p>
    </motion.div>
  );
}
