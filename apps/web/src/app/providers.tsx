"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ProgressProvider } from "@bprogress/next/app";
import { FetcherProvider } from "@aitutor/shared";
import { webFetcher } from "@/lib/apiClient";

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
    <FetcherProvider fetcher={webFetcher}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
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
    </FetcherProvider>
  );
}
