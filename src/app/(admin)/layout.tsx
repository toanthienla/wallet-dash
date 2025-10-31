"use client";

import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import React from "react";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getRouteSpecificStyles = () => {
    switch (pathname) {
      case "/transaction-queue":
      case "/system-wallet":
      case "/user-wallet":
        return "px-8 py-8";
      default:
        return "p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AppSidebar />
        <div className="flex-1 min-h-screen">
          <AppHeader />
          <div className={getRouteSpecificStyles()}>{children}</div>
        </div>
      </div>
    </div>
  );
}
