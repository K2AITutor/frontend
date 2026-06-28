import PracticeClient from "./PracticeClient";
import { fetchPracticeQuestions } from "@/lib/apiClient";
import { PracticeQuestion } from "@/types/question";

type Props = {
    params: {
        subject: string;
    };
};

const SUBJECT_MAP: Record<string, string> = {
    "math-methods": "MATH_METHODS",
    english: "ENGLISH",
    "specialist-maths": "SPECIALIST_MATHS",
    chemistry: "CHEMISTRY",
    physics: "PHYSICS",
    biology: "BIOLOGY",
    "general-maths": "GENERAL_MATHS",
    "business-management": "BUSINESS_MANAGEMENT",
    accounting: "ACCOUNTING",
    economics: "ECONOMICS",
    psychology: "PSYCHOLOGY",
    algorithmics: "ALGORITHMICS",
    computing: "COMPUTING",
};

const DEFAULT_TOPIC_BY_SUBJECT: Record<string, string> = {
    MATH_METHODS: "MM_T1",
};

export default async function SubjectPracticePage({
    params,
}: {
    params: Promise<{ subject: string }>;
}) {
    const { subject } = await params;
    const subjectCode = SUBJECT_MAP[subject];

    if (!subjectCode) {
        return <div className="p-8 text-muted-foreground">Subject not found.</div>;
    }

    // 🚧 Placeholder: only Math Methods works
    if (subjectCode !== "MATH_METHODS") {
        return (
            <div className="p-8">
                <h1 className="text-xl font-semibold mb-2">
                    {subject.replace(/-/g, " ").toUpperCase()}
                </h1>
                <p className="text-muted-foreground">This subject is coming soon.</p>
            </div>
        );
    }

    const defaultTopic = DEFAULT_TOPIC_BY_SUBJECT[subjectCode];

    if (!defaultTopic) {
        return (
            <div className="p-8 text-muted-foreground">
                No topics available for this subject yet.
            </div>
        );
    }

    const initialQuestions: PracticeQuestion[] =
        await fetchPracticeQuestions(subjectCode, defaultTopic);

    return (
        <PracticeClient
            subject={subjectCode}
            initialQuestions={initialQuestions}
        />
    );
}
