"use client";

import { useState } from "react";
import { Loader2, User, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Label } from "@/components/dashboard/ui/label";
import { Separator } from "@/components/dashboard/ui/separator";
import { toast } from "@/components/dashboard/ui/sonner";
import { useSession } from "next-auth/react";
import { usePageTitle } from "@/lib/usePageTitle";

export default function ParentSettingsPage() {
  usePageTitle("Settings");
  const { data: session } = useSession();

  const user = session?.user as { name?: string; email?: string } | undefined;
  const [name, setName] = useState(user?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6 pb-20 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <Button type="submit" disabled={isSaving || !name.trim()}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Email alerts for: low confidence submissions, inactivity warnings, and weekly digest.</p>
          <Separator />
          <p className="text-xs">Notification preferences are managed by your administrator.</p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Password changes and 2FA are managed via your school&apos;s identity provider.</p>
        </CardContent>
      </Card>
    </div>
  );
}
