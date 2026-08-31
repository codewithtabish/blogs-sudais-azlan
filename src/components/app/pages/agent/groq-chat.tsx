"use client";

import {
  agentAction,
  type AgentActionResult,
  type AgentMessage,
} from "@/app/actions/groq/agent-action";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Check, Copy, RotateCcw, Send, Sparkles } from "lucide-react";

type MessageRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
};

const SUGGESTIONS = [
  {
    title: "Create a category",
    prompt: "Add a new category.",
  },
  {
    title: "Change the theme",
    prompt: "Change the INSIDER theme to the Claude theme.",
  },
  {
    title: "Create an article",
    prompt: "Create an article about WebRTC and explain how it works.",
  },
  {
    title: "Improve the editor",
    prompt: "Inspect the article editor and suggest improvements.",
  },
];

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function looksLikeHtml(text: string) {
  const sample = text.slice(0, 1000).toLowerCase();

  return (
    sample.includes("<!doctype") ||
    sample.includes("<html") ||
    sample.includes("<script") ||
    sample.includes("self.__next_f") ||
    sample.includes("next-error")
  );
}

async function copyText(text: string, successLabel: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successLabel);
  } catch {
    toast.error("Could not copy to clipboard.");
  }
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="size-4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 4.93 6.35 6.35" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m17.65 17.65 1.42 1.42" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12h2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.93 19.07 1.42-1.42" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m17.65 6.35 1.42-1.42" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2.5 text-muted-foreground">
      <span className="text-sm font-medium">Thinking</span>

      <span className="flex items-center gap-1">
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-current" />
      </span>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyText(text, label);

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-background/80 px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      aria-label={label}
    >
      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}

      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ language, children }: { language?: string; children: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyText(children, "Code copied");

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-950 text-zinc-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wide text-zinc-400">
          {language || "code"}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}

          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-[13px] leading-6">
        <code className="font-mono text-zinc-100">{children}</code>
      </pre>
    </div>
  );
}

