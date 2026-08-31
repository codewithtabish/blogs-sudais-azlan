import { BlogType } from "@/generated/prisma/enums";
import {
  BarChart3,
  BookOpen,
  FileText,
  MessageSquare,
  Mic,
  Newspaper,
  Star,
  type LucideIcon,
} from "lucide-react";

type CategoryTagProps = {
  type: BlogType;
  label: string;
  className?: string;
};

const TYPE_ICON: Record<BlogType, LucideIcon> = {
  ARTICLE: FileText,
  NEWS: Newspaper,
  OPINION: MessageSquare,
  ANALYSIS: BarChart3,
  GUIDE: BookOpen,
  REVIEW: Star,
  INTERVIEW: Mic,
};

export function CategoryTag({ type, label, className }: CategoryTagProps) {
  const Icon = TYPE_ICON[type] ?? FileText;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary ${className ?? ""}`}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
