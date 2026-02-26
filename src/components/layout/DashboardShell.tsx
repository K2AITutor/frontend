'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  History, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User,
  Users,
  Database,
  BarChart3,
  Bell
} from 'lucide-react';
import { logout } from '@/lib/auth';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'ADMIN', 'PARENT'] },
  { name: 'Practice', href: '/practice', icon: BookOpen, roles: ['STUDENT', 'ADMIN'] },
  { name: 'Exams', href: '/dashboard/exams', icon: GraduationCap, roles: ['STUDENT', 'ADMIN'] },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard, roles: ['STUDENT', 'PARENT', 'ADMIN'] },
  { name: 'Mastery', href: '/dashboard/mastery', icon: BarChart3, roles: ['STUDENT', 'PARENT'] },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, roles: ['STUDENT', 'PARENT', 'ADMIN'] },
  { name: 'User Management', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Content Manager', href: '/admin/questions', icon: Database, roles: ['ADMIN'] },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('STUDENT');
  const [userEmail, setUserEmail] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // In a real app, decode JWT or fetch profile
    const storedRole = localStorage.getItem('userRole') || 'STUDENT';
    const email = localStorage.getItem('userEmail') || 'user@example.com';
    setUserRole(storedRole);
    setUserEmail(email);
  }, []);

  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="font-bold text-xl tracking-tight">VCE AI Tutor</span>
            </Link>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 space-y-1">
            <button 
              onClick={() => router.push('/dashboard/settings')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Settings size={18} />
              Settings
            </button>
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8">
          <button 
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <X className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hidden" size={16} />
              <input 
                type="text" 
                placeholder="Search topics, questions, or help..."
                className="w-full bg-slate-100 border-none rounded-full py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{userEmail.split('@')[0]}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">{userRole}</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 border border-slate-300">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
