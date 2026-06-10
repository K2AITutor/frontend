"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/dashboard/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/dashboard/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/dashboard/ui/command";

export interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled,
  allowClear = true,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <span className="ml-2 flex shrink-0 items-center gap-1">
            {allowClear && value ? (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange("");
                }}
              />
            ) : null}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
