// frontend/src/app/practice/math-methods/_components/ExamInstructions.tsx
type ExamProfile = {
    examKey: string;
    title: string;
    readingMins: number;
    writingMins: number;
    allowCAS: boolean;
    showHints: boolean;
    exactRequired: boolean;
    workingRequired: boolean;
    instructions: string[];
};

export default function ExamInstructions({ profile }: { profile: ExamProfile | null }) {
    if (!profile) return null;

    return (
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900/40 p-5">
            <div className="text-slate-100 font-semibold text-lg">{profile.title}</div>

            <div className="mt-2 text-slate-300 text-sm">
                <div>Reading time: <span className="font-semibold">{profile.readingMins}</span> minutes</div>
                <div>Writing time: <span className="font-semibold">{profile.writingMins}</span> minutes</div>
            </div>

            <div className="mt-4 text-slate-200 font-semibold text-sm">Instructions</div>
            <ul className="mt-2 list-disc pl-5 text-slate-300 text-sm space-y-1">
                {profile.instructions?.map((x, i) => (
                    <li key={i}>{x}</li>
                ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="px-2 py-1 rounded bg-slate-800">CAS: {profile.allowCAS ? "Allowed" : "Not allowed"}</span>
                <span className="px-2 py-1 rounded bg-slate-800">Exact required: {profile.exactRequired ? "Yes" : "No"}</span>
                <span className="px-2 py-1 rounded bg-slate-800">Working required: {profile.workingRequired ? "Yes" : "No"}</span>
            </div>
        </div>
    );
}
