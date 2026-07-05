import { useQuery } from "@tanstack/react-query";
import { PATH } from "../constants/api";
import type { LoginResponse } from "../types/auth";
import { useFetcher } from "./FetcherContext";

export interface AuthMeResponse extends Partial<LoginResponse> {
  id?: number | string;
  userId?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  profile?: unknown;
}

export function useUserProfile() {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: ({ signal }) => fetcher.get<AuthMeResponse>(PATH.auth.me, { signal }),
  });
}
