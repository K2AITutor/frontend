"use client"

import * as React from "react"
import { format, parse, startOfMonth, startOfYear, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/dashboard/ui/button"
import { Calendar } from "@/components/dashboard/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/dashboard/ui/popover"

const VALUE_FORMAT = "yyyy-MM-dd"

function toDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, VALUE_FORMAT, new Date())
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function toValue(date: Date | undefined): string {
  return date ? format(date, VALUE_FORMAT) : ""
}

interface Preset {
  label: string
  getRange: () => DateRange
}

const PRESETS: Preset[] = [
  { label: "Today", getRange: () => ({ from: new Date(), to: new Date() }) },
  {
    label: "Last 7 days",
    getRange: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    label: "Last 30 days",
    getRange: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    label: "This month",
    getRange: () => ({ from: startOfMonth(new Date()), to: new Date() }),
  },
  {
    label: "This year",
    getRange: () => ({ from: startOfYear(new Date()), to: new Date() }),
  },
]

export interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
  className?: string
  placeholder?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className,
  placeholder = "All time",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selected = React.useMemo<DateRange | undefined>(() => {
    const from = toDate(startDate)
    const to = toDate(endDate)
    if (!from && !to) return undefined
    return { from, to }
  }, [startDate, endDate])

  const label = React.useMemo(() => {
    const from = toDate(startDate)
    const to = toDate(endDate)
    if (from && to) {
      return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`
    }
    if (from) return `From ${format(from, "MMM d, yyyy")}`
    if (to) return `Until ${format(to, "MMM d, yyyy")}`
    return placeholder
  }, [startDate, endDate, placeholder])

  const hasValue = Boolean(startDate || endDate)

  const handleSelect = (range: DateRange | undefined) => {
    onChange(toValue(range?.from), toValue(range?.to))
    if (range?.from && range?.to) setOpen(false)
  }

  const applyPreset = (preset: Preset) => {
    const range = preset.getRange()
    onChange(toValue(range.from), toValue(range.to))
    setOpen(false)
  }

  const clear = (event?: React.MouseEvent) => {
    event?.stopPropagation()
    onChange("", "")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 w-full justify-start gap-2 bg-muted/50 px-3 font-normal",
            !hasValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{label}</span>
          {hasValue && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear date range"
              onClick={clear}
              className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-auto flex-col p-0 sm:flex-row"
        align="end"
      >
        <div className="flex flex-row gap-1 border-b p-2 sm:flex-col sm:border-b-0 sm:border-r">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              size="sm"
              className="justify-start whitespace-nowrap font-normal"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="justify-start whitespace-nowrap font-normal text-muted-foreground"
            onClick={() => clear()}
          >
            Clear
          </Button>
        </div>
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={selected?.from}
          selected={selected}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
