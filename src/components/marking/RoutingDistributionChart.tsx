import React from "react";

const ROUTE_COLORS: Record<string, string> = {
  rule: "bg-blue-500",
  llm: "bg-violet-500",
  ml: "bg-green-500",
  human: "bg-amber-500",
};

interface RouteItem {
  route: string;
  pct: number;
}

interface Props {
  data: RouteItem[];
}

export function RoutingDistributionChart({ data }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex h-6 w-full overflow-hidden rounded-full gap-0.5">
        {data.map((item) => (
          <div
            key={item.route}
            className={`${ROUTE_COLORS[item.route] ?? "bg-gray-400"} flex items-center justify-center text-white text-xs font-medium transition-all`}
            style={{ width: `${item.pct}%` }}
            title={`${item.route}: ${item.pct}%`}
          >
            {item.pct >= 10 && `${item.pct}%`}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {data.map((item) => (
          <div key={item.route} className="flex items-center gap-1.5 text-sm">
            <div
              className={`h-3 w-3 rounded-sm ${ROUTE_COLORS[item.route] ?? "bg-gray-400"}`}
            />
            <span className="capitalize text-muted-foreground">{item.route}</span>
            <span className="font-medium">{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
