"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/dashboard/ui/button";
import { ScrollArea } from "@/components/dashboard/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/dashboard/ui/tooltip";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  Users,
  BarChart3,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
  HelpCircle,
  Quote,
} from "lucide-react";
import { signOut } from "next-auth/react";

export type UserRole = "student" | "parent" | "admin";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface DashboardSidebarProps {
  role: UserRole;
  collapsed?: boolean;
  onToggle?: () => void;
}

const studentNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/student",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Courses",
    href: "/student/courses",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Practice",
    href: "/student/practice",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/student/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Subscription",
    href: "/student/subscription",
    icon: <CreditCard className="h-5 w-5" />,
  },
];

const parentNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/parent",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Children",
    href: "/parent/children",
    icon: <Users className="h-5 w-5" />,
  },
];

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: <UserCog className="h-5 w-5" />,
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Subjects",
    href: "/admin/subjects",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "FAQs",
    href: "/admin/faqs",
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: <Quote className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

const navItemsByRole: Record<UserRole, NavItem[]> = {
  student: studentNavItems,
  parent: parentNavItems,
  admin: adminNavItems,
};

const roleLabels: Record<UserRole, string> = {
  student: "Student Portal",
  parent: "Parent Portal",
  admin: "Admin Portal",
};

export function DashboardSidebar({
  role,
  collapsed = false,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[role];

  const isActive = (href: string) => {
    if (href === `/${role}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex h-full flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-4">
          <Link href={`/${role}`} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">
                K
              </span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">K2 AI Tutor</span>
                <span className="text-xs text-muted-foreground">
                  {roleLabels[role]}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          size="icon"
                          className={cn(
                            "h-10 w-10",
                            active && "bg-primary/10 text-primary"
                          )}
                        >
                          {item.icon}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      active && "bg-primary/10 text-primary"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={() => signOut()}
              variant="ghost"
              className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          )}
        </div>

        {/* Collapse Toggle */}
        {onToggle && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="w-full"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