function AssistantMarkdown({ content }: { content: string }) {
  if (looksLikeHtml(content)) {
    return <p className="text-sm text-destructive">Invalid response received. Please try again.</p>;
  }

  return (
    <div className="max-w-none text-[15px] leading-7 text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-6 mb-3 border-b border-border pb-2 text-xl font-semibold tracking-tight first:mt-0">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mt-6 mb-2.5 text-lg font-semibold tracking-tight first:mt-0">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mt-5 mb-2 text-base font-semibold tracking-tight first:mt-0">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="my-3 leading-7 text-foreground/90 first:mt-0 last:mb-0">{children}</p>
          ),

          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-primary/70">{children}</ul>
          ),

          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:text-primary/70">
              {children}
            </ol>
          ),

          li: ({ children }) => <li className="leading-7 text-foreground/90">{children}</li>,

          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              {children}
            </a>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-primary/50 bg-muted/40 py-2 pl-4 pr-3 text-muted-foreground italic">
              {children}
            </blockquote>
          ),

          hr: () => <hr className="my-6 border-border" />,

          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = Boolean(match);
            const text = String(children).replace(/\n$/, "");

            if (isBlock) {
              return <CodeBlock language={match?.[1]}>{text}</CodeBlock>;
            }

            return (
              <code
                className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
                {...props}
              >
                {children}
              </code>
            );
          },

          pre: ({ children }) => <>{children}</>,

          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),

          th: ({ children }) => (
            <th className="border-b border-border bg-muted/50 px-3 py-2 font-semibold">
              {children}
            </th>
          ),

          td: ({ children }) => <td className="border-b border-border/70 px-3 py-2">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function GroqChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior,
        block: "end",
      });
    });
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isLoading, scrollToBottom]);

  function resizeTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setInput(event.target.value);
    resizeTextarea(event.currentTarget);
  }

  async function sendMessage(value?: string) {
    const message = (value ?? input).trim();

    if (!message || isLoading) {
      return;
    }

    // ======================================================
    // 1. CREATE USER MESSAGE
    // ======================================================

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: message,
    };

    // ======================================================
    // 2. BUILD FULL CONVERSATION
    // ======================================================

    const nextMessages = [...messages, userMessage];

    // ======================================================
    // 3. SHOW USER MESSAGE IMMEDIATELY
    // ======================================================

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    scrollToBottom("smooth");

    try {
      // ====================================================
      // 4. SEND FULL CONVERSATION TO SERVER
      // ====================================================

      const conversation: AgentMessage[] = nextMessages.map((item) => ({
        role: item.role,
        content: item.content,
      }));

      const result: AgentActionResult = await agentAction(conversation);

      // ====================================================
      // 5. HANDLE FAILURE
      // ====================================================

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // ====================================================
      // 6. VALIDATE RESPONSE
      // ====================================================

      if (looksLikeHtml(result.response)) {
        toast.error("The agent returned an invalid response.");
        return;
      }

      // ====================================================
      // 7. ADD ASSISTANT RESPONSE
      // ====================================================

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: result.response,
        },
      ]);
    } catch (error) {
      console.error("[GroqChat] Failed to send message:", error);

      toast.error("Something went wrong while talking to the agent.");
    } finally {
      setIsLoading(false);

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void sendMessage();
  }

  function handleSuggestion(prompt: string) {
    if (isLoading) {
      return;
    }

    void sendMessage(prompt);
  }

  function handleNewChat() {
    setMessages([]);
    setInput("");
    setIsLoading(false);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[600px] flex-col overflow-hidden bg-background">
      {/* Header */}

      <header className="shrink-0 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border bg-gradient-to-br from-primary/15 to-muted shadow-sm">
              <Sparkles className="size-4 text-primary" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight">INSIDER Agent</h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>

              <p className="mt-0.5 text-xs text-muted-foreground">Your AI workspace for INSIDER</p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" />
              New chat
            </button>
          )}
        </div>
      </header>

      {/* Messages */}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[calc(100vh-18rem)] items-center justify-center">
              <div className="w-full max-w-2xl">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border bg-gradient-to-br from-primary/15 to-muted shadow-sm">
                    <Sparkles className="size-6 text-primary" />
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    What are we building?
                  </h2>

                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                    Ask the INSIDER Agent to manage content, improve the app, and perform
                    administrative actions.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => handleSuggestion(suggestion.prompt)}
                      disabled={isLoading}
                      className="group rounded-2xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
                    >
                      <p className="text-sm font-medium">{suggestion.title}</p>

                      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {suggestion.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-7">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div key={message.id} className="group/message space-y-2">
                    <div className={isUser ? "flex justify-end gap-3" : "flex items-start gap-3"}>
                      {!isUser && (
                        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br from-primary/15 to-muted">
                          <AgentIcon />
                        </div>
                      )}

                      <div
                        className={
                          isUser
                            ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-sm"
                            : "min-w-0 max-w-[92%] rounded-2xl rounded-tl-md border bg-card px-4 py-4 shadow-sm"
                        }
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        ) : (
                          <AssistantMarkdown content={message.content} />
                        )}
                      </div>

                      {isUser && (
                        <div className="mt-1 hidden size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50 sm:flex">
                          <UserIcon />
                        </div>
                      )}
                    </div>

                    <div
                      className={
                        isUser
                          ? "flex justify-end pr-11 opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100"
                          : "flex justify-start pl-11 opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100"
                      }
                    >
                      <CopyButton
                        text={message.content}
                        label={isUser ? "Question copied" : "Response copied"}
                      />
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br from-primary/15 to-muted">
                    <AgentIcon />
                  </div>

                  <div className="rounded-2xl rounded-tl-md border bg-card px-4 py-3 shadow-sm">
                    <ThinkingIndicator />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Composer */}

      <div className="shrink-0 border-t bg-background/90 px-4 pb-4 pt-3 backdrop-blur-xl sm:px-6">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/5">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder="Ask the INSIDER Agent..."
              aria-label="Message the INSIDER Agent"
              className="block max-h-[180px] min-h-12 w-full resize-none bg-transparent px-4 py-3.5 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="flex items-center justify-between gap-3 px-3 pb-2.5">
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Enter to send · Shift + Enter for a new line
              </p>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="ml-auto flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
              >
                {isLoading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </div>
          </div>

          <p className="mt-2.5 text-center text-[10px] text-muted-foreground">
            INSIDER Agent can make mistakes. Review generated actions before applying them.
          </p>
        </form>
      </div>
    </div>
  );
}
