"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type Locale = "FR" | "AR";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "FR",
  setLocale: () => {},
  dir: "ltr",
});

export function useLanguage() {
  return useContext(LanguageContext);
}

const STORAGE_KEY = "planity_locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "FR";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "AR" || stored === "FR") return stored;
  return "FR";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("FR");
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    setLocaleState(getInitialLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);

    // Persist to user profile if authenticated
    try {
      fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      }).catch(() => {
        // Silently fail if not authenticated
      });
    } catch {
      // Ignore network errors
    }
  }, []);

  // Apply dir attribute to <html>
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dir = locale === "AR" ? "rtl" : "ltr";
    document.documentElement.lang = locale === "AR" ? "ar" : "fr";
  }, [locale, mounted]);

  const dir = locale === "AR" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}