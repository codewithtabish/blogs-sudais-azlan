"use client";

import confetti from "canvas-confetti";
import Image from "next/image";
import Link from "next/link";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";

import { subscribeNewsletterAction } from "@/app/actions/(newsletter)/subscribe-newsletter-action";

import { KineticText } from "@/components/ui/kinetic-text";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from "../theme/social-icons";

const NEWSLETTER_SUBSCRIBED_KEY = "insider_newsletter_subscribed";
const NEWSLETTER_SUBSCRIBED_EVENT = "insider:newsletter-subscribed";

const socialLinks = [
  {
    name: "Website",
    href: "https://codewithtabish.com/",
    type: "website",
  },
  {
    name: "GitHub",
    href: "https://github.com/",
    icon: GithubIcon,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: LinkedinIcon,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    icon: InstagramIcon,
  },
  {
    name: "X",
    href: "https://x.com/",
    icon: XIcon,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/",
    icon: FacebookIcon,
  },
];

function fireConfetti() {
  confetti({
    particleCount: 140,
    spread: 85,
    startVelocity: 30,
    origin: {
      x: 0.5,
      y: 0.5,
    },
    colors: [
      "hsl(var(--primary))",
      "hsl(var(--foreground))",
      "#22c55e",
      "#4ade80",
      "#86efac",
      "#ffffff",
    ],
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getSubscribedEmails(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY);

    if (!stored) {
      return [];
    }

    if (stored === "true") {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((value): value is string => typeof value === "string")
      .map(normalizeEmail)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function isEmailSubscribed(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return false;
  }

  return getSubscribedEmails().some(
    (storedEmail) => normalizeEmail(storedEmail) === normalizedEmail,
  );
}

function saveSubscribedEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return;
  }

  const existingEmails = getSubscribedEmails();

  const alreadyExists = existingEmails.some(
    (storedEmail) => normalizeEmail(storedEmail) === normalizedEmail,
  );

  if (alreadyExists) {
    return;
  }

  localStorage.setItem(
    NEWSLETTER_SUBSCRIBED_KEY,
    JSON.stringify([...existingEmails, normalizedEmail]),
  );
}

export default function TheDaily() {
  const [socialOpen, setSocialOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentEmailSubscribed, setCurrentEmailSubscribed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const socialRef = useRef<HTMLDivElement>(null);

  // Sync subscribed-state across tabs / other newsletter widgets on the page.
  useEffect(() => {
    const handleNewsletterSubscribed = () => {
      const currentEmail = normalizeEmail(email);

      if (!currentEmail) {
        return;
      }

      const alreadySubscribed = isEmailSubscribed(currentEmail);

      setCurrentEmailSubscribed(alreadySubscribed);

      if (alreadySubscribed) {
        setMessage(null);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== NEWSLETTER_SUBSCRIBED_KEY) {
        return;
      }

      const currentEmail = normalizeEmail(email);

      if (!currentEmail) {
        return;
      }

      const alreadySubscribed = isEmailSubscribed(currentEmail);

      setCurrentEmailSubscribed(alreadySubscribed);

      if (alreadySubscribed) {
        setMessage(null);
      }
    };

    window.addEventListener(NEWSLETTER_SUBSCRIBED_EVENT, handleNewsletterSubscribed);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(NEWSLETTER_SUBSCRIBED_EVENT, handleNewsletterSubscribed);
      window.removeEventListener("storage", handleStorage);
    };
  }, [email]);

  // Close the social dropdown on outside click or Escape.
  useEffect(() => {
    if (!socialOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!socialRef.current) {
        return;
      }

      if (!socialRef.current.contains(event.target as Node)) {
        setSocialOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSocialOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [socialOpen]);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextEmail = event.target.value;

    setEmail(nextEmail);

    const normalizedEmail = normalizeEmail(nextEmail);

    if (!normalizedEmail) {
      setCurrentEmailSubscribed(false);
      setMessage(null);
      return;
    }

    const alreadySubscribed = isEmailSubscribed(normalizedEmail);

    setCurrentEmailSubscribed(alreadySubscribed);
    setMessage(null);
  };

  const handleSubscribe = async () => {
    const trimmedEmail = normalizeEmail(email);

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    if (isEmailSubscribed(trimmedEmail)) {
      setCurrentEmailSubscribed(true);
      setMessage(null);
      return;
    }

    setMessage(null);
    setLoading(true);

    try {
      const result = await subscribeNewsletterAction(trimmedEmail);

      if (!result.success) {
        const serverMessage = result.message?.toLowerCase() ?? "";

        const isDuplicate =
          serverMessage.includes("already subscribed") ||
          serverMessage.includes("already a subscriber") ||
          serverMessage.includes("already exists");

        if (isDuplicate) {
          saveSubscribedEmail(trimmedEmail);
          setCurrentEmailSubscribed(true);
          setMessage(null);

          window.dispatchEvent(new Event(NEWSLETTER_SUBSCRIBED_EVENT));

          return;
        }

        setMessage(result.message);
        return;
      }

      /*
       * Subscription succeeded.
       *
       * Save the email locally so the same email cannot
       * be submitted again from this browser.
       */
      saveSubscribedEmail(trimmedEmail);

      /*
       * Notify other newsletter components.
       */
      window.dispatchEvent(new Event(NEWSLETTER_SUBSCRIBED_EVENT));

      /*
       * Celebrate successful subscription.
       */
      fireConfetti();

      /*
       * IMPORTANT:
       *
       * Clear the email input after the server action
       * successfully completes and the welcome-email
       * process has been triggered on the server.
       */
      setEmail("");

      /*
       * Reset the email-specific subscribed state because
       * the input is now empty.
       */
      setCurrentEmailSubscribed(false);

      /*
       * Show the success message after clearing the input.
       */
      setMessage("You're subscribed! Welcome to the INSIDER newsletter.");
    } catch (error) {
      console.error("Newsletter subscription failed:", error);

      setMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading || currentEmailSubscribed) {
      return;
    }

    await handleSubscribe();
  };

  return (
    <section className="border-y border-border py-14 sm:py-16">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="flex w-full flex-col items-center gap-10 md:flex-row md:items-center md:justify-between md:gap-14 lg:gap-20">
          {/* LEFT — EDITOR */}
          <div className="flex shrink-0 flex-col items-center text-center md:items-start md:text-left">
            <div className="relative h-48 w-48 sm:h-52 sm:w-44">
              <Image
                src="/images/about/about.png"
                alt="SUDAIS AZLAN"
                fill
                priority
                className="object-center"
                sizes="(max-width: 640px) 192px, 208px"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <h3 className="relative inline-block text-xl font-semibold tracking-tight">
                  <span className="absolute bottom-1 left-0 z-0 h-2.5 w-full bg-primary/40" />
                </h3>
                <KineticText text="SUDAIS AZALN" as="h2" className="relative z-10" />

                <div className="relative" ref={socialRef}>
                  <button
                    type="button"
                    aria-label="Open Talha Tabish social links"
                    aria-expanded={socialOpen}
                    onClick={() => setSocialOpen((open) => !open)}
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-primary/30
                      text-primary
                      transition-all
                      hover:border-primary
                      hover:bg-primary
                      hover:text-primary-foreground
                    "
                  >
                    <span className="text-sm font-semibold leading-none">@</span>
                  </button>

                  {socialOpen && (
                    <div
                      role="menu"
                      className="
                        absolute
                        bottom-full
                        left-1/2
                        z-50
                        mb-3
                        w-64
                        -translate-x-1/2
                        rounded-xl
                        border
                        border-border
                        bg-background
                        p-3
                        text-left
                        shadow-xl
                        shadow-black/10
                        md:left-0
                        md:translate-x-0
                      "
                    >
                      <div className="mb-2 px-2">
                        <p className="text-sm font-semibold text-foreground">Talha Tabish</p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Software Engineer &amp; Full-Stack Developer
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        {socialLinks.map((social) => {
                          const Icon = social.icon;

                          return (
                            <Link
                              key={social.name}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              role="menuitem"
                              onClick={() => setSocialOpen(false)}
                              className="
                                flex
                                items-center
                                gap-3
                                rounded-lg
                                px-2.5
                                py-2
                                text-sm
                                text-muted-foreground
                                transition-colors
                                hover:bg-primary/10
                                hover:text-primary
                              "
                            >
                              {social.type === "website" ? (
                                <span className="flex h-5 w-5 items-center justify-center text-xs font-bold">
                                  ↗
                                </span>
                              ) : Icon ? (
                                <Icon className="h-4 w-4" />
                              ) : null}

                              <span>{social.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Editor in Chief
              </p>

              <p className="mt-3 max-w-[290px] text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                Software engineer and full-stack developer building modern digital experiences,
                products, and ideas.
              </p>

              <Link
                href="https://sudaisazlan.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1.5
                  text-xs
                  font-medium
                  text-primary
                  transition-colors
                  hover:text-primary/80
                "
              >
                <span>sudaisazlan.com</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          {/* RIGHT — THE DAILY */}
          <div className="w-full max-w-md flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">The Daily</h2>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Ready to do everything better? Get daily tips, tricks, and tech guides from our expert
              team.
            </p>

            <form
              onSubmit={handleSubmit}
              className="
                mt-7
                flex
                w-full
                flex-col
                gap-3
                sm:flex-row
                sm:items-start
              "
            >
              <div className="w-full flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Email address"
                  autoComplete="email"
                  required
                  aria-label="Email address"
                  disabled={loading}
                  className="
                    h-12
                    w-full
                    rounded-lg
                    border
                    border-border
                    bg-transparent
                    px-4
                    text-sm
                    text-foreground
                    outline-none
                    ring-ring
                    placeholder:text-muted-foreground
                    focus:ring-2
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    sm:flex-1
                  "
                />

                {currentEmailSubscribed && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="
                      mt-2
                      text-left
                      text-xs
                      font-medium
                      text-muted-foreground
                    "
                  >
                    This email is already subscribed.
                  </p>
                )}

                {message && !currentEmailSubscribed && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="
                      mt-2
                      text-left
                      text-xs
                      font-medium
                      text-muted-foreground
                    "
                  >
                    {message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || currentEmailSubscribed}
                className="
                  h-12
                  shrink-0
                  rounded-lg
                  bg-primary
                  px-7
                  text-sm
                  font-semibold
                  text-primary-foreground
                  transition-colors
                  hover:bg-primary/90
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:self-start
                "
              >
                {loading ? "Subscribing..." : currentEmailSubscribed ? "Subscribed" : "Sign Up"}
              </button>
            </form>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              By clicking Sign Up, you confirm you are 16+ and agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
