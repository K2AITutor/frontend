import { useQuery } from "@tanstack/react-query";
import { PATH } from "../constants/api";
import type { Subject } from "../types/subject";
import { useFetcher } from "./FetcherContext";

export function useSubjects() {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["subjects"],
    queryFn: ({ signal }) => fetcher.get<Subject[]>(PATH.subjects.list, { signal }),
  });
}
