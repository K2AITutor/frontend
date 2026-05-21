"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Label } from "@/components/dashboard/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/dashboard/ui/avatar";
import { ArrowLeft, Upload, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "@/components/dashboard/ui/sonner";
import { createUser, type AdminUserRole, type AdminUserStatus } from "@/lib/api/users";
import { useAdminToken } from "@/lib/api/useAdminToken";

type UserRole = AdminUserRole;
type UserStatus = AdminUserStatus;

export default function CreateUserPage() {
  usePageTitle("Create New User");
  const router = useRouter();
  const token = useAdminToken();
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student" as UserRole,
      status: "active" as UserStatus,
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Admin session is not ready");
        return;
      }
      try {
        await createUser({
          name: value.name,
          email: value.email,
          password: value.password,
          role: value.role,
          status: value.status,
          avatar: avatarPreview || undefined,
        }, token);
        toast.success("User created successfully");
        router.push(value.role === "student" ? "/admin/users" : "/admin/staff");
      } catch (err: any) {
        toast.error(err.message || "Failed to create user");
      }
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New User</h1>
          <p className="text-muted-foreground">
            Add a new user to the platform
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
                <form.Field
                  name="password"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? "Password is required"
                        : value.length < 8
                        ? "Password must be at least 8 characters"
                        : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Password</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter password"
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
                  name="confirmPassword"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? "Please confirm password"
                        : value !== form.getFieldValue("password")
                        ? "Passwords do not match"
                        : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Confirm Password</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Confirm password"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-600">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

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
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="contributor">Contributor</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
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
                        {isSubmitting ? "Creating..." : "Create User"}
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
      </div>
    </div>
  );
}
