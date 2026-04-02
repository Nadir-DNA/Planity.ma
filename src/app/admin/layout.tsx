"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Star,
  FileText,
  CreditCard,
  BarChart3,
  Calendar,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Etablissements", href: "/admin/etablissements", icon: Building2 },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { label: "Avis", href: "/admin/avis", icon: Star },
  { label: "Contenu", href: "/admin/contenu", icon: FileText },
  { label: "Finances", href: "/admin/finances", icon: CreditCard },
  { label: "Analytiques", href: "/admin/analytiques", icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="flex h-16 items-center px-4 border-b border-gray-800">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm">{APP_NAME}</span>
              <span className="text-xs text-gray-400 block">Admin</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white"
          >
            <Calendar className="h-4 w-4" />
            <span>Retour au site</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-6">
          <h2 className="font-semibold text-gray-900">Administration</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
