"use client";

import {
  CommentWithUser,
  createCommentAction,
  deleteCommentAction,
  getCommentsByBlogIdAction,
} from "@/app/actions/(comment)/comment-action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

type Props = {
  blogId: string;
  blogSlug: string;
};

type ReplyTo = {
  id: string;
  name: string;
};

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (seconds < 2592000) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  if (seconds < 31536000) {
    const months = Math.floor(seconds / 2592000);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  const years = Math.floor(seconds / 31536000);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function BlogComments({ blogId }: Props) {
  const { isSignedIn, isLoaded, userId } = useAuth();

  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sortOrder, setSortOrder] = useState<"oldest" | "newest">("oldest");
  const [isExpanded, setIsExpanded] = useState(false);
  const [openShareId, setOpenShareId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchComments() {
      try {
        const result = await getCommentsByBlogIdAction(blogId);
        if (!cancelled && result.success) {
          setComments(result.data);
        }
      } catch (err) {
        console.error("Failed to load comments", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchComments();

    return () => {
      cancelled = true;
    };
  }, [blogId]);

  useEffect(() => {
    if (!openShareId) return;

    const handleClickOutside = () => setOpenShareId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openShareId]);

  const sortedComments = [...comments].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return sortOrder === "oldest" ? aTime - bTime : bTime - aTime;
  });

  const handleSubmit = (e: React.FormEvent, isReply = false) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    startTransition(async () => {
      const result = await createCommentAction({
        blogId,
        content: content.trim(),
        parentId: isReply && replyTo ? replyTo.id : null,
      });

      if (result.success) {
        setContent("");
        setReplyTo(null);
        setIsExpanded(false);
        toast.success(isReply ? "Reply posted!" : "Comment posted!");

        const refresh = await getCommentsByBlogIdAction(blogId);
        if (refresh.success) {
          setComments(refresh.data);
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (commentId: string) => {
    setDeletingId(commentId);

    startTransition(async () => {
      const result = await deleteCommentAction(commentId);

      if (result.success) {
        toast.success("Comment deleted.");
        const refresh = await getCommentsByBlogIdAction(blogId);
        if (refresh.success) {
          setComments(refresh.data);
        }
      } else {
        toast.error(result.error);
      }

      setDeletingId(null);
    });
  };

  const getDisplayName = (commentUser: CommentWithUser["user"]) => {
    if (commentUser.firstName || commentUser.lastName) {
      return `${commentUser.firstName ?? ""} ${commentUser.lastName ?? ""}`.trim();
    }
    return commentUser.email.split("@")[0];
  };

  const getInitials = (commentUser: CommentWithUser["user"]) => {
    const name = getDisplayName(commentUser);
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const totalComments =
    comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <section className="not-prose mt-16 border-t border-border pt-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Conversation</h2>
          <span className="text-sm text-muted-foreground">
            {totalComments} {totalComments === 1 ? "Comment" : "Comments"}
          </span>
        </div>
      </div>

      <p className="mb-6 text-sm leading-6 text-muted-foreground">
        Have fun. Be respectful. Feel free to criticize ideas, but not people.
      </p>

      {/* Main Comment Form */}
      <div className="mb-8">
        {!isLoaded ? (
          <div className="h-12 animate-pulse rounded-lg border border-border bg-muted/40" />
        ) : isSignedIn ? (
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-3">
            <div
              className={cn(
                "relative overflow-hidden rounded-lg border border-border bg-background transition-all duration-200",
                isExpanded ? "shadow-sm" : "hover:border-muted-foreground/40",
              )}
              onMouseEnter={() => setIsExpanded(true)}
              onFocus={() => setIsExpanded(true)}
            >
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                onBlur={() => {
                  if (!content.trim()) setIsExpanded(false);
                }}
                placeholder="What do you think?"
                rows={isExpanded ? 4 : 1}
                disabled={isPending}
                className={cn(
                  "resize-none border-0 bg-transparent text-[15px] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
                  isExpanded ? "min-h-[100px] pb-12" : "min-h-[48px] py-3",
                )}
              />

              {isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-border bg-background px-3 py-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm font-medium">Aa</span>
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                      <path
                        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase">
                      GIF
                    </span>
                  </div>

                  <Button type="submit" disabled={isPending || !content.trim()} size="sm">
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="h-3.5 w-3.5" />
                        Posting...
                      </span>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-muted-foreground">
              What do you think?
            </div>
            <div className="flex justify-end">
              <SignInButton mode="modal">
                <Button>Sign up to post</Button>
              </SignInButton>
            </div>
          </div>
        )}
      </div>

      {/* Sort */}
      {comments.length > 0 && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === "oldest" ? "newest" : "oldest"))}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Sort by {sortOrder === "oldest" ? "Oldest" : "Newest"}
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-border bg-muted/30"
            />
          ))}
        </div>
      ) : sortedComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-muted-foreground">
              <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-base font-medium text-foreground">
            No one seems to have shared their thoughts on this topic yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Leave a comment so your voice will be heard first.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={userId}
              isSignedIn={isSignedIn}
              isLoaded={isLoaded}
              replyTo={replyTo}
              content={content}
              isPending={isPending}
              deletingId={deletingId}
              openShareId={openShareId}
              currentUrl={currentUrl}
              onReply={(id, name) => {
                setReplyTo({ id, name });
                setContent("");
                setTimeout(() => replyTextareaRef.current?.focus(), 50);
              }}
              onCancelReply={() => {
                setReplyTo(null);
                setContent("");
              }}
              onContentChange={setContent}
              onSubmit={(e) => handleSubmit(e, true)}
              onToggleShare={(id) => setOpenShareId((prev) => (prev === id ? null : id))}
              onDelete={handleDelete}
              getDisplayName={getDisplayName}
              getInitials={getInitials}
              replyTextareaRef={replyTextareaRef}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   SINGLE COMMENT
   ========================================================= */

type CommentItemProps = {
  comment: CommentWithUser;
  currentUserId: string | null | undefined;
  isSignedIn: boolean | undefined;
  isLoaded: boolean;
  replyTo: ReplyTo | null;
  content: string;
  isPending: boolean;
  deletingId: string | null;
  openShareId: string | null;
  currentUrl: string;
  onReply: (id: string, name: string) => void;
  onCancelReply: () => void;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleShare: (id: string) => void;
  onDelete: (commentId: string) => void;
  getDisplayName: (user: CommentWithUser["user"]) => string;
  getInitials: (user: CommentWithUser["user"]) => string;
  replyTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
};

function CommentItem({
  comment,
  currentUserId,
  isSignedIn,
  isLoaded,
  replyTo,
  content,
  isPending,
  deletingId,
  openShareId,
  currentUrl,
  onReply,
  onCancelReply,
  onContentChange,
  onSubmit,
  onToggleShare,
  onDelete,
  getDisplayName,
  getInitials,
  replyTextareaRef,
}: CommentItemProps) {
  const isReplyingToThis = replyTo?.id === comment.id;
  const displayName = getDisplayName(comment.user);
  const isShareOpen = openShareId === comment.id;
  const isOwner = currentUserId === comment.user.clerkId;
  const isDeleting = deletingId === comment.id;

  const shareOptions = [
    {
      name: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#1877F2]">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
          "_blank",
        );
      },
    },
    {
      name: "X",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`,
          "_blank",
        );
      },
    },
    {
      name: "Pinterest",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#E60023]">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
        </svg>
      ),
      action: () => {
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}`,
          "_blank",
        );
      },
    },
    {
      name: "Email",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-foreground">
          <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="m22 6-10 7L2 6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      action: () => {
        window.location.href = `mailto:?subject=Check this out&body=${encodeURIComponent(currentUrl)}`;
      },
    },
    {
      name: "Copy Link",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-foreground">
          <path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      action: async () => {
        try {
          await navigator.clipboard.writeText(currentUrl);
          toast.success("Link copied!");
        } catch {
          toast.error("Failed to copy link");
        }
      },
    },
  ];

  return (
    <article className="py-6 first:pt-0">
      <div className="flex gap-3">
        <Avatar className="mt-0.5 h-10 w-10 shrink-0">
          <AvatarImage src={comment.user.imageUrl ?? undefined} alt={displayName} />
          <AvatarFallback>{getInitials(comment.user)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-semibold text-foreground">{displayName}</span>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </div>
            </div>

            {/* Delete button – spinner shows here while deleting */}
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    disabled={isDeleting}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
                    aria-label="Delete comment"
                  >
                    {isDeleting ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                        <path
                          d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your comment.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(comment.id)}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <span className="flex items-center gap-2">
                          <Spinner className="h-3.5 w-3.5" />
                          Deleting...
                        </span>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-3 text-sm">
            {!isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => onReply(comment.id, displayName)}
                  className="font-medium text-primary hover:underline"
                >
                  Reply
                </button>
                <span className="text-muted-foreground">·</span>
              </>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleShare(comment.id);
                }}
                className="font-medium text-primary hover:underline"
              >
                Share
              </button>

              {isShareOpen && (
                <div
                  className="absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    {shareOptions.map((option) => (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => {
                          option.action();
                          onToggleShare(comment.id);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        {option.icon}
                        <span>{option.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inline Reply Box */}
          {isReplyingToThis && (
            <div className="mt-4 space-y-3">
              {isLoaded && isSignedIn ? (
                <form onSubmit={onSubmit} className="space-y-3">
                  <div className="relative overflow-hidden rounded-lg border border-border bg-background">
                    <Textarea
                      ref={replyTextareaRef}
                      value={content}
                      onChange={(e) => onContentChange(e.target.value)}
                      placeholder={`Reply to ${displayName}...`}
                      rows={3}
                      disabled={isPending}
                      className="min-h-[80px] resize-none border-0 bg-transparent pb-12 text-[15px] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                    />

                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-border bg-background px-3 py-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm font-medium">Aa</span>
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                          <path
                            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase">
                          GIF
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onCancelReply}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <Button type="submit" disabled={isPending || !content.trim()} size="sm">
                          {isPending ? (
                            <span className="flex items-center gap-2">
                              <Spinner className="h-3.5 w-3.5" />
                              Posting...
                            </span>
                          ) : (
                            "Post Reply"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-muted-foreground">
                    Reply to {displayName}...
                  </div>
                  <div className="flex justify-end">
                    <SignInButton mode="modal">
                      <Button>Sign up to post</Button>
                    </SignInButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-6 space-y-6 border-l-2 border-border pl-5">
              {comment.replies.map((reply) => {
                const isReplyOwner = currentUserId === reply.user.clerkId;
                const isReplyDeleting = deletingId === reply.id;

                return (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="mt-0.5 h-8 w-8 shrink-0">
                      <AvatarImage
                        src={reply.user.imageUrl ?? undefined}
                        alt={getDisplayName(reply.user)}
                      />
                      <AvatarFallback className="text-xs">{getInitials(reply.user)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold text-foreground">
                            {getDisplayName(reply.user)}
                          </span>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {formatRelativeTime(reply.createdAt)}
                          </div>
                        </div>

                        {isReplyOwner && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                disabled={isReplyDeleting}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-50"
                                aria-label="Delete reply"
                              >
                                {isReplyDeleting ? (
                                  <Spinner className="h-3.5 w-3.5" />
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                                    <path
                                      d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete reply?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isReplyDeleting}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(reply.id)}
                                  disabled={isReplyDeleting}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {isReplyDeleting ? (
                                    <span className="flex items-center gap-2">
                                      <Spinner className="h-3.5 w-3.5" />
                                      Deleting...
                                    </span>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>

                      <div className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                        {reply.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
