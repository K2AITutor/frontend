import { StudentProfileContent } from "@/components/dashboard/StudentProfileContent";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentProfileContent userId={id} />;
}
