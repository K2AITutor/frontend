"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/dashboard/ui/chart";
import { cn } from "@/lib/utils";

export function ParentTrendChart({
  data,
  dataKey,
  label,
  color,
  unit = "",
  domain,
  className,
}: {
  data: number[];
  dataKey: string;
  label: string;
  color: string;
  unit?: string;
  domain?: [number, number];
  className?: string;
}) {
  const gradientId = React.useId().replace(/:/g, "");
  const chartData = data.map((v, i) => ({ day: i + 1, [dataKey]: v }));
  const config: ChartConfig = { [dataKey]: { label, color } };

  if (data.length === 0) {
    return (
      <div className="flex h-[160px] items-center justify-center rounded border border-dashed text-xs text-muted-foreground">
        No data
      </div>
    );
  }

  return (
    <ChartContainer config={config} className={cn("aspect-auto h-[180px] w-full", className)}>
      <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={`var(--color-${dataKey})`} stopOpacity={0.4} />
            <stop offset="95%" stopColor={`var(--color-${dataKey})`} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(d) => `D${d}`}
        />
        <YAxis
          domain={domain}
          tickLine={false}
          axisLine={false}
          width={34}
          tickMargin={4}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              unit={unit}
              labelFormatter={(l) => `Day ${l}`}
              hideIndicator
            />
          }
        />
        <Area
          dataKey={dataKey}
          type="monotone"
          stroke={`var(--color-${dataKey})`}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
