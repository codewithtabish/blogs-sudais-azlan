import { cn } from "@/lib/utils";
import * as React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SecondContainer({ children, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        // Layout
        // "relative isolate mx-auto min-h-screen w-full max-w-360",

        // // No horizontal padding on mobile.
        // // Responsive padding from small screens upward.
        // "px-0 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10",

        // // Background
        // "bg-background",

        // // Light mode radial gradients
        // "bg-[radial-gradient(circle_at_15%_5%,color-mix(in_oklab,var(--primary)_5%,transparent),transparent_30%),radial-gradient(circle_at_85%_15%,color-mix(in_oklab,var(--primary)_4%,transparent),transparent_28%),radial-gradient(circle_at_50%_100%,color-mix(in_oklab,var(--primary)_3%,transparent),transparent_35%)]",

        // // Dark mode radial gradients
        // "dark:bg-[radial-gradient(circle_at_15%_5%,color-mix(in_oklab,var(--primary)_6%,transparent),transparent_30%),radial-gradient(circle_at_85%_15%,color-mix(in_oklab,var(--primary)_4%,transparent),transparent_28%),radial-gradient(circle_at_50%_100%,color-mix(in_oklab,var(--primary)_3%,transparent),transparent_35%)]",

        // // Smooth theme transition
        // "transition-colors duration-300",

        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
