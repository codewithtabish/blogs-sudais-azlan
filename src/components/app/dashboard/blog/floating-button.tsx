// components/scroll-to-top-bottom.tsx
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollToTopBottom() {
  const [isNearTop, setIsNearTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Consider "near top" if scrolled less than 300px
      setIsNearTop(window.scrollY < 300);
    };

    // Run once on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (position: "top" | "bottom") => {
    window.scrollTo({
      top: position === "top" ? 0 : document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <Button
      size="icon"
      variant="secondary"
      onClick={() => scrollTo(isNearTop ? "bottom" : "top")}
      className={cn(
        "fixed bottom-6 right-6 z-50 size-12 rounded-full shadow-lg",
        "hover:scale-105 transition-all duration-200",
      )}
      aria-label={isNearTop ? "Scroll to bottom" : "Scroll to top"}
    >
      {isNearTop ? <ArrowDown className="size-5" /> : <ArrowUp className="size-5" />}
    </Button>
  );
}
