import PracticeClient from "../../[subject]/PracticeClient";
import {
    fetchPracticeQuestions,
    fetchTopicCounts,
    fetchTopicProgress,
} from "@/lib/apiClient";
import { fetchTopicCatalogue } from "@/lib/api/topics";

const SUBJECT_CODE = "MATH_METHODS";
const INITIAL_TOPIC_CODE = "MM_CALC_DIFF_RULES";
const DEMO_USER_ID = 1;

export default async function StudentMathMethodsTopicPracticePage() {
    const [catalogue, counts, progress, questions] = await Promise.all([
        fetchTopicCatalogue(SUBJECT_CODE).catch(() => ({ subjectCode: SUBJECT_CODE, groups: [] })),
        fetchTopicCounts(SUBJECT_CODE).catch(() => ({ subject: SUBJECT_CODE, counts: {} })),
        fetchTopicProgress(SUBJECT_CODE, DEMO_USER_ID).catch(() => []),
        fetchPracticeQuestions(SUBJECT_CODE, INITIAL_TOPIC_CODE).catch(() => []),
    ]);

    return (
        <PracticeClient
            initialQuestions={questions}
            subject={SUBJECT_CODE}
            currentUserId={DEMO_USER_ID}
            initialTopicCode={INITIAL_TOPIC_CODE}
            topicCounts={counts.counts ?? {}}
            topicGroups={catalogue.groups ?? []}
            initialTopicProgress={progress}
        />
    );
}
