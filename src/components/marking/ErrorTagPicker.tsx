"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/dashboard/ui/input";
import { Button } from "@/components/dashboard/ui/button";
import type { ErrorTag } from "@/lib/types/marking";

interface ErrorTagPickerProps {
  available: ErrorTag[];
  value: string[];
  readOnly?: boolean;
  onChange?: (tags: string[]) => void;
  allowCustom?: boolean;
}

export function ErrorTagPicker({
  available,
  value,
  readOnly = false,
  onChange,
  allowCustom = false,
}: ErrorTagPickerProps) {
  const [customInput, setCustomInput] = useState("");

  const toggle = (tagCode: string) => {
    if (readOnly || !onChange) return;
    const next = value.includes(tagCode)
      ? value.filter((t) => t !== tagCode)
      : [...value, tagCode];
    onChange(next);
  };

  const addCustom = () => {
    const code = customInput.trim();
    if (!code || value.includes(code) || !onChange) return;
    onChange([...value, code]);
    setCustomInput("");
  };

  // Merge available + any custom tags already selected
  const allTags = [
    ...available,
    ...value
      .filter((code) => !available.find((t) => t.tagCode === code))
      .map((code) => ({ tagCode: code, label: code, confidence: 1 })),
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => {
          const selected = value.includes(tag.tagCode);
          return (
            <button
              key={tag.tagCode}
              type="button"
              disabled={readOnly}
              onClick={() => toggle(tag.tagCode)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted",
                readOnly && "cursor-default"
              )}
            >
              {tag.label}
              {tag.confidence < 1 && (
                <span className="opacity-60 text-[10px]">
                  {Math.round(tag.confidence * 100)}%
                </span>
              )}
              {selected && !readOnly && <X className="h-2.5 w-2.5" />}
            </button>
          );
        })}
        {allTags.length === 0 && readOnly && (
          <span className="text-xs text-muted-foreground">No error tags</span>
        )}
      </div>

      {allowCustom && !readOnly && (
        <div className="flex gap-2">
          <Input
            placeholder="Add custom tag…"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            className="h-7 text-xs"
          />
          <Button type="button" size="sm" variant="outline" onClick={addCustom} className="h-7 px-2">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
