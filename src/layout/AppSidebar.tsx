"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ChevronDown,
  Search,
} from "lucide-react";

const AppSidebar: React.FC = () => {
  const [openDashboard, setOpenDashboard] = useState(true);
  const [openTransaction, setOpenTransaction] = useState(true);
  const [search, setSearch] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Lắng nghe sự kiện toggle từ Header
  useEffect(() => {
    const handler = () => setIsCollapsed((prev) => !prev);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  // Helper function to check if a link is active
  const isLinkActive = (href: string) => {
    // Exact match or starts with the href
    return pathname === href || pathname?.startsWith(href + "/");
  };

  // Dữ liệu menu gốc
  const menuData = useMemo(
    () => [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        isOpen: openDashboard,
        setOpen: setOpenDashboard,
        links: [
          { label: "Overview", href: "/overview" },
          { label: "User Wallet", href: "/user-wallet" },
          { label: "System Wallet", href: "/system-wallet" },
        ],
      },
      {
        title: "Transaction",
        icon: FileText,
        isOpen: openTransaction,
        setOpen: setOpenTransaction,
        links: [
          { label: "Transaction Queue", href: "/transaction-queue" },
          { label: "Transaction Analytics", href: "/transaction-analytics" },
          { label: "Money Flow Trace", href: "/money-flow-trace" },
        ],
      },
    ],
    [openDashboard, openTransaction]
  );

  // Lọc menu theo từ khóa search
  const filteredMenu = useMemo(() => {
    if (!search.trim()) return menuData;
    const term = search.toLowerCase();
    return menuData
      .map((group) => {
        const filteredLinks = group.links.filter((link) =>
          link.label.toLowerCase().includes(term)
        );
        return filteredLinks.length > 0
          ? { ...group, links: filteredLinks }
          : null;
      })
      .filter(Boolean) as typeof menuData;
  }, [search, menuData]);

  return (
    <aside
      className={`bg-white border-r border-gray-100 transition-all duration-300 min-h-screen flex flex-col 
      ${isCollapsed ? "w-20 px-3" : "w-72 px-8 py-6"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-flex w-10 h-10 rounded-full bg-green-100 items-center justify-center">
          <img src="/images/logo/Group.svg" alt="Group Logo" className="w-8 h-8" />
        </span>
        {!isCollapsed && (
          <span className="font-bold text-2xl text-gray-900">Ting.money</span>
        )}
      </div>

      {/* Search box */}
      {!isCollapsed && (
        <div className="mb-6">
          <span className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
            Menu
          </span>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {filteredMenu.map((group, idx) => (
          <div key={idx}>
            <button
              className={`flex items-center w-full px-3 py-2 rounded-xl transition-colors text-left font-medium ${isCollapsed
                ? "justify-center"
                : "text-gray-900 hover:bg-blue-50 mb-1"
                }`}
              onClick={() => group.setOpen((v: boolean) => !v)}
            >
              <group.icon size={20} className="mr-3" />
              {!isCollapsed && group.title}
              {!isCollapsed && (
                <ChevronDown
                  className={`ml-auto transition-transform ${group.isOpen ? "rotate-180" : ""
                    }`}
                  size={16}
                />
              )}
            </button>

            {group.isOpen && !isCollapsed && (
              <div className="ml-8 mt-2 flex flex-col gap-1">
                {group.links.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors ${isLinkActive(link.href)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-900 hover:bg-blue-50"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;