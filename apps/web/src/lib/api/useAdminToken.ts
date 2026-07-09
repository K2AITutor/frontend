"use client";

import { useSession } from "next-auth/react";

export function useAdminToken(): string | undefined {
  const { data: session } = useSession();
  return (session?.user as any)?.accessToken;
}
