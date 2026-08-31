"use client";

import { agentAction, AgentActionResult } from "@/app/actions/groq/agent-action";
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
import { toast } from "sonner";

type MessageRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
};

const SUGGESTIONS = [
  {
    title: "Change the theme",
    prompt: "Change the INSIDER theme to the Claude theme.",
  },
  {
    title: "Create a category",
    prompt: "Create a new AI category called Artificial Intelligence.",
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

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 14-7-4 14-3-6-7-1Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" className="opacity-25" stroke="currentColor" strokeWidth="2" />

      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span>Thinking</span>

      <span className="flex items-center gap-1">
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-current" />
      </span>
    </div>
  );
}

export function GroqChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isLoading, scrollToBottom]);

  function resizeTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";

    const maxHeight = 180;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
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

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);

    setInput("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    requestAnimationFrame(() => {
      scrollToBottom("smooth");
    });

    try {
      const result: AgentActionResult = await agentAction(message);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: result.response,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error("[GroqChat] Failed to send message:", error);

      toast.error("Something went wrong while talking to the agent.");
    } finally {
      setIsLoading(false);
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

    setInput(prompt);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();

      if (textareaRef.current) {
        resizeTextarea(textareaRef.current);
      }
    });
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[600px] flex-col overflow-hidden ">
      {/* Header */}
      <header className="shrink-0 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border bg-muted/40">
              <AgentIcon />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight">INSIDER Agent</h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  AI
                </span>
              </div>

              <p className="mt-0.5 text-xs text-muted-foreground">Your AI workspace for INSIDER</p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setInput("");

                requestAnimationFrame(() => {
                  textareaRef.current?.focus();
                });
              }}
              disabled={isLoading}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              New chat
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[calc(100vh-18rem)] items-center justify-center">
              <div className="w-full max-w-2xl">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border bg-muted/40 shadow-sm">
                    <AgentIcon />
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    What are we building?
                  </h2>

                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                    Ask the INSIDER Agent to help you manage content, improve the application, and
                    eventually make changes directly to the project.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => handleSuggestion(suggestion.prompt)}
                      disabled={isLoading}
                      className="group rounded-xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
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
            <div className="space-y-8">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={isUser ? "flex justify-end" : "flex items-start gap-3"}
                  >
                    {!isUser && (
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                        <AgentIcon />
                      </div>
                    )}

                    <div
                      className={
                        isUser
                          ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground"
                          : "min-w-0 max-w-[90%] rounded-2xl rounded-tl-md border bg-card px-4 py-3 shadow-sm"
                      }
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none wrap-break-word dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-7 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:bg-muted/50 prose-code:before:content-none prose-code:after:content-none">
                          <ReactMarkdown
                            components={{
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium underline underline-offset-4"
                                >
                                  {children}
                                </a>
                              ),

                              code: ({ className, children }) => (
                                <code className={className}>{children}</code>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="mt-0.5 hidden size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40 sm:flex">
                        <UserIcon />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                    <AgentIcon />
                  </div>

                  <div className="rounded-2xl rounded-tl-md border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
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
      <div className="shrink-0 border-t bg-background/95 px-4 pb-4 pt-3 backdrop-blur sm:px-6">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/5">
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

            <div className="flex items-center justify-between px-3 pb-2">
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Enter to send · Shift + Enter for a new line
              </p>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="ml-auto flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
              >
                {isLoading ? <SpinnerIcon /> : <SendIcon />}
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
