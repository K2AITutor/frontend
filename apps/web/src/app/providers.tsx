"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ProgressProvider } from "@bprogress/next/app";

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
  );
}
