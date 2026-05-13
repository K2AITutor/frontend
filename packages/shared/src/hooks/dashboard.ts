import { useQuery } from "@tanstack/react-query";
import { PATH } from "../constants/api";
import type { StudentDashboardData } from "../types/dashboard";
import { useFetcher } from "./FetcherContext";

export function useStudentDashboardData() {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["studentDashboardData"],
    queryFn: ({ signal }) => fetcher.get<StudentDashboardData>(PATH.dashboard.student, { signal }),
  });
}
