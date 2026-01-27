"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserTable } from "@/components/dashboard/UserTable";
import {
  Users,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = "student" | "parent" | "teacher" | "admin";
type UserStatus = "active" | "pending" | "suspended";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedDate: string;
  status: UserStatus;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    role: "student",
    joinedDate: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    role: "student",
    joinedDate: "2024-01-10",
    status: "active",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    role: "parent",
    joinedDate: "2023-12-20",
    status: "active",
  },
  {
    id: "4",
    name: "Robert Wilson",
    email: "robert.wilson@email.com",
    role: "teacher",
    joinedDate: "2023-11-05",
    status: "active",
  },
  {
    id: "5",
    name: "Jennifer Lee",
    email: "jennifer.lee@email.com",
    role: "student",
    joinedDate: "2024-01-08",
    status: "pending",
  },
  {
    id: "6",
    name: "David Martinez",
    email: "david.martinez@email.com",
    role: "student",
    joinedDate: "2024-01-03",
    status: "active",
  },
  {
    id: "7",
    name: "Amanda Brown",
    email: "amanda.brown@email.com",
    role: "parent",
    joinedDate: "2023-12-15",
    status: "active",
  },
  {
    id: "8",
    name: "Christopher Taylor",
    email: "christopher.taylor@email.com",
    role: "student",
    joinedDate: "2024-01-12",
    status: "suspended",
  },
  {
    id: "9",
    name: "Jessica Anderson",
    email: "jessica.anderson@email.com",
    role: "teacher",
    joinedDate: "2023-10-22",
    status: "active",
  },
  {
    id: "10",
    name: "Daniel Thomas",
    email: "daniel.thomas@email.com",
    role: "student",
    joinedDate: "2024-01-18",
    status: "active",
  },
  {
    id: "11",
    name: "Daniel Thomas",
    email: "daniel.thomas@email.com",
    role: "student",
    joinedDate: "2024-01-18",
    status: "active",
  },
  {
    id: "12",
    name: "Daniel Thomas",
    email: "daniel.thomas@email.com",
    role: "student",
    joinedDate: "2024-01-18",
    status: "active",
  },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all platform users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/users/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">1,248</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">1,198</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">96% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold">32</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold">18</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Account locked</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable users={filteredUsers} />
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {mockUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
