"use client";

import { DetailDrawer } from "@/components/dashboard/ui/detail-drawer";
import { StudentProfileContent } from "@/components/dashboard/StudentProfileContent";

interface StudentDetailDrawerProps {
  /** Id of the user to show; `null` keeps the drawer closed. */
  userId: string | null;
  onClose: () => void;
}

/**
 * Right-side drawer for viewing a single user's profile (Rule 1, docs/CODING_STANDARDS.md).
 * Wraps the shared StudentProfileContent so the drawer and the `/admin/students/[id]`
 * deep-link page render identical bodies.
 */
export function StudentDetailDrawer({ userId, onClose }: StudentDetailDrawerProps) {
  return (
    <DetailDrawer
      open={userId !== null}
      onClose={onClose}
      title="User Profile"
      description="Profile, subscription and recent activity."
    >
      {userId && (
        <StudentProfileContent key={userId} userId={userId} onDeleted={onClose} />
      )}
    </DetailDrawer>
  );
}
