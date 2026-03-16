/*Purpose/content: fetch grouped topics from backend instead of hardcoded frontend constants.*/
import { apiGet } from '@/lib/apiClient';
import { TopicCatalogueResponse } from '@/types/topic';

export async function fetchTopicCatalogue(
    subjectCode: string
): Promise<TopicCatalogueResponse> {
    return apiGet<TopicCatalogueResponse>(
        `/topic?subject=${encodeURIComponent(subjectCode)}`
    );
}