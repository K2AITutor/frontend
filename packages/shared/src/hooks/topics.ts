import { useQuery } from "@tanstack/react-query";
import { PATH } from "../constants/api";
import type { TopicCatalogueResponse, TopicProgressRow } from "../types/topic";
import { useFetcher } from "./FetcherContext";

export function useTopicCatalogue(subjectCode?: string) {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["topics", "catalogue", subjectCode],
    enabled: Boolean(subjectCode),
    queryFn: ({ signal }) =>
      fetcher.get<TopicCatalogueResponse>(
        `${PATH.topics.catalogue}?subject=${encodeURIComponent(subjectCode!)}`,
        { signal }
      ),
  });
}

export function useTopicProgress(subjectCode?: string) {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["analytics", "topicProgress", subjectCode],
    enabled: Boolean(subjectCode),
    queryFn: ({ signal }) =>
      fetcher.get<TopicProgressRow[]>(
        `${PATH.analytics.topicProgress}?subject=${encodeURIComponent(subjectCode!)}`,
        { signal }
      ),
  });
}
