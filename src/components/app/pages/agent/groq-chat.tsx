"use client";

import React, { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Bot,
  Check,
  ChevronRight,
  Clipboard,
  Copy,
  FolderTree,
  ImageIcon,
  ImagePlus,
  Loader2,
  MessageSquareText,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { agentAction, type AgentMessage } from "@/app/actions/groq/agent-action";

// ============================================================
// TYPES
// ============================================================

type ChatMessage = AgentMessage & {
  id: string;
};

type SelectedImage = {
  file: File;
  previewUrl: string;
};

type AgentChatProps = {
  initialMessages?: AgentMessage[];
  className?: string;
};

type Suggestion = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
};

// ============================================================
// SUGGESTIONS
// ============================================================

const SUGGESTIONS: Suggestion[] = [
  {
    id: "categories",
    title: "Manage Categories",
    description: "Create, update, organize, or review categories.",
    prompt: "Help me manage and organize my categories.",
    icon: <FolderTree className="size-5" />,
  },
  {
    id: "subcategories",
    title: "Organize Content",
    description: "Manage subcategories and improve content structure.",
    prompt: "Help me organize my subcategories and content structure.",
    icon: <MessageSquareText className="size-5" />,
  },
  {
    id: "editors",
    title: "Manage Editors",
    description: "Review editors, assign categories, and manage profiles.",
    prompt: "Help me manage editors and their categories.",
    icon: <Users className="size-5" />,
  },
  {
    id: "image",
    title: "Upload an Image",
    description: "Upload an image for editor profiles or standalone use.",
    prompt: "I want to upload an image.",
    icon: <ImagePlus className="size-5" />,
  },
];

// ============================================================
// HELPERS
// ============================================================

function createMessage(role: AgentMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read the selected image."));
        return;
      }
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the selected image."));
    };

    reader.readAsDataURL(file);
  });
}

