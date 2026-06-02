"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/dashboard/ui/button";
import { ArrowLeft } from "lucide-react";
import { StudentProfileContent } from "@/components/dashboard/StudentProfileContent";
import { usePageTitle } from "@/lib/usePageTitle";

/**
 * Deep-link / bookmarkable full-page view of a user profile. The same body is shown in a
 * right-side drawer from the user directory (StudentDetailDrawer); both reuse
 * StudentProfileContent so there is no duplicated markup. See docs/CODING_STANDARDS.md (Rule 1).
 */
export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = String(params.id);
  usePageTitle("User Profile");

  return (
    <div className="space-y-6 p-6 pb-20 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.push("/admin/students")} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
      </Button>

      <StudentProfileContent
        userId={userId}
        onDeleted={() => router.push("/admin/students")}
      />
    </div>
  );
}
