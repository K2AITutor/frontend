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
  BarChart3,
  UserCog,
  Sparkles,
  CreditCard,
  Quote,
  HelpCircle,
  ClipboardList,
  Library,
} from "lucide-react";
import { signOut } from "next-auth/react";

export type UserRole = "student" | "admin" | "contributor";

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
    title: "Practice",
    href: "/student/practice",
    icon: <Sparkles className="h-5 w-5" />,
  },
];

const studentBottomNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/student/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Subscription",
    href: "/student/subscription",
    icon: <CreditCard className="h-5 w-5" />,
    badge: "Plan",
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
    title: "Subscription Plans",
    href: "/admin/subscription-plans",
    icon: <CreditCard className="h-5 w-5" />,
  },
];

const contributorNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/contributor",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Tasks",
    href: "/contributor/tasks",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "Question Drafts",
    href: "/contributor/questions",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Rubric Drafts",
    href: "/contributor/rubrics",
    icon: <Library className="h-5 w-5" />,
  },
];

const navItemsByRole: Record<UserRole, NavItem[]> = {
  student: studentNavItems,
  admin: adminNavItems,
  contributor: contributorNavItems,
};

const roleLabels: Record<UserRole, string> = {
  student: "Student Portal",
  admin: "Admin Portal",
  contributor: "Contributor Portal",
};

export function DashboardSidebar({
  role,
  collapsed = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[role];
  const bottomNavItems = role === "student" ? studentBottomNavItems : [];

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
                            active &&
                            "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
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
                      active &&
                      "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
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

        <div className="border-t p-3 flex flex-col gap-1">
          {bottomNavItems.map((item) => {
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
                          active &&
                          "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
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
                    active &&
                    "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Button>
              </Link>
            );
          })}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}