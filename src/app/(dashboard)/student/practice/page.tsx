import Link from "next/link";
import { Button } from "@/components/dashboard/ui/button";
import { Badge } from "@/components/dashboard/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/dashboard/ui/card";
import { ArrowRight, Clock, BookOpen } from "lucide-react";

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
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">VCE Practice Dashboard</h1>
          <p className="text-muted-foreground">
            Choose a VCE subject to start practicing. AI-powered feedback helps you learn faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SubjectCard({
  subject,
}: {
  subject: { name: string; slug: string; status: string };
}) {
  const isActive = subject.status === "active";

  return (
    <Card className={!isActive ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{subject.name}</CardTitle>
          {isActive ? (
            <Badge>Available</Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Coming Soon
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground">
          {isActive
            ? "Practice with AI-powered hints and explanations"
            : "This subject will be available soon"}
        </p>
      </CardContent>
      <CardFooter>
        {isActive ? (
          <Button asChild className="w-full">
            <Link href={`/student/practice/${subject.slug}`}>
              <BookOpen className="mr-2 h-4 w-4" />
              Start Practice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" disabled className="w-full">
            Coming Soon
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
