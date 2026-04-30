"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/ui/notification-bell";
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
  Scissors,
  Sparkles,
  Droplets,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export function Header({ transparent = false }: { transparent?: boolean }) {
  const { locale } = useLanguage();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(!transparent);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  interface SessionUser {
    role?: string;
  }
  const userRole = (session?.user as SessionUser)?.role;

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: t("nav.coiffeur", locale), href: "/recherche?category=coiffeur" },
    { label: t("nav.barbier", locale), href: "/recherche?category=barbier" },
    { label: t("nav.institut", locale), href: "/recherche?category=institut-beaute" },
    { label: t("nav.spa", locale), href: "/recherche?category=spa" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-surface-bright/90 backdrop-blur-xl border-b border-outline-light"
          : transparent
          ? "bg-transparent"
          : "bg-surface-bright/90 backdrop-blur-xl border-b border-outline-light"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-on-surface"
          >
            {APP_NAME}
          </Link>

          {/* Nav items (desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm text-on-surface-variant hover:text-on-surface rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions (desktop) */}
          <div className="hidden lg:flex items-center space-x-3">
            <LanguageSwitcher />

            <Link href="/pro/inscription">
              <Button
                variant="outline"
                size="sm"
                className="border-outline-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-md text-sm"
              >
                {t("nav.pro_cta", locale)}
              </Button>
            </Link>

            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-surface-container animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/favoris">
                    <Heart className="h-4 w-4 text-on-surface-variant" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/mes-rendez-vous">
                    <Calendar className="h-4 w-4 text-on-surface-variant" />
                  </Link>
                </Button>
                <NotificationBell count={3} />

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-surface-container transition-colors"
                  >
                    <Avatar
                      fallback={session?.user?.name || "U"}
                      size="sm"
                    />
                    <ChevronDown className="h-3.5 w-3.5 text-on-surface-muted" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-md bg-surface-bright border border-outline-light shadow-lg z-50 py-1">
                        <div className="px-4 py-3 border-b border-outline-light">
                          <p className="text-sm font-medium text-on-surface">
                            {session?.user?.name}
                          </p>
                          <p className="text-xs text-on-surface-muted">
                            {session?.user?.email}
                          </p>
                        </div>

                        <Link
                          href="/mes-rendez-vous"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{t("nav.my_appointments", locale)}</span>
                        </Link>
                        <Link
                          href="/favoris"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Heart className="h-3.5 w-3.5" />
                          <span>{t("nav.favorites", locale)}</span>
                        </Link>
                        <Link
                          href="/parametres"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-3.5 w-3.5" />
                          <span>{t("nav.settings", locale)}</span>
                        </Link>

                        {(userRole === "PRO_OWNER" ||
                          userRole === "PRO_STAFF") && (
                          <Link
                            href="/pro/agenda"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="h-3.5 w-3.5" />
                            <span>{t("nav.pro_space", locale)}</span>
                          </Link>
                        )}

                        <div className="border-t border-outline-light mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-on-surface-muted hover:text-on-surface hover:bg-surface-container w-full transition-colors"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>{t("nav.logout", locale)}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link href="/connexion">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-on-surface text-primary-on rounded-md text-sm font-medium"
                >
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  {t("nav.my_account", locale)}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile: language + menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-on-surface" />
              ) : (
                <Menu className="h-5 w-5 text-on-surface" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-surface-bright border border-outline-light rounded-md mt-2 p-4 space-y-3">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-outline-light pt-3 space-y-2">
              <Link
                href="/pro/inscription"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-3.5 w-3.5" />
                <span>{t("nav.pro_cta", locale)}</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/mes-rendez-vous"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{t("nav.my_appointments", locale)}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-on-surface-muted hover:bg-surface-container rounded-md w-full transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t("nav.logout", locale)}</span>
                  </button>
                </>
              ) : (
                <Link href="/connexion" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full mt-1 bg-primary hover:bg-on-surface text-primary-on rounded-md text-sm font-medium">
                    {t("nav.my_account", locale)}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}