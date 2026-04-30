"use client";

import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === "FR" ? "AR" : "FR")}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md border border-[rgba(198,198,198,0.2)] transition-colors select-none"
      aria-label={locale === "FR" ? "التبديل إلى العربية" : "Switch to French"}
    >
      {locale === "FR" ? (
        <>
          <span className="text-on-surface font-semibold">FR</span>
          <span className="text-on-surface-muted">|</span>
          <span>عربي</span>
        </>
      ) : (
        <>
          <span>FR</span>
          <span className="text-on-surface-muted">|</span>
          <span className="text-on-surface font-semibold">عربي</span>
        </>
      )}
    </button>
  );
}