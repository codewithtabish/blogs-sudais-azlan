import { cn } from "@/lib/utils";
import * as React from "react";

interface BlogContentContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function BlogContentContainer({ children, className, ...props }: BlogContentContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-4xl", "min-w-0", "py-8 sm:py-10 lg:py-12 ", className)}
      {...props}
    >
      {children}
    </div>
  );
}
