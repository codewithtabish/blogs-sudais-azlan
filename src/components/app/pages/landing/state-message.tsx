import Link from "next/link";

import { Button } from "@/components/ui/button";

export function StateMessage({
  title,
  description,
  showRetry = false,
}: {
  title: string;
  description: string;
  showRetry?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="font-serif text-2xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-muted-foreground">{description}</p>
      {showRetry && (
        <Button asChild variant="outline">
          <Link href="/">Try again</Link>
        </Button>
      )}
    </div>
  );
}
