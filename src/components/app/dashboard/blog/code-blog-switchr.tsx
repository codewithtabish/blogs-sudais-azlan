"use client";

import { useEffect, useRef, useState } from "react";

const CODE_SWITCHER = "[data-code-switcher]";
const CODE_LANGUAGE = "[data-code-language]";
const CODE_CONTENT = "[data-code-language-content]";
const CODE_COPY = "[data-code-copy]";

const TABS = "[data-tabs]";
const TAB = "[data-tab]";
const TAB_CONTENT = "[data-tab-content]";

type ToastState = {
  visible: boolean;
  message: string;
};

function updateCodeBlock(switcher: HTMLElement) {
  const select = switcher.querySelector<HTMLSelectElement>(CODE_LANGUAGE);
  const blocks = switcher.querySelectorAll<HTMLElement>(CODE_CONTENT);

  if (!select || blocks.length === 0) return;

  const language = select.value;

  blocks.forEach((block) => {
    const blockLanguage = block.getAttribute("data-code-language-content");
    block.classList.toggle("hidden", blockLanguage !== language);
  });
}

function updateTabs(tabContainer: HTMLElement, selectedTab: string) {
  const tabs = tabContainer.querySelectorAll<HTMLElement>(TAB);
  const contents = tabContainer.querySelectorAll<HTMLElement>(TAB_CONTENT);

  tabs.forEach((tab) => {
    const tabName = tab.getAttribute("data-tab");
    const active = tabName === selectedTab;

    tab.setAttribute("aria-selected", String(active));
    tab.classList.toggle("bg-background", active);
    tab.classList.toggle("text-foreground", active);
    tab.classList.toggle("shadow-sm", active);
    tab.classList.toggle("text-muted-foreground", !active);
    tab.classList.toggle("hover:text-foreground", !active);
  });

  contents.forEach((content) => {
    const contentName = content.getAttribute("data-tab-content");
    content.classList.toggle("hidden", contentName !== selectedTab);
  });
}

function initializeTabs() {
  document.querySelectorAll<HTMLElement>(TABS).forEach((tabContainer) => {
    const firstTab = tabContainer.querySelector<HTMLElement>(TAB);
    if (!firstTab) return;

    const initialTab = firstTab.getAttribute("data-tab");
    if (!initialTab) return;

    updateTabs(tabContainer, initialTab);
  });
}

export default function CodeBlockSwitcher() {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "" });
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => {
      setToast({ visible: false, message: "" });
    }, 2200);
  };

  useEffect(() => {
    document.querySelectorAll<HTMLElement>(CODE_SWITCHER).forEach(updateCodeBlock);
    initializeTabs();

    const handleChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement) || !target.matches(CODE_LANGUAGE)) return;
      const switcher = target.closest<HTMLElement>(CODE_SWITCHER);
      if (switcher) updateCodeBlock(switcher);
    };

    const handleClick = async (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      // Tabs
      const tab = target.closest<HTMLElement>(TAB);
      if (tab) {
        const tabContainer = tab.closest<HTMLElement>(TABS);
        if (!tabContainer) return;
        const selectedTab = tab.getAttribute("data-tab");
        if (selectedTab) updateTabs(tabContainer, selectedTab);
        return;
      }

      // Copy code
      const copyButton = target.closest<HTMLElement>(CODE_COPY);
      if (!copyButton) return;

      const switcher = copyButton.closest<HTMLElement>(CODE_SWITCHER);
      if (!switcher) return;

      const visibleCode = Array.from(switcher.querySelectorAll<HTMLElement>(CODE_CONTENT)).find(
        (b) => !b.classList.contains("hidden"),
      );

      const code = visibleCode?.querySelector("code")?.textContent?.trim() ?? "";
      if (!code) {
        showToast("Nothing to copy");
        return;
      }

      try {
        await navigator.clipboard.writeText(code);
        const label = copyButton.querySelector<HTMLElement>("[data-copy-label]");
        if (label) label.textContent = "Copied";
        showToast("Code copied to clipboard");
        setTimeout(() => {
          if (label) label.textContent = "Copy";
        }, 1800);
      } catch {
        showToast("Could not copy code");
      }
    };

    document.addEventListener("change", handleChange);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("change", handleChange);
      document.removeEventListener("click", handleClick);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`pointer-events-none fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 transition-all duration-300 ${
        toast.visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 rounded-full border border-border bg-background/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-2xl backdrop-blur-xl">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M4 10.5 8 14l8-8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
