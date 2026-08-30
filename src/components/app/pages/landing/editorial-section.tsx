import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { Reveal } from "./reveal";

export function EditorialSection({
  title,
  viewAllHref,
  children,
}: {
  title: string;
  viewAllHref?: string;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View all
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <Separator />

        {children}
      </section>
    </Reveal>
  );
}
