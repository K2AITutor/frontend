import React from "react";

const ROUTE_COLORS: Record<string, string> = {
  rule: "bg-blue-500",
  llm: "bg-violet-500",
  ml: "bg-green-500",
  human: "bg-amber-500",
};

const INLINE_LABEL_THRESHOLD = 10;

interface RouteItem {
  route: string;
  pct: number;
}

interface Props {
  data: RouteItem[];
}

export function RoutingDistributionChart({ data }: Props) {
  let cumulative = 0;
  const segments = data.map((item) => {
    const left = cumulative;
    cumulative += item.pct;
    return { ...item, center: left + item.pct / 2 };
  });

  const smallSegments = segments.filter(
    (s) => s.pct > 0 && s.pct < INLINE_LABEL_THRESHOLD
  );

  return (
    <div className="space-y-3">
      <div className="relative pt-7">
        {smallSegments.map((s) => (
          <div
            key={s.route}
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${s.center}%` }}
          >
            <span className="whitespace-nowrap text-xs font-medium text-foreground">
              {s.pct}%
            </span>
            <div className="h-2 w-px bg-muted-foreground/50" />
          </div>
        ))}
        <div className="flex h-6 w-full overflow-hidden rounded-full gap-0.5">
          {data.map((item) => (
            <div
              key={item.route}
              className={`${ROUTE_COLORS[item.route] ?? "bg-gray-400"} flex items-center justify-center text-white text-xs font-medium transition-all`}
              style={{ width: `${item.pct}%` }}
              title={`${item.route}: ${item.pct}%`}
            >
              {item.pct >= INLINE_LABEL_THRESHOLD && `${item.pct}%`}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {data.map((item) => (
          <div key={item.route} className="flex items-center gap-1.5 text-sm">
            <div
              className={`h-3 w-3 rounded-sm ${ROUTE_COLORS[item.route] ?? "bg-gray-400"}`}
            />
            <span className="uppercase text-muted-foreground">{item.route}</span>
            <span className="font-medium">{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
