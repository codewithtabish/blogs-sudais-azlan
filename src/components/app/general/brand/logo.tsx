"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  /** "lockup" = icon + wordmark. "mark" = icon only (compact spaces). */
  variant?: "lockup" | "mark";
  size?: LogoSize;
  /** Set to null to render without a wrapping <Link>. Defaults to "/". */
  href?: string | null;
  className?: string;
  priority?: boolean;
}

const LOCKUP_SIZES: Record<LogoSize, string> = {
  sm: "h-6 w-auto",
  md: "h-7 w-auto sm:h-8",
  lg: "h-9 w-auto sm:h-10",
};

const MARK_SIZES: Record<LogoSize, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

/**
 * Tracks whether we've hydrated on the client, without the
 * "setState inside an effect" anti-pattern. The external store
 * never actually changes after mount — subscribe is a no-op —
 * we're only using this to get a value that differs between the
 * server snapshot (false) and the client snapshot (true).
 */
function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function useIsMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * INSIDER brand mark.
 *
 * Automatically swaps between the dark-ink and light-ink SVG assets
 * based on the resolved theme (next-themes). Guards against the
 * light/dark flash + hydration mismatch by rendering a neutral
 * skeleton until mounted on the client.
 *
 * Assets expected at:
 *   /public/images/brandlogo/insider-lockup-dark.svg
 *   /public/images/brandlogo/insider-lockup-light.svg
 *   /public/images/brandlogo/insider-mark-dark.svg
 *   /public/images/brandlogo/insider-mark-light.svg
 */
export function Logo({
  variant = "lockup",
  size = "md",
  href = "/",
  className,
  priority = false,
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useIsMounted();

  const sizeClass = variant === "lockup" ? LOCKUP_SIZES[size] : MARK_SIZES[size];

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-block animate-pulse rounded-md bg-muted", sizeClass, className)}
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const fileName =
    variant === "lockup"
      ? isDark
        ? "insider-lockup-light.svg"
        : "insider-lockup-dark.svg"
      : isDark
        ? "insider-mark-light.svg"
        : "insider-mark-dark.svg";

  const intrinsic = variant === "lockup" ? { width: 160, height: 40 } : { width: 40, height: 40 };

  const image = (
    <Image
      src={`/images/brandlogo/${fileName}`}
      alt="INSIDER"
      width={intrinsic.width}
      height={intrinsic.height}
      priority={priority}
      className={cn(sizeClass, className)}
    />
  );

  if (href === null) return image;

  return (
    <Link
      href={href}
      aria-label="INSIDER home"
      className="inline-flex shrink-0 items-center transition-opacity duration-200 hover:opacity-80"
    >
      {image}
    </Link>
  );
}
