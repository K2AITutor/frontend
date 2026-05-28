import { cn } from "@/lib/utils";
import type { MarkingSource } from "@/lib/types/marking";

const SOURCE_CONFIG: Record<MarkingSource, { label: string; className: string }> = {
  rule: { label: "Rule-based", className: "bg-blue-100 text-blue-700 border-blue-200" },
  llm: { label: "LLM", className: "bg-purple-100 text-purple-700 border-purple-200" },
  ml: { label: "ML Model", className: "bg-green-100 text-green-700 border-green-200" },
  human: { label: "Human", className: "bg-orange-100 text-orange-700 border-orange-200" },
};

interface HybridMarkingBadgeProps {
  source: MarkingSource;
  size?: "sm" | "md";
  className?: string;
}

export function HybridMarkingBadge({ source, size = "md", className }: HybridMarkingBadgeProps) {
  const cfg = SOURCE_CONFIG[source];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-semibold",
        cfg.className,
        size === "sm" ? "px-1.5 py-0 text-[10px]" : "px-2.5 py-0.5 text-xs",
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
