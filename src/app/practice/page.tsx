// frontend/src/app/practice/page.tsx
import Link from "next/link";

type SubjectStatus = "active" | "coming";

type Subject = {
    name: string;
    slug: string;
    description: string;
    status: SubjectStatus;
};

const SUBJECTS: Subject[] = [
    {
        name: "VCE Mathematical Methods",
        slug: "math-methods",
        status: "active",
        description:
            "Practise by topic or sit past exams with examiner-style feedback (Exam 1 + Exam 2).",
    },
    {
        name: "English",
        slug: "english",
        status: "coming",
        description:
            "Exam-style reading and writing practice with feedback.",
    },
    {
        name: "Specialist Mathematics",
        slug: "specialist-maths",
        status: "coming",
        description:
            "Advanced calculus and reasoning practice (VCE style).",
    },
    {
        name: "Chemistry",
        slug: "chemistry",
        status: "coming",
        description:
            "Structured response and calculations with marking guidance.",
    },
    {
        name: "Physics",
        slug: "physics",
        status: "coming",
        description:
            "Exam-style problems with working and feedback.",
    },
    {
        name: "Biology",
        slug: "biology",
        status: "coming",
        description:
            "Short-answer practice with concept-level feedback.",
    },
    {
        name: "General Mathematics",
        slug: "general-maths",
        status: "coming",
        description:
            "Core numeracy and applied problem-solving practice.",
    },
    {
        name: "Business Management",
        slug: "business-management",
        status: "coming",
        description:
            "Case-study questions with examiner-style commentary.",
    },
    {
        name: "Accounting",
        slug: "accounting",
        status: "coming",
        description:
            "Financial reporting and problem-solving practice.",
    },
    {
        name: "Economics",
        slug: "economics",
        status: "coming",
        description:
            "Data response and extended-answer exam practice.",
    },
    {
        name: "Psychology",
        slug: "psychology",
        status: "coming",
        description:
            "Research-based and short-answer exam preparation.",
    },
    {
        name: "Algorithmics",
        slug: "algorithmics",
        status: "coming",
        description:
            "Computational thinking and algorithm design practice.",
    },
    {
        name: "Computing",
        slug: "computing",
        status: "coming",
        description:
            "Programming and problem-solving exam preparation.",
    },
];

function SubjectCard({ subject }: { subject: Subject }) {
    const isActive = subject.status === "active";

    const card = (
        <div className="glass p-6 rounded-2xl border border-slate-700/60">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold mb-2">
                        {subject.name}
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {subject.description}
                    </p>
                </div>

                <span
                    className={[
                        "px-2 py-1 rounded text-xs whitespace-nowrap",
                        isActive
                            ? "bg-emerald-900/40 text-emerald-200"
                            : "bg-slate-800 text-slate-400",
                    ].join(" ")}
                >
                    {isActive ? "Active" : "Coming soon"}
                </span>
            </div>

            <div className="mt-5">
                {isActive ? (
                    <span className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold">
                        Open {subject.name} →
                    </span>
                ) : (
                    <span className="inline-flex items-center px-6 py-3 bg-slate-800 rounded-lg font-semibold text-slate-400 cursor-not-allowed">
                        Not available yet
                    </span>
                )}
            </div>
        </div>
    );

    return isActive ? (
        <Link href={`/practice/${subject.slug}`} className="block">
            {card}
        </Link>
    ) : (
        card
    );
}

export default function PracticeLandingPage() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 text-slate-200">
            <header>
                <h1 className="text-3xl font-semibold mb-1">VCE Dashboard</h1>
                <p className="text-slate-300">
                    Choose a subject to begin.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SUBJECTS.map((subject) => (
                    <SubjectCard key={subject.slug} subject={subject} />
                ))}
            </div>
        </div>
    );
}
