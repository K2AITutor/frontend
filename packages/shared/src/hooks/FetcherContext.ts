"use client";

import React, { createContext, useContext } from "react";
import type { Fetcher } from "../lib/fetcher";

const FetcherContext = createContext<Fetcher | null>(null);

export function FetcherProvider({
  fetcher,
  children,
}: {
  fetcher: Fetcher;
  children: React.ReactNode;
}) {
  return React.createElement(FetcherContext.Provider, { value: fetcher }, children);
}

export function useFetcher() {
  const fetcher = useContext(FetcherContext);
  if (!fetcher) {
    throw new Error("useFetcher must be used within FetcherProvider");
  }
  return fetcher;
}
