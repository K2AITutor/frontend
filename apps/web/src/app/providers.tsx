"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ProgressProvider } from "@bprogress/next/app";
import { FetcherProvider } from "@aitutor/shared";
import { webFetcher } from "@/lib/apiClient";
import { SessionGuard } from "@/components/auth/SessionGuard";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

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

  useEffect(() => {
    // Initialize PostHog
    if (typeof window !== "undefined") {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
      });
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <FetcherProvider fetcher={webFetcher}>
        <QueryClientProvider client={queryClient}>
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
      </FetcherProvider>
    </PHProvider>
  );
}
