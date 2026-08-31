// src/components/(app)/(common)/footer/footer-visibility.tsx

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type FooterVisibilityProps = {
  children: ReactNode;
  /** Route prefixes where the footer should be hidden (e.g. ["/agent"]) */
  hideOnPrefixes?: string[];
};

export function FooterVisibility({ children, hideOnPrefixes = ["/agent"] }: FooterVisibilityProps) {
  const pathname = usePathname() ?? "";

  const shouldHide = hideOnPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (shouldHide) {
    return null;
  }

  return <>{children}</>;
}
