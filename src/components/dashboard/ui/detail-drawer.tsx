"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/dashboard/ui/sheet";
import { cn } from "@/lib/utils";

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional pinned footer, typically for action buttons. */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Width preset for the sheet. Defaults to "xl" (sm:max-w-xl). */
  size?: "xl" | "2xl";
  /** Extra classes for the scrollable body. */
  bodyClassName?: string;
}

const SIZE_CLASS: Record<NonNullable<DetailDrawerProps["size"]>, string> = {
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
};

/**
 * Standard right-side drawer for viewing a single record (see docs/CODING_STANDARDS.md, Rule 1).
 * Pinned header + scrollable body + optional pinned footer. Reuse this instead of assembling
 * Sheet/SheetContent by hand so every detail drawer in the app looks and behaves identically.
 */
export function DetailDrawer({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  size = "xl",
  bodyClassName,
}: DetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className={cn(SIZE_CLASS[size], "w-full flex flex-col p-0")}
      >
        <SheetHeader className="px-6 pt-6 pb-4 pr-12 border-b shrink-0">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className={cn("overflow-y-auto flex-1 px-6 py-5 space-y-5", bodyClassName)}>
          {children}
        </div>

        {footer && (
          <div className="border-t shrink-0 px-6 py-4 flex flex-wrap justify-end gap-3">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
