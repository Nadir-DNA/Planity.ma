"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Menu,
  X,
  User,
  Calendar,
  Heart,
  LogIn,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  interface SessionUser {
  role?: string;
}
const userRole = (session?.user as SessionUser)?.role;

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              {APP_NAME}
            </span>
          </Link>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un salon, un service..."
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Nav (desktop) */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/pro/inscription"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Espace Pro
            </Link>

            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/favoris">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/mes-rendez-vous">
                    <Calendar className="h-5 w-5" />
                  </Link>
                </Button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-rose-600 flex items-center justify-center text-white text-sm font-bold">
                      {(session?.user?.name || "U")[0].toUpperCase()}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 z-50 py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {session?.user?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session?.user?.email}
                          </p>
                        </div>

                        <Link
                          href="/mes-rendez-vous"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Calendar className="h-4 w-4" />
                          <span>Mes rendez-vous</span>
                        </Link>
                        <Link
                          href="/favoris"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4" />
                          <span>Favoris</span>
                        </Link>
                        <Link
                          href="/parametres"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Paramètres</span>
                        </Link>

                        {(userRole === "PRO_OWNER" || userRole === "PRO_STAFF") && (
                          <Link
                            href="/pro/agenda"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>Espace Pro</span>
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Button size="sm" asChild>
                <Link href="/connexion">
                  <LogIn className="mr-2 h-4 w-4" />
                  Connexion
                </Link>
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm"
              />
            </div>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/mes-rendez-vous"
                className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                <span>Mes rendez-vous</span>
              </Link>
              <Link
                href="/favoris"
                className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                <span>Favoris</span>
              </Link>
              <Link
                href="/pro/inscription"
                className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Espace Pro</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/parametres"
                    className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <Button size="sm" className="mt-2" asChild>
                  <Link href="/connexion" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Connexion
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
