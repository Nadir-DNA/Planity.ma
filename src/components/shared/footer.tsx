import Link from "next/link";
import { Calendar } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const footerLinks = {
  Découvrir: [
    { label: "Coiffeur", href: "/recherche?category=coiffeur" },
    { label: "Barbier", href: "/recherche?category=barbier" },
    { label: "Institut de beauté", href: "/recherche?category=institut-beaute" },
    { label: "Spa & Hammam", href: "/recherche?category=spa" },
    { label: "Manucure", href: "/recherche?category=ongles" },
  ],
  "Villes populaires": [
    { label: "Casablanca", href: "/recherche?city=casablanca" },
    { label: "Rabat", href: "/recherche?city=rabat" },
    { label: "Marrakech", href: "/recherche?city=marrakech" },
    { label: "Fès", href: "/recherche?city=fes" },
    { label: "Tanger", href: "/recherche?city=tanger" },
  ],
  Informations: [
    { label: "Conditions générales", href: "/cgu" },
    { label: "Politique de confidentialité", href: "/politique-confidentialite" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-surface-container border-t border-outline-light">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-on-surface" />
              <span className="text-base font-semibold tracking-tight text-on-surface">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-sm text-on-surface-muted leading-relaxed">
              La plateforme de réservation beauté et bien-être au Maroc.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-on-surface-muted hover:text-on-surface transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-outline-light">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-on-surface-muted">
            © {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-5">
            <Link
              href="/cgu"
              className="text-xs text-on-surface-muted hover:text-on-surface transition-colors"
            >
              CGU
            </Link>
            <Link
              href="/politique-confidentialite"
              className="text-xs text-on-surface-muted hover:text-on-surface transition-colors"
            >
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}