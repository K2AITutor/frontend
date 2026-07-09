"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/dashboard/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/dashboard/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/dashboard/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/dashboard/ui/sheet";
import { DashboardSidebar } from "./DashboardSidebar";
import type { UserRole } from "@aitutor/shared";
import { FeatureGate } from "@/lib/featureFlags";
import { NotificationBell } from "./NotificationBell";
import {
  Menu,
  Search,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface DashboardHeaderProps {
  role: UserRole;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

function getInitials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "ST";

  // If it's an email, use first 2 letters before @
  if (value.includes("@")) {
    const head = value.split("@")[0] || "student";
    return head.slice(0, 2).toUpperCase();
  }

  const initials = parts.map((p) => p[0]).join("");
  return initials.slice(0, 2).toUpperCase();
}

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const displayName = session?.user?.name || session?.user?.email || "Student";

  const displayEmail = session?.user?.email || "";

  const initials = getInitials(displayName);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Mobile Menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[240px]">
          <DashboardSidebar role={role} />
        </SheetContent>
      </Sheet>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Mobile Search */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Notifications */}
        <FeatureGate flag="notifications-inbox">
          <NotificationBell />
        </FeatureGate>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={(session?.user as any)?.image || undefined}
                  alt={displayName}
                />
                {/* Matches the public navbar avatar (components/public/Navbar.tsx) */}
                <AvatarFallback className="bg-gradient-to-br from-accent-teal to-accent-coral text-[0.8125rem] font-semibold text-avatar-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{displayEmail}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            {role === "student" || role === "parent" ? (
              <DropdownMenuItem asChild>
                <Link href={`/${role}/settings`} className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
            ) : null}

            <FeatureGate flag="appearance-dark-mode">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                    {theme === "light" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                    {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                    {theme === "system" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </FeatureGate>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
