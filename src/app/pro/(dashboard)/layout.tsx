"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  Scissors,
  UserCircle,
  BarChart3,
  CreditCard,
  Package,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useState } from "react";

const sidebarItems = [
  { label: "Accueil", href: "/pro", icon: LayoutDashboard },
  { label: "Agenda", href: "/pro/agenda", icon: Calendar },
  { label: "Clients", href: "/pro/clients", icon: Users },
  { label: "Services", href: "/pro/services", icon: Scissors },
  { label: "Equipe", href: "/pro/equipe", icon: UserCircle },
  { label: "Caisse", href: "/pro/caisse", icon: CreditCard },
  { label: "Stock", href: "/pro/stock", icon: Package },
  { label: "Statistiques", href: "/pro/statistiques", icon: BarChart3 },
  { label: "Parametres", href: "/pro/parametres", icon: Settings },
];

export default function ProDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f9f9f9]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[rgba(198,198,198,0.2)] transform transition-transform lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-[rgba(198,198,198,0.2)]">
          <Link href="/pro" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-black tracking-tight">{APP_NAME}</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Salon selector */}
        <div className="p-4 border-b border-[rgba(198,198,198,0.2)]">
          <button className="w-full flex items-center justify-between p-2 rounded-md bg-[#f9f9f9] hover:bg-[#eeeeee] text-sm transition-colors">
            <div className="text-left">
              <p className="font-medium text-black">Salon Elegance</p>
              <p className="text-xs text-gray-500">Casablanca</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = item.href === "/pro" 
              ? pathname === "/pro" 
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-[#eeeeee] hover:text-black"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-[rgba(198,198,198,0.2)]">
          <Link
            href="/api/auth/signout"
            className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-500 hover:text-black w-full rounded-md hover:bg-[#f9f9f9] transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between px-4 sm:px-6 bg-white border-b border-[rgba(198,198,198,0.2)]">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              Voir mon salon
            </Link>
            <div className="h-8 w-8 rounded-md bg-black flex items-center justify-center text-white text-sm font-bold">
              SE
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}