function normalizeInitialMessages(initialMessages: AgentMessage[]): ChatMessage[] {
  return initialMessages
    .filter(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
    .map((message) => createMessage(message.role, message.content.trim()))
    .filter((message) => message.content.length > 0);
}

// ============================================================
// COPY MESSAGE BUTTON
// ============================================================

function CopyMessageButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      toast.error("Failed to copy message");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100 focus:opacity-100"
      aria-label="Copy response"
      title="Copy response"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default function AgentChat({ initialMessages = [], className = "" }: AgentChatProps) {
  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    normalizeInitialMessages(initialMessages),
  );
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------------
  // REFS
  // ----------------------------------------------------------

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // ----------------------------------------------------------
  // COMPUTED
  // ----------------------------------------------------------

  const showWelcome = messages.length === 0;
  const canSend = Boolean(input.trim() || selectedImage);
  const messageCount = useMemo(() => messages.length, [messages.length]);

  // ----------------------------------------------------------
  // SCROLL ONLY THE MESSAGES CONTAINER
  // ----------------------------------------------------------

  function scrollMessagesToBottom(behavior: ScrollBehavior = "smooth") {
    const container = messagesContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    });
  }

  useEffect(() => {
    scrollMessagesToBottom("auto");
  }, []);

  useEffect(() => {
    scrollMessagesToBottom("smooth");
  }, [messageCount, isLoading]);

  // ----------------------------------------------------------
  // CLEAN UP OBJECT URL
  // ----------------------------------------------------------

  useEffect(() => {
    return () => {
      if (selectedImage?.previewUrl) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
    };
  }, [selectedImage?.previewUrl]);

  // ----------------------------------------------------------
  // AUTO-RESIZE TEXTAREA
  // ----------------------------------------------------------

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const height = Math.min(textarea.scrollHeight, 180);
    textarea.style.height = `${height}px`;
  }, [input]);

  // ----------------------------------------------------------
  // IMAGE SELECT / REMOVE
  // ----------------------------------------------------------

  function handleSelectImage(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }

    setSelectedImage({
      file,
      previewUrl: URL.createObjectURL(file),
    });

    event.target.value = "";
  }

  function handleRemoveImage() {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }

    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleOpenFilePicker() {
    if (isLoading) return;
    fileInputRef.current?.click();
  }

  // ----------------------------------------------------------
  // SUGGESTION
  // ----------------------------------------------------------

  function handleSuggestion(prompt: string) {
    if (isLoading) return;

    setInput(prompt);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  // ----------------------------------------------------------
  // SEND MESSAGE
  // ----------------------------------------------------------

  async function handleSendMessage() {
    if (isLoading) return;

    const trimmedInput = input.trim();
    if (!trimmedInput && !selectedImage) return;

    setError(null);

    const userMessageContent =
      trimmedInput || (selectedImage ? `Uploaded image: ${selectedImage.file.name}` : "");

    const userMessage = createMessage("user", userMessageContent);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");

    const imageToUpload = selectedImage?.file ?? null;
    handleRemoveImage();
    setIsLoading(true);
    scrollMessagesToBottom("smooth");

    try {
      const conversation: AgentMessage[] = nextMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      let imageDataUrl: string | undefined;

      if (imageToUpload) {
        imageDataUrl = await fileToDataUrl(imageToUpload);
      }

      const result = await agentAction(conversation, imageDataUrl);

      if (!result.success) {
        const errorMessage = result.error || "The AI agent could not complete the request.";

        setError(errorMessage);

        setMessages((currentMessages) => [
          ...currentMessages,
          createMessage("assistant", `## Operation failed\n\n${errorMessage}`),
        ]);

        toast.error("Agent operation failed");
        return;
      }

      const response =
        typeof result.response === "string" && result.response.trim().length > 0
          ? result.response.trim()
          : "The operation completed successfully.";

      setMessages((currentMessages) => [...currentMessages, createMessage("assistant", response)]);
    } catch (caughtError) {
      console.error("[AgentChat] Failed to send message:", caughtError);

      const errorMessage =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while contacting the AI agent.";

      setError(errorMessage);

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", `## Something went wrong\n\n${errorMessage}`),
      ]);

      toast.error("Failed to contact the AI agent");
    } finally {
      setIsLoading(false);

      window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }

  // ----------------------------------------------------------
  // FORM + KEYBOARD
  // ----------------------------------------------------------

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSendMessage();
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    await handleSendMessage();
  }

  function handleDismissError() {
    setError(null);
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div
      className={`isolate flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden bg-background ${className}`}
    >
      {/* ======================================================
          FIXED HEADER — never scrolls with page or messages
      ====================================================== */}
      <header className="relative z-40 flex h-[73px] min-h-[73px] shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl supports-backdrop-filter:bg-background/80 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold tracking-tight">INSIDER AI Agent</h2>
              <span className="hidden rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
                AI Powered
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Your intelligent INSIDER workspace assistant
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-muted/40 px-2.5 py-1.5">
          {isLoading ? (
            <>
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span className="hidden text-xs text-muted-foreground sm:inline">Thinking</span>
            </>
          ) : (
            <>
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                Ready
              </span>
            </>
          )}
        </div>
      </header>

      {/* ======================================================
          ONLY SCROLLABLE AREA — messages / welcome
      ====================================================== */}
      <main
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain scroll-smooth scrollbar-gutter-stable"
      >
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          {/* ---------- Welcome ---------- */}
          {showWelcome && (
            <div className="flex min-h-full flex-1 flex-col justify-center py-4 sm:py-8">
              <div className="mx-auto mb-8 w-full max-w-2xl text-center">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                  <Sparkles className="size-8" />
                </div>

                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  How can I help you today?
                </h1>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Ask INSIDER AI to manage categories, editors, upload profile images, or organize
                  your content structure.
                </p>
              </div>

              <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestion(suggestion.prompt)}
                    disabled={isLoading}
                    className="group flex min-h-[120px] items-start gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-black/4 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                      {suggestion.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold">{suggestion.title}</h3>
                        <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <p className="mx-auto mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
                <Bot className="size-3.5" />
                <span>Start with one of the options above or write your own message.</span>
              </p>
            </div>
          )}

          {/* ---------- Messages ---------- */}
          {!showWelcome && (
            <div className="flex w-full flex-col gap-6 pb-4">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-muted text-foreground"
                      }`}
                    >
                      {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`group relative min-w-0 max-w-[88%] sm:max-w-[82%] ${
                        isUser
                          ? "rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-primary-foreground shadow-sm"
                          : "rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-card-foreground shadow-sm"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap wrap-break-word pr-1 text-sm leading-6">
                          {message.content}
                        </p>
                      ) : (
                        <>
                          <CopyMessageButton content={message.content} />

                          <div className="prose prose-sm max-w-none wrap-break-word pr-6 dark:prose-invert prose-headings:mb-3 prose-headings:mt-3 prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:my-2 prose-p:leading-7 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-foreground prose-pre:my-3 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted/50">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ href, children }) => (
                                  <a href={href} target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                ),
                                img: ({ src, alt }) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={src}
                                    alt={alt ?? ""}
                                    className="my-3 max-h-96 max-w-full rounded-xl border border-border object-contain"
                                  />
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex w-full gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
                    <Bot className="size-4" />
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 shadow-sm">
                    <span className="size-2 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.3s]" />
                    <span className="size-2 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.15s]" />
                    <span className="size-2 animate-bounce rounded-full bg-primary/70" />
                    <span className="ml-1 text-xs text-muted-foreground">
                      INSIDER AI is thinking...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ======================================================
          ERROR BAR (sits above fixed composer)
      ====================================================== */}
      {error && (
        <div className="relative z-30 shrink-0 border-t border-destructive/20 bg-destructive/5 px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
            <p className="min-w-0 text-sm text-destructive">{error}</p>

            <button
              type="button"
              onClick={handleDismissError}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-foreground"
              aria-label="Dismiss error"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          FIXED COMPOSER — never scrolls
      ====================================================== */}
      <footer className="relative z-40 shrink-0 border-t border-border bg-background/95 p-3 backdrop-blur-xl supports-backdrop-filter:bg-background/80 sm:p-4">
        <div className="mx-auto w-full max-w-5xl">
          {/* Image preview */}
          {selectedImage && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-2">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage.previewUrl}
                  alt={selectedImage.file.name}
                  className="size-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{selectedImage.file.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatFileSize(selectedImage.file.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isLoading}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                aria-label="Remove image"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}

          {/* Input row */}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectImage}
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={handleOpenFilePicker}
              disabled={isLoading}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              aria-label="Upload image"
              title="Upload image"
            >
              {selectedImage ? (
                <ImageIcon className="size-5 text-primary" />
              ) : (
                <Paperclip className="size-5" />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder="Message INSIDER AI..."
              className="block max-h-[180px] min-h-10 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-1 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={isLoading || !canSend}
              aria-label="Send message"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:scale-[1.03] hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </form>

          <div className="mt-2 flex items-center justify-center gap-2 text-center text-[10px] text-muted-foreground">
            <Clipboard className="size-3" />
            <span>Enter to send</span>
            <span>·</span>
            <span>Shift + Enter for a new line</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
