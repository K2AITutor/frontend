"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type UserRole = "student" | "parent" | "teacher" | "admin";
type UserStatus = "active" | "pending" | "suspended";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    role: "student",
    status: "active",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    role: "student",
    status: "active",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    role: "parent",
    status: "active",
  },
  {
    id: "4",
    name: "Robert Wilson",
    email: "robert.wilson@email.com",
    role: "teacher",
    status: "active",
  },
  {
    id: "5",
    name: "Jennifer Lee",
    email: "jennifer.lee@email.com",
    role: "student",
    status: "pending",
  },
  {
    id: "6",
    name: "David Martinez",
    email: "david.martinez@email.com",
    role: "student",
    status: "active",
  },
  {
    id: "7",
    name: "Amanda Brown",
    email: "amanda.brown@email.com",
    role: "parent",
    status: "active",
  },
  {
    id: "8",
    name: "Christopher Taylor",
    email: "christopher.taylor@email.com",
    role: "student",
    status: "suspended",
  },
  {
    id: "9",
    name: "Jessica Anderson",
    email: "jessica.anderson@email.com",
    role: "teacher",
    status: "active",
  },
  {
    id: "10",
    name: "Daniel Thomas",
    email: "daniel.thomas@email.com",
    role: "student",
    status: "active",
  },
];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = mockUsers.find((u) => u.id === userId);
    setUser(userData || null);
    setAvatarPreview(userData?.avatar || "");
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const userData = mockUsers.find((u) => u.id === userId);
    setUser(userData || null);
    setAvatarPreview(userData?.avatar || "");
  }, [userId]);

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || ("student" as UserRole),
      status: user?.status || ("active" as UserStatus),
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
      alert("User updated successfully!");
      router.push("/admin/users");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">
            Update user information and settings
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Name is required" : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Full Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter full name"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Email is required"
                      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                      ? "Invalid email format"
                      : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Email Address</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter email address"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field name="role">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Role</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as UserRole)
                        }
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>

                <form.Field name="status">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Status</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as UserStatus)
                        }
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback>
                      <UserIcon className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload a profile picture (JPG, PNG)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <>
                      <Button type="submit" disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                      <Link href="/admin/users">
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </Link>
                    </>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete User</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this user account and all associated data.
                </p>
              </div>
              <Button variant="destructive">Delete User</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
