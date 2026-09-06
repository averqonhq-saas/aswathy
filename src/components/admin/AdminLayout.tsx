"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Sparkles,
  MessageSquare,
  Star,
  User,
  Milestone,
  ListOrdered,
  Users,
  Image as ImageIcon,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { ToastProvider, useToast } from "./Toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { success, error } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fetch unread notification count
  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();
          const unread = (data.notifications || []).filter(
            (n: { isRead: boolean }) => !n.isRead
          ).length;
          setUnreadCount(unread);
        }
      } catch {
        // Fallback
      }
    }
    fetchNotifs();
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/admin/auth/logout", { method: "POST" });
      if (res.ok) {
        success("Logged out safely. Have a restful evening.");
        router.push("/admin/login");
        router.refresh();
      } else {
        error("Logout failed. Please try again.");
      }
    } catch {
      error("An error occurred during logout.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navSections = [
    {
      label: "Practice",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Bookings", href: "/admin/bookings", icon: Clock },
        { label: "Calendar", href: "/admin/calendar", icon: Calendar },
        { label: "Services", href: "/admin/services", icon: Sparkles },
        { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
        { label: "Client Feedback", href: "/admin/feedback", icon: Star },
      ],
    },
    {
      label: "Website Content",
      items: [
        { label: "About Me", href: "/admin/content/about", icon: User },
        { label: "My Journey", href: "/admin/content/journey", icon: Milestone },
        { label: "What to Expect", href: "/admin/content/session", icon: ListOrdered },
        { label: "Who I Work With", href: "/admin/content/client-types", icon: Users },
      ],
    },
    {
      label: "Management",
      items: [
        { label: "Media Library", href: "/admin/media", icon: ImageIcon },
        {
          label: "Notifications",
          href: "/admin/notifications",
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  // Helper for current page title
  const getPageTitle = () => {
    for (const sec of navSections) {
      for (const item of sec.items) {
        if (pathname === item.href) return item.label;
      }
    }
    return "Sanctuary Admin";
  };

  return (
    <div className="min-h-screen bg-[#FCF9F2] text-[#1C1C18] flex flex-col lg:flex-row antialiased font-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-xs lg:hidden animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface border-r border-parchment-border/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-surface-container bg-surface flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 text-left group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-sm font-semibold text-forest-green tracking-tight">
                Psychology Admin
              </span>
              <span className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest">
                Aswathy Sanctuary
              </span>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-on-surface-variant hover:text-primary rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links (Scrollable) */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <span className="px-3 text-[10px] font-label-caps uppercase tracking-widest text-on-surface-variant/70 font-semibold block mb-1.5">
                {section.label}
              </span>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? "bg-forest-green text-white font-semibold shadow-xs"
                          : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? "text-[#F4D242]"
                              : "text-on-surface-variant group-hover:text-forest-green"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-[#F4D242] text-[#1A3828]"
                              : "bg-[#FEF7E0] text-[#B78103]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Profile & Logout */}
        <div className="p-4 border-t border-surface-container bg-surface-container-low shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/settings"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg"
                alt="Aswathy"
                className="w-8 h-8 rounded-full object-cover border border-parchment-border"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-primary truncate max-w-[110px]">
                  Aswathy J.
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  Psychologist
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Logout"
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-[#BA1A1A] hover:bg-surface transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#FCF9F2]/90 backdrop-blur-md border-b border-parchment-border/80 px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-primary hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Link
                href="/admin/dashboard"
                className="hover:text-primary transition-colors"
              >
                Admin
              </Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              <span className="font-semibold text-primary font-headline-sm text-sm">
                {getPageTitle()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* View Live Public Site */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-parchment-border hover:bg-surface text-on-surface-variant hover:text-primary transition-all"
            >
              <span>View Public Sanctuary</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>

            {/* Notifications Shortcut */}
            <Link
              href="/admin/notifications"
              className="relative p-2 rounded-xl border border-parchment-border hover:bg-surface text-primary transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-forest-green text-[#F4D242] text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ToastProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ToastProvider>
  );
}
