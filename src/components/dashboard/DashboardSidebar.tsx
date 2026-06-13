"use client";

import React from "react";
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
  Settings,
  LogOut,
  UserCog,
  Users,
  Sparkles,
  CreditCard,
  HeartPulse,
  Quote,
  HelpCircle,
  ClipboardList,
  History,
  Network,
  Sliders,
  Inbox,
  Cpu,
  Database,
  ShieldCheck,
  FileText,
  FileQuestion,
  ListChecks,
  ClipboardCheck,
  ChevronDown,
  Bell,
} from "lucide-react";
import { signOut } from "next-auth/react";

export type UserRole =
  | "student"
  | "teacher"
  | "admin"
  | "contributor"
  | "parent";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
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

const teacherNavItems: NavItem[] = [
  {
    title: "Review Queue",
    href: "/teacher/review",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "History",
    href: "/teacher/history",
    icon: <History className="h-5 w-5" />,
  },
];

const adminNavGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        title: "Students",
        href: "/admin/students",
        icon: <UserCog className="h-5 w-5" />,
      },
      {
        title: "Staff",
        href: "/admin/staff",
        icon: <Users className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        title: "Subjects",
        href: "/admin/subjects",
        icon: <BookOpen className="h-5 w-5" />,
      },
      {
        title: "Topics",
        href: "/admin/content/topics",
        icon: <BookOpen className="h-5 w-5" />,
      },
      {
        title: "Skills",
        href: "/admin/content/skills",
        icon: <ListChecks className="h-5 w-5" />,
      },
      {
        title: "Questions",
        href: "/admin/content/questions",
        icon: <FileQuestion className="h-5 w-5" />,
      },
      {
        title: "Rubrics",
        href: "/admin/content/rubrics",
        icon: <ClipboardCheck className="h-5 w-5" />,
      },
      {
        title: "Tasks",
        href: "/admin/content/tasks",
        icon: <ClipboardList className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "AI Operations",
    items: [
      {
        title: "Marking Routing",
        href: "/admin/marking/routing",
        icon: <Network className="h-5 w-5" />,
      },
      {
        title: "Confidence Tuning",
        href: "/admin/marking/confidence",
        icon: <Sliders className="h-5 w-5" />,
      },
      {
        title: "Annotation Queue",
        href: "/admin/marking/queue",
        icon: <Inbox className="h-5 w-5" />,
      },
      {
        title: "Model Registry",
        href: "/admin/models",
        icon: <Cpu className="h-5 w-5" />,
      },
      {
        title: "Datasets",
        href: "/admin/datasets",
        icon: <Database className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "Billing",
    items: [
      {
        title: "Subscription Plans",
        href: "/admin/subscription-plans",
        icon: <CreditCard className="h-5 w-5" />,
      },
      {
        title: "Billing Health",
        href: "/admin/billing",
        icon: <HeartPulse className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "Public Page",
    items: [
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
    ],
  },
];

const contributorNavItems: NavItem[] = [
  {
    title: "Dataset QA",
    href: "/contributor/dataset-qa",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: "Guide PDF",
    href: "/docs/contributor-dataset-qa-guide.pdf",
    icon: <FileText className="h-5 w-5" />,
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
  {
    title: "Alerts",
    href: "/parent/alerts",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: "Reports",
    href: "/parent/reports",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/parent/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

const navItemsByRole: Record<UserRole, NavItem[]> = {
  student: studentNavItems,
  teacher: teacherNavItems,
  admin: adminNavGroups.flatMap((group) => group.items),
  contributor: contributorNavItems,
  parent: parentNavItems,
};

const roleLabels: Record<UserRole, string> = {
  student: "Student Portal",
  teacher: "Teacher Portal",
  admin: "Admin Portal",
  contributor: "Contributor Portal",
  parent: "Parent Portal",
};

export function DashboardSidebar({
  role,
  collapsed = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[role];
  const navGroups: NavGroup[] =
    role === "admin" ? adminNavGroups : [{ title: "", items: navItems }];
  const bottomNavItems = role === "student" ? studentBottomNavItems : [];
  const activeAdminGroupTitle = React.useMemo(() => {
    if (role !== "admin") return null;
    const activeGroup = adminNavGroups.find((group) =>
      group.items.some((item) => {
        if (item.href === "/admin") return pathname === item.href;
        return pathname.startsWith(item.href);
      }),
    );

    return activeGroup?.title ?? null;
  }, [pathname, role]);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    () =>
      adminNavGroups.reduce<Record<string, boolean>>((groups, group) => {
        groups[group.title] = true;
        return groups;
      }, {}),
  );

  React.useEffect(() => {
    if (role !== "admin") return;

    const storedGroups = window.localStorage.getItem("adminSidebarOpenGroups");
    if (!storedGroups) return;

    try {
      const parsedGroups = JSON.parse(storedGroups) as Record<string, boolean>;
      setOpenGroups((currentGroups) => ({
        ...currentGroups,
        ...parsedGroups,
        ...(activeAdminGroupTitle ? { [activeAdminGroupTitle]: true } : {}),
      }));
    } catch {
      window.localStorage.removeItem("adminSidebarOpenGroups");
    }
  }, [activeAdminGroupTitle, role]);

  React.useEffect(() => {
    if (role !== "admin" || !activeAdminGroupTitle) return;

    setOpenGroups((currentGroups) => {
      if (currentGroups[activeAdminGroupTitle]) return currentGroups;

      const nextGroups = {
        ...currentGroups,
        [activeAdminGroupTitle]: true,
      };
      window.localStorage.setItem(
        "adminSidebarOpenGroups",
        JSON.stringify(nextGroups),
      );
      return nextGroups;
    });
  }, [activeAdminGroupTitle, role]);

  const isActive = (href: string) => {
    if (href === `/${role}`) {
      return pathname === href;
    }
    if (href === "/contributor/dataset-qa") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const toggleGroup = (title: string) => {
    setOpenGroups((currentGroups) => {
      const nextGroups = {
        ...currentGroups,
        [title]: !currentGroups[title],
      };
      window.localStorage.setItem(
        "adminSidebarOpenGroups",
        JSON.stringify(nextGroups),
      );
      return nextGroups;
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex h-full flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[240px]",
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
          <nav className="flex flex-col gap-4">
            {navGroups.map((group, groupIndex) => (
              <div
                key={group.title || `nav-group-${groupIndex}`}
                className="flex flex-col gap-1"
              >
                {group.title ? (
                  collapsed ? (
                    groupIndex > 0 ? (
                      <div className="mx-1 my-1 h-px bg-border" />
                    ) : null
                  ) : (
                    <button
                      type="button"
                      className="mb-0.5 flex items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-muted"
                      onClick={() => toggleGroup(group.title)}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.title}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                          !openGroups[group.title] && "-rotate-90",
                        )}
                      />
                    </button>
                  )
                ) : null}

                {(collapsed || openGroups[group.title] !== false
                  ? group.items
                  : []
                ).map((item) => {
                  const active = isActive(item.href);
                  return collapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link href={item.href}>
                          <Button
                            variant={active ? "secondary" : "ghost"}
                            size="icon"
                            className={cn(
                              "h-10 w-10",
                              active &&
                                "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                            )}
                          >
                            {item.icon}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3",
                          active &&
                            "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
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
              </div>
            ))}
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
                            "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
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
                      "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
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
