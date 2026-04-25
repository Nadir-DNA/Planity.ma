import Link from "next/link";
import { Calendar } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-sm text-gray-500">
              La plateforme de reservation beaute et bien-etre au Maroc.
              Trouvez et reservez votre prochain rendez-vous en quelques clics.
            </p>
          </div>

          {/* Decouvrir */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Decouvrir
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/recherche?category=coiffeur"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Coiffeur
                </Link>
              </li>
              <li>
                <Link
                  href="/recherche?category=barbier"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Barbier
                </Link>
              </li>
              <li>
                <Link
                  href="/recherche?category=institut-beaute"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Institut de beaute
                </Link>
              </li>
              <li>
                <Link
                  href="/recherche?category=spa"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Spa & Hammam
                </Link>
              </li>
            </ul>
          </div>

          {/* Villes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Villes populaires
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/recherche?city=casablanca"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Casablanca
                </Link>
              </li>
              <li>
                <Link
                  href="/recherche?city=rabat"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Rabat
                </Link>
              </li>
              <li>
                <Link
                  href="/recherche?city=marrakech"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Marrakech
                </Link>
              </li>
              <li>
                <Link
                  href="/recherche?city=tanger"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Tanger
                </Link>
              </li>
            </ul>
          </div>

          {/* Pro & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Professionnels
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/pro/inscription"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Inscrire mon salon
                </Link>
              </li>
              <li>
                <Link
                  href="/a-propos"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  A propos
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {APP_NAME}. Tous droits reserves.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link
              href="/mentions-legales"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Mentions legales
            </Link>
            <Link
              href="/confidentialite"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Confidentialite
            </Link>
            <Link
              href="/cgv"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
