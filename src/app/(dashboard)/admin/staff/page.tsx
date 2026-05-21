"use client";

import { AdminUsersDirectory } from "@/components/dashboard/AdminUsersDirectory";

export default function AdminStaffPage() {
  return (
    <AdminUsersDirectory
      roleScope="staff"
      title="Staff Management"
      description="Manage teachers, admins, contributors, and parent accounts."
      directoryTitle="Staff Directory"
      directoryDescription="Search and filter non-student platform users."
    />
  );
}
