"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { ToastProvider } from "@/components/admin/Toast";

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
