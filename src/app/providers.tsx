"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ProgressProvider } from "@bprogress/next/app";
import { SessionGuard } from "@/components/auth/SessionGuard";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Polling disabled (refetchInterval=0): the access token is refreshed
          on-demand when the session is read (every apiClient call) and when the
          tab regains focus — no background timer. */}
      <SessionProvider refetchInterval={0} refetchOnWindowFocus>
        <SessionGuard />
        <ProgressProvider
          height="3px"
          color="#14b8a6"
          options={{ showSpinner: false }}
          shallowRouting
        >
          {children}
        </ProgressProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
