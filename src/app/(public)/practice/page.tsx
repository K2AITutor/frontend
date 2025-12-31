import Link from "next/link";

const SUBJECTS = [
    { name: "Mathematical Methods", slug: "math-methods", status: "active" },
    { name: "English", slug: "english", status: "coming" },
    { name: "Specialist Mathematics", slug: "specialist-maths", status: "coming" },
    { name: "Chemistry", slug: "chemistry", status: "coming" },
    { name: "Physics", slug: "physics", status: "coming" },
    { name: "Biology", slug: "biology", status: "coming" },
    { name: "General Mathematics", slug: "general-maths", status: "coming" },
    { name: "Business Management", slug: "business-management", status: "coming" },
    { name: "Accounting", slug: "accounting", status: "coming" },
    { name: "Economics", slug: "economics", status: "coming" },
    { name: "Psychology", slug: "psychology", status: "coming" },
    { name: "Algorithmics", slug: "algorithmics", status: "coming" },
    { name: "Computing", slug: "computing", status: "coming" },
];

export default function PracticeDashboardPage() {
    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">VCE Practice Dashboard</h1>
            <p className="text-slate-400">
                Choose a VCE subject to start practicing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBJECTS.map((s) => (
                    <div
                        key={s.slug}
                        className="rounded-xl border border-slate-700 p-4 bg-slate-900"
                    >
                        <h2 className="font-semibold">{s.name}</h2>

                        {s.status === "active" ? (
                            <Link
                                href={`/practice/${s.slug}`}
                                className="inline-block mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                            >
                                Start Practice →
                            </Link>
                        ) : (
                            <span className="inline-block mt-3 px-4 py-2 rounded-lg bg-slate-700 text-sm text-slate-400">
                                Coming soon
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
